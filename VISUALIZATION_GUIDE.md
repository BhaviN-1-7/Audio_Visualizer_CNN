# CNN Audio Visualizer - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture & Workflow](#architecture--workflow)
3. [Modal's Role](#modals-role)
4. [Frontend Components](#frontend-components)
5. [Visualization Types](#visualization-types)
6. [Understanding the Visualizations](#understanding-the-visualizations)
7. [Drawing Conclusions](#drawing-conclusions)
8. [Technical Implementation](#technical-implementation)
9. [Troubleshooting](#troubleshooting)

## Overview

The CNN Audio Visualizer is a web application that provides deep insights into how your Convolutional Neural Network processes audio data. It shows you exactly what happens inside your model when it analyzes sound, from the raw audio input to the final predictions.

### What You Can See:
- **Model Predictions**: Top 3 most likely audio classes with confidence scores
- **Input Spectrogram**: The mel-spectrogram representation your CNN actually processes
- **Audio Waveform**: Visual representation of the original audio signal
- **Feature Maps**: Internal representations from each convolutional layer
- **Layer-by-Layer Analysis**: How features evolve through the network

## Architecture & Workflow

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │    Modal     │    │   CNN Model     │
│   (Next.js)     │◄──►│   Endpoint   │◄──►│   (PyTorch)     │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         │                       │                    │
    ┌────▼────┐             ┌────▼────┐         ┌────▼────┐
    │ Upload  │             │ Process │         │ Feature │
    │ Audio   │             │ Audio   │         │ Extract │
    │ File    │             │ Base64  │         │ & Pred  │
    └─────────┘             └─────────┘         └─────────┘
```

### Complete Workflow:

1. **File Upload** → User selects a .wav audio file
2. **File Processing** → Frontend converts file to base64 encoding
3. **API Request** → Sends encoded audio to Modal endpoint
4. **Modal Processing** → Modal receives request and loads audio
5. **Audio Preprocessing** → Converts to proper format and sample rate
6. **CNN Inference** → Model processes audio and extracts features
7. **Response Generation** → Modal returns predictions and visualizations
8. **Frontend Rendering** → Displays all visualizations and results

## Modal's Role

### What is Modal?
Modal is a serverless platform that hosts your CNN model in the cloud. It handles:

- **GPU Access**: Provides A10G GPU for fast inference
- **Model Loading**: Loads your trained PyTorch model from persistent storage
- **API Endpoint**: Exposes your model as a REST API
- **Scaling**: Automatically scales up/down based on demand
- **CORS Handling**: Enables cross-origin requests from your frontend

### Modal Configuration in `main.py`:

```python
# Modal App Definition
app = modal.App("audio-cnn-inference")

# Docker Image with Dependencies
image = (modal.Image.debian_slim()
         .pip_install_from_requirements("requirements.txt")
         .apt_install(["libsndfile1"])
         .add_local_python_source("model"))

# GPU-Enabled Class
@app.cls(image=image, gpu="A10G", volumes={"/models": model_volume})
class AudioClassifier:
    
    # FastAPI Endpoint
    @modal.fastapi_endpoint(method="POST", docs=True)
    def inference(self, request: InferenceRequest):
        # Process audio and return predictions + visualizations
```

### Why Modal?
- **No Server Management**: No need to manage servers or infrastructure
- **GPU Access**: Expensive GPUs available on-demand
- **Scalability**: Handles multiple requests automatically
- **Cost Effective**: Pay only for compute time used

## Frontend Components

### Core Technologies:
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built UI components

### Key Components Structure:

```
src/app/
├── page.tsx              # Main application page
├── layout.tsx            # App layout wrapper
└── components/
    ├── FeatureMap.tsx    # Renders CNN feature maps
    ├── Waveform.tsx      # Audio waveform visualization
    ├── ColorScale.tsx    # Color legend for heatmaps
    └── ui/               # Basic UI components
        ├── card.tsx
        ├── button.tsx
        ├── badge.tsx
        └── progress.tsx
```

### Main Page Component (`page.tsx`):

```typescript
// State Management
const [vizData, setVizData] = useState<ApiResponse | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [fileName, setFileName] = useState("");
const [error, setError] = useState<string | null>(null);

// File Upload Handler
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Read file as ArrayBuffer
    // 2. Convert to base64
    // 3. Send to Modal API
    // 4. Process response
    // 5. Update UI state
}
```

## Visualization Types

### 1. **Top Predictions Section**

**Purpose**: Shows what your model thinks the audio contains

**Components**:
- **Class Names**: ESC-50 audio categories (e.g., "vacuum_cleaner", "dog", "rain")
- **Confidence Scores**: Probability percentages (0-100%)
- **Progress Bars**: Visual representation of confidence
- **Emojis**: Visual icons for each audio class

**Code Location**:
```typescript
// Lines 234-258 in page.tsx
{vizData.predictions.slice(0, 3).map((pred, i) => (
    <div key={pred.class} className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="text-md font-medium text-stone-700">
                {getEmojiForClass(pred.class)}{" "}
                <span>{pred.class.replaceAll("_", " ")}</span>
            </div>
            <Badge variant={i === 0 ? "default" : "secondary"}>
                {(pred.confidence * 100).toFixed(1)}%
            </Badge>
        </div>
        <Progress value={pred.confidence * 100} className="h-2" />
    </div>
))}
```

### 2. **Input Spectrogram**

**Purpose**: Shows the mel-spectrogram that your CNN actually processes

**What It Represents**:
- **X-axis**: Time (audio duration)
- **Y-axis**: Frequency (mel-scale frequencies)
- **Colors**: Amplitude/Energy (darker = higher energy)

**Technical Details**:
- **Mel-Spectrogram**: Perceptually-scaled frequency representation
- **Shape**: Usually 128 x N (128 mel bins, N time frames)
- **Processing**: Created using `torchaudio.transforms.MelSpectrogram`

**Code Location**:
```typescript
// Lines 263-280 in page.tsx
<FeatureMap
    data={vizData.input_spectrogram.values}
    title={`${vizData.input_spectrogram.shape.join(" x ")}`}
    spectrogram
/>
```

### 3. **Audio Waveform**

**Purpose**: Shows the raw audio signal over time

**What It Represents**:
- **X-axis**: Time
- **Y-axis**: Amplitude (-1 to +1)
- **Shape**: Shows the actual sound wave

**Code Location**:
```typescript
// Lines 281-293 in page.tsx
<Waveform
    data={vizData.waveform.values}
    title={`${vizData.waveform.duration.toFixed(2)}s * ${vizData.waveform.sample_rate}Hz`}
/>
```

### 4. **Convolutional Layer Outputs (Feature Maps)**

**Purpose**: Shows how your CNN transforms the input through each layer

**Structure**:
- **5 Main Layers**: conv1, layer1, layer2, layer3, layer4
- **Internal Blocks**: Individual residual blocks within each layer
- **Feature Evolution**: How patterns become more abstract

**Grid Layout**:
```typescript
// Lines 302-333 in page.tsx
<div className="grid grid-cols-5 gap-6">
    {main.map(([mainName, mainData]) => (
        <div key={mainName} className="space-y-4">
            {/* Main layer visualization */}
            <FeatureMap
                data={mainData.values}
                title={`${mainData.shape.join(" x ")}`}
            />
            
            {/* Expandable internal blocks */}
            {internals[mainName] && (
                <div className="h-80 overflow-y-auto">
                    {/* Individual block feature maps */}
                </div>
            )}
        </div>
    ))}
</div>
```

## Understanding the Visualizations

### Reading the Spectrogram

**Bright Areas (High Values)**:
- Strong frequency components
- Important audio features
- Energy concentrations

**Dark Areas (Low Values)**:
- Weak or absent frequencies
- Background noise
- Silent regions

**Patterns to Look For**:
- **Horizontal Lines**: Sustained tones (like sirens)
- **Vertical Lines**: Sharp transients (like clicks)
- **Blobs**: Short-duration sounds
- **Bands**: Harmonic structures (like musical notes)

### Reading Feature Maps

**Early Layers (conv1, layer1)**:
- **Simple Features**: Edges, textures, basic patterns
- **High Resolution**: More detailed spatial information
- **Local Patterns**: Small-scale audio features

**Middle Layers (layer2, layer3)**:
- **Complex Patterns**: Combinations of simple features
- **Medium Resolution**: Balanced detail and abstraction
- **Temporal Patterns**: Short-term audio sequences

**Late Layers (layer4)**:
- **Abstract Features**: High-level concepts
- **Low Resolution**: Highly compressed representations
- **Semantic Patterns**: Class-specific features

### Color Interpretation

**Feature Map Colors**:
- **Red/Bright**: High activation (important features detected)
- **Blue/Dark**: Low activation (feature not present)
- **Gradients**: Varying degrees of feature presence

**What High Activations Mean**:
- The neuron has detected its "preferred" pattern
- This feature is important for the current audio
- The model is "paying attention" to this aspect

## Drawing Conclusions

### Analyzing Predictions

**High Confidence (>80%)**:
- Model is very certain about the classification
- Strong, clear audio features present
- Good match to training data patterns

**Medium Confidence (40-80%)**:
- Some uncertainty in classification
- Mixed or ambiguous audio features
- Possible similarity to multiple classes

**Low Confidence (<40%)**:
- High uncertainty
- Unclear or noisy audio
- Possible out-of-distribution sample

### Analyzing Feature Maps

**Strong Activations in Early Layers**:
- Clear, well-defined audio features
- Good signal quality
- Recognizable patterns

**Progressive Abstraction**:
- Features should become more abstract in deeper layers
- Spatial resolution should decrease
- Semantic meaning should increase

**Unusual Patterns**:
- **All Low Activations**: Possible silent or very quiet audio
- **Random Noise**: Poor audio quality or out-of-distribution
- **Sparse Activations**: Unusual or rare audio patterns

### Debugging Your Model

**If Predictions Are Wrong**:
1. **Check Spectrogram**: Does it look like the expected class?
2. **Examine Early Layers**: Are basic features being detected?
3. **Look at Late Layers**: Are high-level features appropriate?
4. **Compare Confidences**: Is the model uncertain?

**If Feature Maps Look Strange**:
1. **Verify Input**: Is the audio file valid?
2. **Check Preprocessing**: Sample rate, normalization issues?
3. **Model Loading**: Is the correct model loaded?
4. **Data Distribution**: Is this similar to training data?

## Technical Implementation

### Data Flow

```typescript
// 1. File Upload
const file = event.target.files?.[0];

// 2. Convert to Base64
const arrayBuffer = reader.result as ArrayBuffer;
const base64String = btoa(
    new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte), ""
    )
);

// 3. API Request
const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_data: base64String }),
});

