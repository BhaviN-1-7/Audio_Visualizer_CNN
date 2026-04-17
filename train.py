from pathlib import Path
import sys
import pandas as pd
import numpy as np
import modal
import torch
import torchaudio
from torch.utils.data import Dataset,DataLoader
import torch.nn as nn   
import torchaudio.transforms as T
from model import AudioCNN
import torch.optim as optim
from torch.optim.lr_scheduler import OneCycleLR
from tqdm import tqdm
from torch.utils.tensorboard import SummaryWriter
#modal app and image setup

app = modal.App("CNN_AudioClassification")#name

image=(modal.Image.debian_slim()#small debian image(base os)
       .pip_install_from_requirements("requirements.txt")#python deps
       .apt_install(["wget","unzip","ffmpeg","libsndfile1"])#system deps for audio processing
       .run_commands([
           "cd /tmp && wget https://github.com/karolpiczak/ESC-50/archive/master.zip -O esc50.zip",
           "cd /tmp && unzip esc50.zip",
           "mkdir -p /opt/esc50-data",
           "cp -r /tmp/ESC-50-master/* /opt/esc50-data/",
           "rm -rf /tmp/esc50.zip /tmp/ESC-50-master"
       ])#dataset
       .add_local_python_source("model"))#modal

# Volumes = persistent cloud storage for data and model weights
volume=modal.Volume.from_name("esc50-data",create_if_missing=True) 
model_volume=modal.Volume.from_name("esc-model",create_if_missing=True)


# Custom dataset to load ESC-50 audio files and preprocess them
class ESC50Dataset(Dataset):
    def __init__(self, data_dir, metadata_file,split="train",transform=None):
        
        super().__init__()
        
        self.data_dir = Path(data_dir)
        self.metadata = pd.read_csv(metadata_file)
        self.split=split #train or val
        self.transform = transform #data aug or feature extraction

        if split=="train":
            self.metadata=self.metadata[self.metadata["fold"]!=5]
        else:
            self.metadata=self.metadata[self.metadata["fold"]==5]
        self.classes=sorted(self.metadata["category"].unique())
        self.class_to_idx={cls: idx for idx,cls in enumerate(self.classes)}
        self.metadata['label']=self.metadata['category'].map(self.class_to_idx)

    def __len__(self):
        return len(self.metadata)
        
    def __getitem__(self,idx):
        row=self.metadata.iloc[idx]
        audio_path=self.data_dir/ "audio" / row["filename"]

        waveform,sample_rate = torchaudio.load(audio_path)
       
        # If stereo → convert to mono by averaging channels
        if waveform.shape[0]>1:
                waveform=torch.mean(waveform,dim=0,keepdim=True)
            
        if self.transform:
                spectrogram=self.transform(waveform)
        else:
                spectrogram=waveform
        # Return spectrogram tensor and integer label
        return spectrogram,row["label"]

def mixup_data(x, y):#x is features,y is labels
     lam=np.random.beta(0.2,0.2)
     
     batch_size=x.size(0)
     index=torch.randperm(batch_size).to(x.device)
     
     mixed_x=lam*x+ (1-lam)*x[index,:]#70% of 1st audio clip + 30% of second audio clip

     y_a,y_b=y,y[index]
     return mixed_x,y_a,y_b,lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)

# This function contains:
#  - STANDARD PyTorch steps (transforms, dataloaders, device)
#  - PROJECT-SPECIFIC steps (ESC-50 paths, dataset setup)

