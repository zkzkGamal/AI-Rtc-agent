# AI-RTC-Agent: Real-Time Voice Streaming via WebRTC

A real-time voice streaming platform built with **WebRTC**, **aiortc**, and **React**. Captures browser audio, streams it to a Python backend over WebRTC, detects speech with **Voice Activity Detection (VAD)**, and saves each utterance as a WAV file — forming the foundation for an intelligent AI call agent.

## 🎯 Overview

AI-RTC-Agent is a full-stack audio pipeline that establishes a WebRTC peer connection between a React frontend and a Python aiohttp backend. The server processes incoming audio in real-time using VAD to segment speech from silence, then persists each detected utterance as a standalone WAV file.

**What's Implemented:**
- 🎤 Real-time audio capture & streaming via WebRTC (audio-only)
- 🎙️ Voice Activity Detection (VAD) using `webrtcvad`
- 💾 Automatic utterance segmentation & WAV file saving
- 🔄 Session-based processing with isolated per-user state
- 🌐 CORS-enabled REST API for SDP exchange
- ⚡ Fully async architecture (`asyncio` + `aiohttp`)
- 🎨 React frontend with connection status & audio visualizer

**Planned (Not Yet Implemented):**
- 🧠 LLM integration (GPT-4 / Claude) for AI reasoning
- 📢 Speech-to-Text (STT) for transcription
- 💬 Text-to-Speech (TTS) for agent responses
- 📊 Real-time transcript display
- 🔊 Agent audio playback via WebRTC

## 📁 Project Structure

```
AI-RTC-Agent/
├── server/                        # Python WebRTC backend
│   ├── main.py                   # aiohttp server, SDP signaling, session mgmt
│   ├── audio_processor.py        # AudioSession: VAD, buffering, WAV saving
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Dev/test dependencies
│   ├── README.md                 # Server documentation
│   └── utterances/               # Saved WAV files (per-session, gitignored)
│
├── client/                        # React web frontend
│   ├── src/
│   │   ├── App.jsx               # Main app shell — orchestrates session lifecycle
│   │   ├── App.css               # Styling
│   │   ├── main.jsx              # React entry point
│   │   ├── components/
│   │   │   ├── AudioVisualizer.jsx   # Animated audio ring
│   │   │   ├── ControlButtons.jsx    # Start/Stop call buttons
│   │   │   └── StatusDisplay.jsx     # Connection status & session info
│   │   └── services/
│   │       ├── api.js            # REST API calls (create session, send offer)
│   │       └── webrtc.js         # WebRTC peer connection management
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite dev server (port 3000)
│   ├── index.html                # HTML template
│   └── README.md                 # Client documentation
│
├── agent/                         # AI agent module (placeholder)
│   ├── __init__.py
│   └── README.md
│
├── mcp/                           # Model Context Protocol (placeholder)
│   ├── __init__.py
│   └── README.md
│
├── .env.example                   # Environment variable template
├── .gitignore
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── LICENSE                        # MIT License
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- No external API keys required for the current version

### 1. Server Setup

```bash
cd server
pip install -r requirements.txt
python main.py
```

Server starts on `http://0.0.0.0:8080`

### 2. Client Setup

```bash
cd client
npm install
npm run dev
```

Client available at `http://localhost:3000`

### 3. Start a Session

1. Open browser to `http://localhost:3000`
2. Grant microphone permission
3. Click **Start** to connect to the server
4. Speak naturally — VAD detects your speech
5. After silence (~1s), utterance is saved as a WAV file
6. Click **Stop** to disconnect

**What Happens Under the Hood:**
1. Client creates a session via `GET /session`
2. WebRTC peer connection is established (audio-only)
3. Browser microphone audio streams to the server at 48 kHz
4. Server downsamples to 16 kHz and runs VAD on 30ms frames
5. Speech segments are buffered; silence triggers WAV save
6. Files are written to `server/utterances/<session_id>/utt_<timestamp>.wav`

## 🔧 Architecture

### Audio Processing Pipeline
```
Browser Microphone (48 kHz)
  ↓
WebRTC PeerConnection (audio track)
  ↓
Server: _consume_audio_track()
  ↓  Converts av.AudioFrame → int16 PCM
  ↓
AudioSession.add_frame()
  ↓  Downsamples 48kHz → 16kHz (3:1 decimation)
  ↓
webrtcvad (30ms frames, aggressiveness=3)
  ↓
┌─── Speech detected ───┐
│  Accumulate in buffer  │
└────────────────────────┘
  ↓ (silence ≥ 1.0s)
Save utterance → WAV file
  ↓
Reset buffers → continue listening
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **48 kHz capture** | WebRTC/Opus native rate; highest fidelity for downstream STT |
| **16 kHz VAD** | `webrtcvad` optimal rate; proven reliable |
| **3:1 decimation** | Simple, low-latency downsample for VAD (not for recording) |
| **Aggressiveness 3** | Most aggressive VAD filtering — reduces false positives |
| **1.0s silence threshold** | Balances natural pauses vs. utterance boundaries |
| **WAV at 48 kHz** | Raw audio saved at full quality for future STT processing |
| **numpy `.tobytes()`** | Correct PCM serialization (avoids `struct.pack` endian issues) |

## 📋 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
LOG_LEVEL=INFO

# Audio Processing
VAD_AGGRESSIVENESS=2          # 0-3, higher = more aggressive
SILENCE_THRESHOLD=1.0         # seconds of silence before saving
AUDIO_SAMPLE_RATE=48000       # WebRTC audio rate (Hz)
VAD_SAMPLE_RATE=16000         # VAD processing rate (Hz)

# CORS
CORS_ORIGINS=*
ALLOWED_ORIGINS=http://127.0.0.1:3000,http://localhost:3000

# Output
UTTERANCES_DIR=./utterances

# Client
VITE_SERVER_URL=http://127.0.0.1:8080
```

