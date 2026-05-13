# AI-RTC-Agent Client

The React-based web frontend for real-time voice communication.

## 📋 Overview

The client provides:
- **Intuitive UI** – Start/stop recording, room selection, status updates
- **WebRTC Integration** – Peer connection management
- **Audio Handling** – Local and remote audio playback
- **Real-time Updates** – Connection status and error messages

## 🏗️ Architecture

### Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** JavaScript (JSX)
- **Styling:** CSS
- **Deployment:** Static hosting or dev server

### Component Structure

```
App
├── UI Controls
│   ├── Room Input
│   ├── Start Button
│   ├── Stop Button
│   └── Status Display
├── Audio Elements
│   ├── Local Audio (input stream)
│   └── Remote Audio (output stream)
└── WebRTC Logic
    ├── Peer Connection
    ├── Offer/Answer Exchange
    └── Track Management
```

## 🚀 Getting Started

### Installation

```bash
cd client
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173` (Vite default)

### Build for Production

```bash
npm run build
# Output: dist/
```

### Preview Production Build

```bash
npm run preview
```

## 📁 File Structure

```
client/
├── index.html              # HTML template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies & scripts
├── package-lock.json      # Dependency lock file
├── src/
│   ├── main.jsx           # Entry point
│   ├── App.jsx            # Main React component
│   ├── App.css            # Styling
│   └── assets/            # Images, fonts, etc.
└── dist/                  # Build output (generated)
```

## 🎯 User Flow

```
1. Open App
   ↓
2. Grant Microphone Permission
   ↓
3. Enter Room Name (optional)
   ↓
4. Click "Start Recording"
   ↓
5. WebRTC Offer Created
   ↓
6. Offer Sent to Server
   ↓
7. Server Returns Answer
   ↓
8. Peer Connection Established
   ↓
9. Audio Streams In Real-Time
   ↓
10. Click "Stop" to Disconnect
```

## 🔧 Configuration

### Server Connection

Edit `src/App.jsx` to change server URL:

```javascript
// Default: http://127.0.0.1:8080
const SERVER_URL = "http://your-server.com:8080";
```

### STUN Servers

Change ICE servers for different network conditions:

```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
});
```

### Timeout Settings

Adjust connection timeout (in `App.jsx`):

```javascript
const OFFER_TIMEOUT = 10000; // 10 seconds
```

## 🎛️ Features

### Room Management

- Default room: `"default"`
- Custom room name input
- Case-sensitive room names
- Both users must join the same room

### Audio Controls

- **Start Recording** – Requests microphone, initiates WebRTC
- **Stop** – Closes connection, releases microphone

### Status Display

Real-time status messages:
- `"Press start and allow microphone access."`
- `"Microphone access granted."`
- `"Connecting..."`
- `"WebRTC connected, streaming audio..."`
- `"Stopped."`
- `"Error: ..."`

### Error Handling

Displays user-friendly error messages:
- Microphone access denied
- Server connection failure
- Invalid SDP
- Network errors

## 🔌 API Integration

### Server Endpoint: `POST /offer`

**Request:**
```javascript
const response = await fetch(`${SERVER_URL}/offer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    room: roomName,
    sdp: pc.localDescription.sdp,
    type: pc.localDescription.type
  })
});
```

**Response:**
```json
{
  "sdp": "v=0\no=...",
  "type": "answer"
}
```

## 📊 UI Components

### Buttons

| Button | State | Action |
|--------|-------|--------|
| Start | Enabled | Request mic, create offer |
| Stop | Disabled (until connected) | Close connection |

### Inputs

| Input | Placeholder | Default |
|-------|------------|---------|
| Room | "Room name" | "default" |

### Audio Elements

| Element | Purpose | Controls |
|---------|---------|----------|
| `<audio id="remoteAudio">` | Remote peer audio | autoplay, hidden |

### Status

- Real-time text display
- Color-coded in CSS (error = red, success = green)

## 🎨 Styling

### App.css Structure

- Reset/normalize styles
- Button styling (primary, disabled states)
- Input styling
- Status message styling
- Responsive design (mobile-friendly)

## 🔄 WebRTC Flow

### Initialization

```javascript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});
```

### Add Local Audio Track

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false
});
stream.getTracks().forEach(track => pc.addTrack(track, stream));
```

### Create & Send Offer

