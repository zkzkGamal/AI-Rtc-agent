# AI-RTC-Agent: Intelligent Real-Time Voice AI Call Agent

A comprehensive real-time voice AI call agent platform built with **WebRTC**, **aiortc**, **React**, and advanced AI/ML capabilities. Create intelligent conversational agents that can listen, understand, think, and respond in real-time.

## 🎯 Overview

AI-RTC-Agent is a full-stack intelligent call agent system that combines real-time WebRTC communication with cutting-edge AI/ML technologies:
- **STT (Speech-to-Text)** – Convert user speech to text in real-time
- **LLM (Large Language Model)** – AI-powered understanding and reasoning
- **TTS (Text-to-Speech)** – Natural voice synthesis for agent responses
- **WebRTC** – Ultra-low-latency audio/video communication

**Key Features:**
- 🎤 Real-time voice communication via WebRTC (audio + video)
- 🧠 AI-powered call agent with LLM reasoning
- 📢 Speech-to-Text (STT) for accurate voice recognition
- 💬 Text-to-Speech (TTS) for natural agent responses
- 🎙️ Voice Activity Detection (VAD) for intelligent listening
- 💾 Call recording and transcript storage
- 🔄 Session-based processing with context awareness
- 🌐 CORS-enabled API for scalable deployment
- ⚡ Built with modern async/await patterns
- 🎨 React frontend with real-time transcripts and status

## 📁 Project Structure

```
AI-RTC-Agent/
├── server/                    # Python WebRTC backend
│   ├── main.py               # WebRTC signaling server
│   ├── audio_processor.py    # Audio processing & VAD
│   ├── stt_engine.py         # Speech-to-Text integration
│   ├── llm_engine.py         # LLM AI reasoning engine
│   ├── tts_engine.py         # Text-to-Speech synthesis
│   ├── agent.py              # AI call agent orchestration
│   ├── requirements.txt       # Python dependencies
│   └── utterances/           # Call recordings (per-session)
│
├── client/                    # React web frontend
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── components/
│   │   │   ├── CallInterface.jsx  # Call UI
│   │   │   ├── TranscriptPanel.jsx # Real-time transcripts
│   │   │   └── AgentStatus.jsx     # Agent status display
│   │   ├── App.css           # Styling
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   └── index.html            # HTML template
│
├── agent/                     # AI agent module
│   ├── __init__.py
│   ├── base_agent.py         # Base agent class
│   ├── prompts.py            # LLM system prompts
│   └── memory.py             # Call memory & context
│
├── mcp/                       # Model Context Protocol
│   ├── __init__.py
│   └── server.py
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** (for server)
- **Node.js 18+** (for client)
- **API Keys:** OpenAI, Google Cloud, or alternative providers
- **GCP Credentials:** JSON file for Google Cloud services

### 1. Setup API Credentials

```bash
# Create .env file
cp .env.example .env

# Add your API keys
OPENAI_API_KEY=sk-...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

### 2. Server Setup

```bash
cd server
pip install -r requirements.txt
python main.py
```

Server starts on `http://0.0.0.0:8080`

### 3. Client Setup

```bash
cd client
npm install
npm run dev
```

Client available at `http://localhost:5173`

### 4. Start a Call

1. Open browser to `http://localhost:5173`
2. Grant microphone permission
3. Click **Start Call** to connect to AI agent
4. Speak naturally – agent listens and responds
5. View real-time transcripts
6. Click **End Call** to disconnect

**What Happens:**
- Your speech is captured via WebRTC
- STT converts speech to text
- LLM processes your message and generates response
- TTS converts response to natural speech
- Agent's voice plays back via WebRTC
- Full transcript is saved

Transcripts and recordings saved to `server/utterances/<session_id>/`

## 🔧 Architecture

