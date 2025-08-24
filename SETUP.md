# Arena of Consciousness - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   # Option 1: Run both server and client together
   npm run dev:full
   
   # Option 2: Run separately in two terminals
   # Terminal 1:
   npm run server
   
   # Terminal 2:
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Allow camera and microphone permissions when prompted

## How It Works

### The Concept
- **Single Stream**: Only one person can be live at any time
- **No Authentication**: Anyone can go live instantly, no login required
- **Seizure Mechanism**: Anyone can take over the current stream by clicking "SEIZE CONTROL"
- **Ephemeral Consciousness**: Each stream represents a temporary moment of consciousness that can be interrupted at any time

### Features Implemented

1. **Go Live Button**: Click to start streaming immediately
2. **Stream Takeover**: Click "SEIZE CONTROL" to replace the current stream
3. **Dominance Counter**: Shows how long the current stream has been active
4. **Neural Map**: Displays connection count and recent seizure events
5. **Real-time Updates**: All viewers see changes instantly

### Technical Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Real-time Communication**: Socket.IO for signaling
- **Video Streaming**: WebRTC for peer-to-peer video
- **No Database**: Everything is ephemeral, stored only in memory

### Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone access
- HTTPS in production (for camera access)

## Deployment Notes

For production deployment:
1. Use HTTPS (required for camera access)
2. Configure proper STUN/TURN servers for WebRTC
3. Set up environment variables for production URLs
4. Consider using a process manager like PM2 for the server

## Philosophical Implementation

This implementation embodies the conceptual framework:
- **Autopoiesis**: The system self-generates through continuous stream replacement
- **Finitude**: Each consciousness (stream) is temporary and vulnerable
- **Anonymity**: No user accounts or persistent identity
- **Collective Emergence**: The "subject" emerges from the crowd's actions

The arena is now ready for consciousness to emerge and compete.
