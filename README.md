# Skyline Fallacy - Game Introduction

A Next.js web app featuring an immersive game introduction sequence with animated text effects and synchronized audio.

## Features

- 🎮 Interactive intro sequence with animated text
- 🎵 Synchronized audio playback
- ✨ DecryptedText component for text reveal effects
- 🎨 Custom neon styling with pixel art aesthetics
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the App

#### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
fallacy-ojas/
├── app/
│   ├── components/
│   │   └── DecryptedText.tsx    # Animated text component
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page with intro sequence
├── public/
│   └── assets/                  # Images, GIFs, and audio files
├── package.json
└── next.config.js
```

## Features Breakdown

### Title Card
- "Skyline" in pink (#fe019a) with subtle neon glow
- "Fallacy" in light blue (#66d9ff) with subtle neon glow
- Animated gif background (gif1.gif) fades in with the title

### Intro Slides
- Four narrative slides with DecryptedText animation
- Each slide features a scrambling text reveal effect
- Perfectly timed with background music

### Audio Sync
- Music starts muted and fades in with the first slide
- Slides are timed to match musical beats (138 BPM)
- All existing timing and synchronization preserved

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Motion (Framer Motion)** - Animation library
- **DecryptedText** - Custom text animation component from ReactBits

## License

All rights reserved.