### AI Call Agent Flow
```
User Audio (WebRTC)
  ↓
VAD + Audio Buffering
  ↓
STT (Speech → Text)
  ↓
LLM Processing (Understanding + Reasoning)
  ↓
Agent Decision + Response Generation
  ↓
TTS (Text → Speech Synthesis)
  ↓
Audio Playback (WebRTC)
  ↓
Call Recording & Transcripts
```

### Complete Processing Pipeline

1. **Audio Capture** – Get 48kHz audio frames from WebRTC
2. **Voice Detection** – VAD identifies speech segments
3. **Audio Buffering** – Collect speech frames until silence
4. **STT Conversion** – Convert audio to text (Google Cloud Speech-to-Text / Whisper / OpenAI)
5. **LLM Processing** – AI model understands intent and generates response (GPT-4 / Claude / Llama)
6. **Agent Context** – Maintain conversation history and context
7. **TTS Synthesis** – Convert agent response to speech (Google Cloud TTS / ElevenLabs)
8. **Audio Playback** – Send synthesized audio via WebRTC
9. **Recording** – Store call audio and transcripts
10. **Analytics** – Track conversation metrics and quality

## 📋 Configuration

### AI Service Credentials

Set environment variables in `.env`:

```bash
# OpenAI (LLM)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo

# Google Cloud (STT + TTS)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GCP_PROJECT_ID=your-project-id

# Alternative: ElevenLabs TTS
ELEVENLABS_API_KEY=sk-...
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Agent Configuration
AGENT_NAME=Assistant
AGENT_PERSONALITY=helpful,friendly,professional
AGENT_SYSTEM_PROMPT=You are a helpful AI assistant for customer service.
```

## 📦 Dependencies

### Server (`server/requirements.txt`)

**WebRTC & Networking:**
- **aiortc** (≥1.9.0) – WebRTC implementation
- **aiohttp** (≥3.9.0) – Async HTTP server
- **aiohttp-cors** (≥0.7.0) – CORS support

**Audio Processing:**
- **webrtcvad** (≥2.0.10) – Voice Activity Detection
- **numpy** (≥1.26.0) – Numerical operations

**AI/ML Engines:**
- **openai** (≥1.0.0) – LLM (GPT-4, GPT-3.5, etc.)
- **google-cloud-speech** (≥2.18.0) – STT (Speech-to-Text)
- **google-cloud-texttospeech** (≥2.11.0) – TTS (Text-to-Speech)

**Alternative AI Providers:**
- **anthropic** – Claude LLM
- **elevenlabs** – Premium TTS
- **replicate** – Open-source model hosting
- **openai-whisper** – Local STT alternative

### Client (`client/package.json`)
- **react** (^18.3.1) – UI library
- **react-dom** (^18.3.1) – React DOM renderer
- **vite** (^5.4.2) – Build tool & dev server
- **@vitejs/plugin-react** (^4.3.1) – Vite React plugin

## 📊 Output & Analytics

### Call Recordings
Audio and transcripts are saved in:
```
server/utterances/<session_id>/
├── call_<timestamp>.wav        # Full call recording
├── user_<timestamp>.wav        # User audio segments
├── agent_<timestamp>.wav       # Agent audio segments
└── transcript_<timestamp>.json # Full conversation transcript
```

### Transcript Format
```json
{
  "session_id": "abc123",
  "start_time": "2024-05-13T14:30:00Z",
  "duration_seconds": 45,
  "turns": [
    {
      "speaker": "user",
      "text": "What's the weather like?",
      "timestamp": 0.5,
      "confidence": 0.95
    },
    {
      "speaker": "agent",
      "text": "The weather is sunny with a high of 75°F.",
      "timestamp": 3.2,
      "sentiment": "neutral"
    }
  ]
}
```

### Call Recording Properties
- Format: WAV (uncompressed) or MP3 (compressed)
- Channels: Stereo (2) – User + Agent
- Sample Rate: 48,000 Hz
- Bit Depth: 16-bit
- Encoding: PCM

## 🔌 API Endpoints

### POST `/offer`

Create a new WebRTC session and exchange SDP offer/answer.