@app.function(image=image,gpu="A10",volumes={"/data": volume,"/models": model_volume},timeout=60*60*3)
def train():

    from datetime import datetime
    timestamp=datetime.now().strftime("%Y%m%d_%H%M%S")
    log_dir=f'/models/tensorboard_logs/run_{timestamp}'
    writer=SummaryWriter(log_dir)


    esc50_dir=Path("/opt/esc50-data")

    #using torchaudio transforms, hyperparameters are decided from other projects
    train_transform = nn.Sequential(
        T.MelSpectrogram(sample_rate=22050,n_fft=1024,hop_length=512, n_mels=128,f_min=0,f_max=11025),
        T.AmplitudeToDB(), #convert to decibel scale
        T.FrequencyMasking(freq_mask_param=30),#augmentation: randomly masking frequency bands
        T.TimeMasking(time_mask_param=80) #augmentation: randomly masking time frames
    )

    val_transform = nn.Sequential(
        T.MelSpectrogram(sample_rate=22050,n_fft=1024,hop_length=512, n_mels=128,f_min=0,f_max=11025),
        T.AmplitudeToDB()
    )

    train_dataset=ESC50Dataset(data_dir=esc50_dir,metadata_file=esc50_dir/"meta"/"esc50.csv",split="train",transform=train_transform)
    
    #send to the preprocess class and create training dataset

    val_dataset=ESC50Dataset(data_dir=esc50_dir,metadata_file=esc50_dir/"meta"/"esc50.csv",split="test",transform=val_transform)

    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    #common PyTorch patterns for batching data
    train_dataloader=DataLoader(train_dataset,batch_size=32,shuffle=True)

    test_dataloader=DataLoader(val_dataset,batch_size=32,shuffle=False)
    
    # Move training to GPU if available
    device=torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model=AudioCNN(num_classes=len(train_dataset.classes))
    model.to(device)  

    # HYPERPARAMETERS & LOSS SETUP

    num_epochs = 100  

    # Standard classification loss, but with label smoothing to reduce overconfidence
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)  


    # Optimizer — AdamW is a variant of Adam with weight decay
    optimizer = optim.AdamW(model.parameters(), lr=0.0005, weight_decay=0.01)

    # Learning rate scheduler — adjusts lr dynamically during training
    scheduler = OneCycleLR(
        optimizer,
        max_lr=0.002,
        epochs=num_epochs,
        steps_per_epoch=len(train_dataloader),
        pct_start=0.1
    )
    # OneCycleLR is a well-known scheduler for stable convergence


    best_accuracy = 0.0  # To track best model performance across epochs

    print("Starting training")

    # TRAINING LOOP

    for epoch in range(num_epochs):
        model.train() #model is the object of AudioCNN after seding the training dataset and set to use device gpu(modal)
        epoch_loss = 0.0

        # Progress bar for visual feedback
        progress_bar = tqdm(train_dataloader, desc=f'Epoch {epoch+1}/{num_epochs}')
        
        # BATCH TRAINING

        for data, target in progress_bar:
            # Move data and labels to GPU (if available)
            data, target = data.to(device), target.to(device)

            # Apply Mixup data augmentation randomly (70% chance) to make the model good for sounds with background noise
            if np.random.random() > 0.7:

                data, target_a, target_b, lam = mixup_data(data, target)
                output = model(data)
                loss = mixup_criterion(criterion, output, target_a, target_b, lam)
            else:
                # forward pass and calculate normal loss
                output = model(data)
                loss = criterion(output, target)

            optimizer.zero_grad()  # STANDARD: reset gradients from previous step
            loss.backward()        # STANDARD: compute gradients via backpropagation
            optimizer.step()       # STANDARD: update model weights
            scheduler.step()       # STANDARD: update learning rate dynamically

            epoch_loss += loss.item()  # Accumulate batch losses
            progress_bar.set_postfix({'Loss': f'{loss.item():.4f}'})  # Show current batch loss

        # LOGGING TRAIN LOSS

        avg_epoch_loss = epoch_loss / len(train_dataloader)
        
        writer.add_scalar('Loss/Train', avg_epoch_loss, epoch)  # TensorBoard logging
        writer.add_scalar('Learning_Rate', optimizer.param_groups[0]['lr'], epoch)

        # VALIDATION LOOP
        
        model.eval()  # STANDARD: disable dropout/batchnorm updates during eval

        correct = 0
        total = 0
        val_loss = 0

        with torch.no_grad():  # STANDARD: no gradient tracking in validation
            for data, target in test_dataloader:
                data, target = data.to(device), target.to(device)
                outputs = model(data)
                loss = criterion(outputs, target)
                val_loss += loss.item()

                # Get predicted class index from model output
                _, predicted = torch.max(outputs.data, 1)
                total += target.size(0)  # Count total validation samples
                correct += (predicted == target).sum().item()  # Count correct predictions

        accuracy = 100 * correct / total  # Validation accuracy percentage
        avg_val_loss = val_loss / len(test_dataloader)

        # Log validation metrics

        writer.add_scalar('Loss/Validation', avg_val_loss, epoch)
        writer.add_scalar('Accuracy/Validation', accuracy, epoch)

        # Print metrics for human monitoring
        print(f'Epoch {epoch+1} Loss: {avg_epoch_loss:.4f}, Val Loss: {avg_val_loss:.4f}, Accuracy: {accuracy:.2f}%')

        # SAVE BEST MODEL

        if accuracy > best_accuracy:
            best_accuracy = accuracy
            torch.save({
                'model_state_dict': model.state_dict(),
                'accuracy': accuracy,
                'epoch': epoch,
                'classes': train_dataset.classes  # PROJECT-SPECIFIC: save label mapping
            }, '/models/best_model.pth')  # PROJECT-SPECIFIC: save path on Modal volume
            print(f'New best model saved: {accuracy:.2f}%')

    writer.close()  # Close TensorBoard writer after training

    print(f'Training completed! Best accuracy: {best_accuracy:.2f}%')



@app.local_entrypoint()
def main():
    train.remote()
  