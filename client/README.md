# Client: AI-RTC-Agent Frontend

A modern React web interface for real-time voice streaming to the AI-RTC-Agent backend via WebRTC.

## Purpose

The client provides:
- **Voice Session Management** – Start/stop audio streaming sessions
- **WebRTC Connection** – Establish peer connections and stream microphone audio
- **Session Monitoring** – Display connection status, session ID, and errors
- **Audio Visualizer** – Animated mic indicator showing active/idle state

## Technology Stack

- **Framework:** React 18 (functional components, hooks)
- **Build Tool:** Vite 5
- **Styling:** Vanilla CSS3 (dark glassmorphism theme)
- **WebRTC:** Native browser `RTCPeerConnection` API
- **API:** Fetch API (REST)

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── AudioVisualizer.jsx    # Animated microphone with pulsing rings
│   │   ├── ControlButtons.jsx     # Start / Stop action buttons
│   │   └── StatusDisplay.jsx      # Connection status, session ID, errors
│   ├── services/
│   │   ├── api.js                 # Server API calls (createSession, sendOffer)
│   │   └── webrtc.js              # WebRTC lifecycle (connect, answer, close)
│   ├── App.jsx                    # Main app shell (orchestrates services + components)
│   ├── App.css                    # Global styles (dark glassmorphism theme)
│   └── main.jsx                   # React entry point
├── index.html                     # HTML shell
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration (port 3000)
└── README.md                      # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`

> Make sure the backend server is running on `http://localhost:8080`

### 3. Build for Production

```bash
npm run build
```

## Architecture

### Component + Service Pattern

```
App.jsx (orchestrator)
  ├── services/api.js          → REST calls to backend
  ├── services/webrtc.js       → RTCPeerConnection lifecycle
  ├── components/AudioVisualizer.jsx
  ├── components/StatusDisplay.jsx
  └── components/ControlButtons.jsx
```

### Session Flow

```
1. Click "Start"
2. api.createSession()         → GET /session → session_id
3. webrtc.createConnection()   → getUserMedia (mic) + RTCPeerConnection
4. api.sendOffer(id, offer)    → POST /session/{id}/offer → SDP answer
5. webrtc.applyAnswer(answer)  → Connection established
6. Audio streams to server     → Server runs VAD + saves utterances
7. Click "Stop"
8. webrtc.closeConnection()    → Close PC + stop mic tracks
```

## Services

### `services/api.js`

| Function | Description |
|----------|-------------|
| `createSession()` | `GET /session` → returns `session_id` |
| `sendOffer(sessionId, offer)` | `POST /session/{id}/offer` → returns SDP answer |

### `services/webrtc.js`

| Function | Description |
|----------|-------------|
| `createConnection(onStateChange)` | Creates `RTCPeerConnection`, gets microphone, generates SDP offer |
| `applyAnswer(pc, answer)` | Sets remote SDP description from server |
| `closeConnection(pc, stream)` | Closes peer connection and stops media tracks |

**WebRTC configuration:**
- ICE Server: `stun:stun.l.google.com:19302`
- Audio constraints: `echoCancellation`, `noiseSuppression`, `autoGainControl`, `sampleRate: 48000`
- ICE gathering timeout: 3 seconds

## Components

### `AudioVisualizer.jsx`

Animated microphone icon with three concentric pulsing rings. Shows `active` state when connected (green glow + ripple animation).

**Props:** `isActive: boolean`

### `StatusDisplay.jsx`

Shows connection status dot (color-coded), status message, session ID (monospace), and error banner.

**Props:** `status, statusMsg, sessionId, error`

### `ControlButtons.jsx`

Start (green) and Stop (red) buttons with hover effects and proper disabled states.

**Props:** `onStart, onStop, isConnected, isBusy`

## Styling

Dark glassmorphism theme with:
- Deep dark background (`#080c14`) with subtle radial gradients
- Frosted glass card (`backdrop-filter: blur(20px)`)
- Inter font family (Google Fonts)
- Color-coded status dots (idle/connecting/connected/error)
- Animated ring visualizer on active connection
- Responsive layout (mobile-friendly)

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Partial (WebRTC limitations) |
| Edge    | ✅ Full |

## Related Documentation

- [Main README](../README.md) – Project overview
- [Server README](../server/README.md) – Backend details
- [Agent Module](../agent/README.md) – Future AI agent logic

---

**Version:** 0.1.0  
**Last Updated:** May 2026