**Request:**
```json
{
  "sdp": "v=0\no=...",
  "type": "offer",
  "agent_config": {
    "name": "Assistant",
    "system_prompt": "You are helpful..."
  }
}
```

**Response:**
```json
{
  "sdp": "v=0\no=...",
  "type": "answer",
  "session_id": "abc123"
}
```

### WebSocket: `/ws/call/{session_id}`

Real-time call events and transcript updates.

**Events:**
```json
{"type": "user_transcription", "text": "Hello there", "confidence": 0.95}
{"type": "agent_response", "text": "Hi! How can I help?", "timestamp": 2.5}
{"type": "call_ended", "duration": 45, "transcript": {...}}
```

## 🛠️ Development

### Running Tests
```bash
# Server
cd server
python -m pytest tests/ -v

# Client
cd client
npm run test
```

### Building for Production

**Server:**
```bash
# Already production-ready; consider using gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8080 main:app
```

**Client:**
```bash
cd client
npm run build
# Output: dist/
```

### Debugging

**Server Logs:**
```bash
# Set log level in main.py
logging.basicConfig(level=logging.DEBUG)
```

**Client DevTools:**
- Open browser DevTools (F12)
- Monitor Network tab for WebRTC offers/answers
- Check Console for JavaScript errors

## 🔐 Security Considerations

1. **CORS:** Restrict origins in production:
   ```python
   cors = aiohttp_cors.setup(app, defaults={
       "https://yourdomain.com": aiohttp_cors.ResourceOptions(...)
   })
   ```

2. **Authentication:** Add user authentication before session creation

3. **HTTPS:** Use TLS/SSL (required by browsers for WebRTC)

4. **API Keys:** Store securely using environment variables or secrets manager

5. **Audio Storage:** Implement encryption for stored call data

6. **Rate Limiting:** Implement rate limiting to prevent abuse

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS errors** | Ensure server has CORS headers; check origin URL |
| **No audio received** | Check microphone permissions; verify server logs |
| **STT not working** | Verify Google Cloud credentials; check API key |
| **LLM errors** | Verify OpenAI API key and model name |
| **TTS silence** | Check ElevenLabs/Google Cloud credentials |
| **Audio stuttering** | Reduce network latency; check CPU usage |
| **Files not saving** | Check `utterances/` directory permissions |

## 🚢 Deployment

### Docker (Recommended)

```dockerfile
# Server
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libopus-dev libvpx-dev
COPY server/requirements.txt .
RUN pip install -r requirements.txt
COPY server/ .
EXPOSE 8080
CMD ["python", "main.py"]
```

### Cloud Platforms

- **AWS Lambda** – Serverless deployment
- **Google Cloud Run** – Container-based serverless
- **Azure Functions** – Microsoft's serverless platform
- **Heroku** – PaaS deployment (if using Heroku Dyno)

### Environment Variables (Production)

```bash
OPENAI_API_KEY=sk-...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com
```

## 📖 Documentation

- [Server README](./server/README.md) – Backend details
- [Client README](./client/README.md) – Frontend details
- [Quick Start](./QUICKSTART.md) – 5-minute setup
- [Contributing Guide](./CONTRIBUTING.md) – How to contribute
- [Development Guide](./DEVELOPMENT.md) – Development workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License – See LICENSE file for details

## 👨‍💻 Author

Built by the AI-RTC-Agent team

## 🙏 Acknowledgments

- [aiortc](https://github.com/aiortc/aiortc) – WebRTC implementation
- [webrtcvad](https://github.com/wiseman/py-webrtcvad) – Voice Activity Detection
- [OpenAI](https://openai.com) – LLM and STT/TTS APIs
- [Google Cloud](https://cloud.google.com) – Speech and TTS services
- [React](https://react.dev) – UI framework
- [Vite](https://vitejs.dev) – Build tool

## 📞 Support

For issues, questions, or suggestions:
1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Create a new issue with detailed information
3. Include logs, error messages, and reproduction steps

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Status:** Production Ready