// 4. Process Response
const data: ApiResponse = await response.json();
setVizData(data);
```

### API Response Structure

```typescript
interface ApiResponse {
    predictions: Prediction[];           // Top 3 predictions
    visualization: VisualizationData;    // Feature maps
    input_spectrogram: LayerData;        // Input spectrogram
    waveform: WaveformData;             // Audio waveform
}

interface Prediction {
    class: string;      // ESC-50 class name
    confidence: number; // 0-1 probability
}

interface LayerData {
    shape: number[];    // Tensor dimensions
    values: number[][]; // 2D array of values
}
```

### Feature Map Processing

**Backend (Modal)**:
```python
# Extract feature maps during inference
output, feature_maps = self.model(spectrogram, return_feature_maps=True)

# Process each layer's output
for name, tensor in feature_maps.items():
    if tensor.dim() == 4:  # [batch, channels, height, width]
        # Average across channels
        aggregated_tensor = torch.mean(tensor, dim=1)
        # Remove batch dimension
        squeezed_tensor = aggregated_tensor.squeeze(0)
        # Convert to numpy and clean
        numpy_array = squeezed_tensor.cpu().numpy()
        clean_array = np.nan_to_num(numpy_array)
```

**Frontend (React)**:
```typescript
// Split layers into main and internal components
function splitLayers(visualization: VisualizationData) {
    const main: [string, LayerData][] = [];
    const internals: Record<string, [string, LayerData][]> = {};
    
    for (const [name, data] of Object.entries(visualization)) {
        if (!name.includes(".")) {
            main.push([name, data]);  // Main layers
        } else {
            const [parent] = name.split(".");
            if (!internals[parent]) internals[parent] = [];
            internals[parent].push([name, data]);  // Internal blocks
        }
    }
    
    return { main, internals };
}
```

### Visualization Rendering

**FeatureMap Component**:
```typescript
// Renders 2D arrays as heatmaps using HTML5 Canvas
const FeatureMap = ({ data, title, spectrogram = false }) => {
    // 1. Create canvas element
    // 2. Get 2D rendering context
    // 3. Map values to colors
    // 4. Draw pixels
    // 5. Apply color scale
};
```

**Waveform Component**:
```typescript
// Renders 1D audio data as line chart
const Waveform = ({ data, title }) => {
    // 1. Create SVG path
    // 2. Scale values to viewport
    // 3. Draw continuous line
    // 4. Add axis labels
};
```

## Troubleshooting

### Common Issues

**"Not Found" Error**:
- Check Modal endpoint URL
- Verify deployment status
- Ensure correct path (usually root `/`)

**CORS Error**:
- Add `docs=True` to `@modal.fastapi_endpoint`
- Redeploy Modal app
- Check browser console for details

**Slow Loading**:
- Large audio files take longer to process
- GPU cold start can add 10-20 seconds
- Check Modal app logs

**Visualization Not Showing**:
- Check browser console for JavaScript errors
- Verify API response structure
- Ensure all components are imported

### Debug Tools

**Browser Console**:
```javascript
// Check API requests
console.log("Making request to:", url);
console.log("Response status:", response.status);
console.log("Received data:", data);
```

**Modal Logs**:
```bash
# View Modal app logs
modal logs audio-cnn-inference

# Check deployment status
modal app list
```

**Network Tab**:
- Monitor API request/response
- Check payload size
- Verify response format

### Performance Optimization

**Frontend**:
- Implement loading states
- Add error boundaries
- Optimize re-renders with `useMemo`

**Backend**:
- Keep Modal app warm with regular requests
- Optimize model loading
- Compress response data

**Audio Processing**:
- Limit file size (< 10MB recommended)
- Use appropriate sample rates
- Validate audio format

---

## Conclusion

This CNN Audio Visualizer provides unprecedented insight into your model's decision-making process. By understanding how to read and interpret each visualization, you can:

- **Debug model behavior**
- **Identify training issues**
- **Understand feature learning**
- **Improve model architecture**
- **Validate model performance**

The combination of Modal's serverless infrastructure and React's interactive frontend creates a powerful tool for deep learning research and development.

Remember: The visualizations are only as good as your model's training. Use these insights to iteratively improve your CNN's performance and understanding of audio data.