```javascript
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
const response = await fetch(`${SERVER_URL}/offer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    room: roomName,
    sdp: pc.localDescription.sdp,
    type: pc.localDescription.type
  })
});
```

### Receive & Set Answer

```javascript
const answer = await response.json();
await pc.setRemoteDescription(new RTCSessionDescription(answer));
```

### Handle Remote Audio

```javascript
pc.ontrack = event => {
  const remoteAudio = document.getElementById("remoteAudio");
  if (event.streams && event.streams[0]) {
    remoteAudio.srcObject = event.streams[0];
  }
};
```

### Cleanup

```javascript
pc.close();
stream.getTracks().forEach(t => t.stop());
```

## 🐛 Troubleshooting

### Browser Console Errors

**"Microphone access denied"**
- Grant permission when browser prompts
- Check browser settings → Privacy

**"TypeError: Failed to fetch"**
- Verify server is running
- Check server URL in App.jsx
- Verify CORS headers

**"ERR_FAILED"**
- Server connection issue
- Network firewall blocking port 8080
- CORS policy violation

### Audio Not Playing

**Check:**
1. Remote audio element has `autoplay` attribute
2. Peer connection is connected
3. Logs show "Track received"
4. Browser hasn't muted audio

**Solution:**
```javascript
// Check connection state
console.log("Connection state:", pc.connectionState);
console.log("Connection state:", pc.connectionState);
```

### Microphone Not Requested

**Cause:** User already denied permission

**Solution:**
- Clear browser storage: `DevTools → Application → Clear site data`
- Use different browser or incognito window

### Slow Audio / Lag

**Check:**
- Network latency: `ping <server>`
- CPU usage: Open Task Manager
- Server logs for errors

**Solutions:**
1. Move closer to server
2. Reduce network congestion
3. Use ethernet instead of WiFi

## 🚀 Production Build

### Build Optimizations

```bash
# Build with minification
npm run build

# Analyze bundle size
npm run build -- --debug
```

### Output Structure

```
dist/
├── index.html
├── assets/
│   ├── main.<hash>.js
│   ├── App.<hash>.css
│   └── vendor.<hash>.js
└── vite.svg
```

### Hosting Options

1. **Netlify** – Drag & drop `dist/` folder
2. **Vercel** – Auto-deploy from Git
3. **AWS S3 + CloudFront** – Static hosting
4. **GitHub Pages** – Free hosting
5. **nginx** – Self-hosted

### Environment-Specific Configuration

```javascript
// src/App.jsx
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
```

**.env.production**
```
VITE_SERVER_URL=https://api.yourdomain.com:8080
```

## 🔐 Security

### HTTPS Requirement

- WebRTC in production browsers **requires HTTPS**
- Self-signed certificates work for testing
- Use Let's Encrypt for free SSL certificates

### CORS

- Verify server CORS configuration
- Frontend must match server's allowed origins

### Audio Permissions

- Browser prompts user for microphone access
- Permission is per-origin
- Can be revoked in browser settings

## 🧪 Testing

### Manual Testing

1. **Single User Test:**
   - Open one tab
   - Start recording
   - Verify microphone permission
   - Check status changes

2. **Two User Test:**
   - Open two tabs/windows
   - Join same room
   - Both click start
   - Verify audio streams

3. **Error Handling Test:**
   - Deny microphone access
   - Disconnect server
   - Verify error messages

### Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Firefox | ✅ Full | Good support |
| Safari | ✅ Partial | iOS limitations |
| Edge | ✅ Full | Chromium-based |
| IE | ❌ None | Not supported |

## 📦 Dependencies

### Core Dependencies

- **react** (^18.3.1) – UI library
- **react-dom** (^18.3.1) – DOM rendering

### Development Dependencies

- **vite** (^5.4.2) – Build tool
- **@vitejs/plugin-react** (^4.3.1) – React integration
- **@types/react** (^18.3.1) – TypeScript types
- **@types/react-dom** (^18.3.1) – TypeScript types

### Native APIs Used

- `navigator.mediaDevices.getUserMedia()` – Microphone access
- `RTCPeerConnection` – WebRTC peer
- `RTCSessionDescription` – SDP handling
- `fetch()` – HTTP requests
- `HTMLAudioElement` – Audio playback

## 🔗 Related Documentation

- [Main README](../README.md)
- [Server README](../server/README.md)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## 📝 Code Examples

### Custom Server URL

```javascript
// src/App.jsx
const SERVER_URL = "https://api.example.com:8080";
```

### Add ICE Candidate Logging

```javascript
pc.addEventListener("icecandidate", event => {
  if (event.candidate) {
    console.log("ICE candidate:", event.candidate);
  }
});
```

### Connection State Monitoring

```javascript
pc.addEventListener("connectionstatechange", () => {
  console.log("Connection state:", pc.connectionState);
  if (pc.connectionState === "failed") {
    setStatus("Connection failed");
  }
});
```

---

**Version:** 1.0.0  
**Last Updated:** May 2026