## 📦 Dependencies

### Server (`server/requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| **aiortc** | ≥1.9.0 | WebRTC implementation (peer connections, SDP, media) |
| **aiohttp** | ≥3.9.0 | Async HTTP server framework |
| **aiohttp-cors** | ≥0.7.0 | CORS middleware |
| **python-socketio** | ≥5.9.0 | WebSocket support |
| **webrtcvad** | ≥2.0.10 | Voice Activity Detection |
| **numpy** | ≥1.26.0 | Audio array operations & PCM conversion |
| **scipy** | ≥1.10.0 | Audio resampling utilities |
| **python-dotenv** | ≥1.0.0 | Environment variable loading |
| **pydantic** | ≥2.0.0 | Data validation & settings |
| **redis** | ≥4.5.0 | Session caching (optional) |

### Client (`client/package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | ^18.3.1 | UI library |
| **react-dom** | ^18.3.1 | React DOM renderer |
| **vite** | ^5.4.2 | Build tool & dev server |
| **@vitejs/plugin-react** | ^4.3.1 | Vite React plugin |

## 📊 Output

### Saved Utterances
Each detected speech segment is saved as a WAV file:

```
server/utterances/<session_id>/
├── utt_1715612345000.wav
├── utt_1715612348500.wav
└── utt_1715612352100.wav
```

### WAV File Properties
| Property | Value |
|----------|-------|
| Format | WAV (uncompressed) |
| Channels | 1 (Mono) |
| Sample Rate | 48,000 Hz |
| Bit Depth | 16-bit |
| Encoding | PCM signed int16, little-endian |

## 🔌 API Endpoints

### `GET /session`

Create a new voice session.

**Response:**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### `POST /session/{session_id}/offer`

Exchange SDP offer/answer to establish a WebRTC connection.

**Request:**
```json
{
  "sdp": "v=0\no=...",
  "type": "offer"
}
```

**Response:**
```json
{
  "sdp": "v=0\no=...",
  "type": "answer"
}
```

## 🛠️ Development

### Running Tests
```bash
# Install dev dependencies
cd server
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/ -v

# Client
cd client
npm run test
```

### Building for Production

```bash
# Client production build
cd client
npm run build
# Output → dist/
```

### Debugging

**Server Logs:**
```bash
# Set DEBUG level in main.py or via LOG_LEVEL env var
LOG_LEVEL=DEBUG python main.py
```

**Client DevTools:**
- Open browser DevTools → **Network** tab for SDP offer/answer
- **Console** for WebRTC connection state changes
- Check `pc.connectionState` in React state

## 🔐 Security Considerations

1. **CORS:** Currently allows all origins (`*`). Restrict in production:
   ```python
   cors = aiohttp_cors.setup(app, defaults={
       "https://yourdomain.com": aiohttp_cors.ResourceOptions(...)
   })
   ```

2. **HTTPS:** Required by browsers for `getUserMedia()` (microphone access) in production

3. **Rate Limiting:** Not yet implemented — add before public deployment

4. **Audio Storage:** WAV files are stored unencrypted; implement encryption for sensitive data

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS errors** | Ensure server running on `:8080`; check `ALLOWED_ORIGINS` |
| **No audio received** | Check microphone permissions in browser; verify server logs |
| **VAD not detecting speech** | Lower `VAD_AGGRESSIVENESS` (try 1 or 2); check audio levels |
| **Files not saving** | Check `server/utterances/` directory permissions |
| **Connection fails** | Verify both server (`:8080`) and client (`:3000`) are running |
| **Audio stuttering** | Check CPU usage; reduce network latency |
| **`struct.pack` errors** | Ensure using numpy `.tobytes()` (not manual packing) |

## 🗺️ Roadmap

- [ ] **STT Integration** — Speech-to-Text (Google Cloud Speech / Whisper / OpenAI)
- [ ] **LLM Processing** — AI reasoning with GPT-4 / Claude / Llama
- [ ] **TTS Synthesis** — Text-to-Speech for agent responses (Google Cloud TTS / ElevenLabs)
- [ ] **Agent Module** — Conversational AI agent with context memory
- [ ] **Audio Playback** — Send TTS audio back to client via WebRTC
- [ ] **Real-time Transcripts** — Live transcript display in the UI
- [ ] **MCP Integration** — Model Context Protocol for tool use
- [ ] **Docker Deployment** — Containerized deployment
- [ ] **WebSocket Events** — Real-time call events and status updates

## 📖 Documentation

- [Server README](./server/README.md) – Backend architecture & API details
- [Client README](./client/README.md) – Frontend setup & components
- [Agent README](./agent/README.md) – AI agent module (planned)
- [MCP README](./mcp/README.md) – Model Context Protocol (planned)
- [Contributing Guide](./CONTRIBUTING.md) – How to contribute
- [Development Guide](./DEVELOPMENT.md) – Development workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — See [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

Built by [zkzkGamal](https://github.com/zkzkGamal)

## 🙏 Acknowledgments

- [aiortc](https://github.com/aiortc/aiortc) – Python WebRTC implementation
- [webrtcvad](https://github.com/wiseman/py-webrtcvad) – Voice Activity Detection
- [React](https://react.dev) – UI framework
- [Vite](https://vitejs.dev) – Build tool & dev server

## 📞 Support

For issues, questions, or suggestions:
1. Check existing [GitHub Issues](https://github.com/zkzkGamal/AI-RTC-Agent/issues)
2. Create a new issue with detailed information
3. Include logs, error messages, and reproduction steps

---

**Last Updated:** May 2026
**Version:** 0.1.0
**Status:** Active Development — Core audio pipeline complete, AI integration in progress
