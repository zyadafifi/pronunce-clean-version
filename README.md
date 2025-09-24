# Clean Pronunciation App

A React-based pronunciation learning app with mobile-optimized interface and real-time audio recording with waveform visualization.

## Features

- 🎯 **Interactive Lessons**: Path-based lesson progression with visual lesson nodes
- 🎤 **Real-time Recording**: Audio recording with live waveform visualization
- 📱 **Mobile-First Design**: Optimized for iOS and Android devices
- 🔊 **Speech Recognition**: Integration with AssemblyAI for pronunciation scoring
- 🎨 **Modern UI**: Glassmorphism design with smooth animations

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure AssemblyAI API (optional):
   Create a `.env` file in the root directory:

   ```
   VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
   ```

   Get your API key from [AssemblyAI](https://www.assemblyai.com/)

4. Start the development server:
   ```bash
   npm run dev
   ```

### API Configuration

The app uses AssemblyAI for speech recognition and pronunciation scoring. If no API key is provided, the app will use fallback processing with simulated scores.

To get a real API key:

1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `VITE_ASSEMBLYAI_API_KEY`

## Building for Production

```bash
npm run build
```

## Mobile Compatibility

The app is fully optimized for mobile devices with:

- iOS Safari compatibility
- Android Chrome support
- Touch-optimized interface
- Responsive waveform visualization
- Hardware-accelerated animations

## Technologies Used

- React 19
- Vite
- React Router
- FontAwesome Icons
- AssemblyAI API
- Web Audio API
- CSS3 with modern features
