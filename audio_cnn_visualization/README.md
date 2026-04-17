# 🎵 Audio Visualizer

A modern web application for visualizing CNN audio classification with real-time feature maps and neural network layer outputs.

![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🎵 **Audio Classification** - Upload WAV files for instant classification
- 📊 **Real-time Visualization** - View spectrograms, waveforms, and feature maps
- 🧠 **Neural Network Insights** - Explore convolutional layer outputs
- 🎨 **Modern UI** - Sleek neon green/black theme with smooth animations
- ⚡ **Fast Performance** - Built with Next.js 15 and React 19
- 📱 **Responsive Design** - Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Modal inference endpoint (or your own audio classification API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/audio-cnn-visualization.git
   cd audio-cnn-visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your inference endpoint:
   ```env
   NEXT_PUBLIC_INFERENCE_URL="your-inference-endpoint-url"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/audio-cnn-visualization)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/audio-cnn-visualization.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable:
     - `NEXT_PUBLIC_INFERENCE_URL`: Your inference endpoint URL
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## 📁 Project Structure

```
audio-cnn-visualization/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Main application page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── ColorScale.tsx
│   │   ├── FeatureMap.tsx
│   │   ├── GridBackground.tsx
│   │   └── Waveform.tsx
│   ├── lib/              # Utility functions
│   └── styles/           # Global styles
├── public/               # Static assets
├── .env.example          # Environment variables template
└── package.json          # Dependencies
```

## 🎨 Features in Detail

### Audio Upload
- Drag & drop or click to upload WAV files
- Real-time processing with loading states
- File validation and error handling

### Visualizations
- **Input Spectrogram**: Mel-frequency representation
- **Audio Waveform**: Time-domain visualization in neon green
- **Top Predictions**: Confidence scores with progress bars
- **Convolutional Layers**: Feature maps from each CNN layer
- **Internal Layers**: Conv, ReLU, BatchNorm, and MaxPool outputs

### UI/UX
- Smooth hover animations
- Glass-morphism effects
- Responsive grid layouts
- Accessible components
- Dark theme optimized

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # Run TypeScript type checking
npm run format:check # Check code formatting
npm run format:write # Format code with Prettier
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_INFERENCE_URL` | Audio classification API endpoint | Yes |

## 📝 API Integration

The app expects a POST endpoint that accepts:

**Request:**
```json
{
  "audio_data": "base64_encoded_wav_file"
}
```

**Response:**
```json
{
  "predictions": [
    { "class": "music", "confidence": 0.95 }
  ],
  "input_spectrogram": {
    "shape": [128, 431],
    "values": [[...]]
  },
  "waveform": {
    "values": [...],
    "duration": 4.0,
    "sample_rate": 22050
  },
  "visualization": {
    "block1": { "shape": [...], "values": [[...]] },
    "block1.conv": { "shape": [...], "values": [[...]] }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Create T3 App](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ and ☕
