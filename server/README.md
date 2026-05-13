# Server: AI-RTC-Agent Backend

The Python backend handles WebRTC audio connections, voice activity detection, and utterance recording.

## Purpose

The server is responsible for:
- **WebRTC Signaling** – Manage peer connections and SDP exchange via aiohttp
- **Audio Processing** – Capture and buffer user audio in real-time (48kHz mono PCM)
- **Voice Activity Detection** – Detect speech/silence boundaries using `webrtcvad`
- **Utterance Recording** – Save each speech segment as a WAV file per session

> **Note:** STT, LLM, and TTS integrations are planned for future implementation via the `agent/` and `mcp/` modules.

## Architecture

### Audio Pipeline

```
Browser Microphone (48kHz Opus)
  ↓
WebRTC RTCPeerConnection (aiortc)
  ↓
Audio Frame Capture (av.AudioFrame → numpy int16)
  ↓
Downsample 48kHz → 16kHz (3:1 decimation)
  ↓
VAD Processing (webrtcvad, 30ms frames, mode 3)
  ↓
Speech Buffering (raw 48kHz PCM)
  ↓
Silence ≥ 1s detected → Save as WAV → Reset → Continue listening
```

### Session Lifecycle

```
GET /session              → Create session (UUID)
POST /session/{id}/offer  → Exchange SDP, start audio consumer
   ↓
[Speech detected]         → Buffer audio
[1s silence]              → Save utterance WAV, reset, keep listening
[Speak again]             → Buffer new utterance (loop)
   ↓
[Connection closed]       → Flush remaining audio, cleanup session
```

## Project Structure

```
server/
├── main.py               # aiohttp server, WebRTC signaling, session management
├── audio_processor.py    # AudioSession: VAD, buffering, WAV saving
├── requirements.txt      # Production dependencies
├── requirements-dev.txt  # Development dependencies
├── utterances/           # Saved utterances (auto-created per session)
│   └── <session_id>/
│       ├── utt_<timestamp>.wav
│       └── ...
└── README.md             # This file
```

## Quick Start

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python main.py
```

Server listens on `http://0.0.0.0:8080`

## API Endpoints

### GET `/session`

Create a new voice session.

**Response:**
```json
{
  "session_id": "367763e3-c695-4f0d-b85d-10e3e9ce50b0"
}
```

### POST `/session/{session_id}/offer`

Exchange WebRTC SDP offer/answer for an existing session.

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

## Core Modules

### `main.py` – WebRTC Server

Handles session creation, SDP negotiation, and audio track consumption.

**Key components:**
- `Session` dataclass – Stores `RTCPeerConnection`, `AudioSession`, and background tasks
- `_consume_audio_track()` – Async loop that receives `av.AudioFrame`, converts to PCM bytes, feeds to `AudioSession`
- `_cleanup_session()` – Cancels tasks, closes peer connection, removes from registry

**Audio frame conversion:**
- Detects `int16` (from Opus/s16) vs `float32` (from flt/fltp) automatically
- Uses `numpy.tobytes()` for fast, correct byte conversion
- Extracts mono channel from planar audio

### `audio_processor.py` – AudioSession

Per-user audio processing with VAD and utterance saving.

**Key class: `AudioSession`**
- Receives raw 48kHz 16-bit mono PCM
- Downsamples to 16kHz via 3:1 decimation for VAD
- Uses `webrtcvad` (mode 3) with 30ms frames
- State machine: `idle → speaking → silence → save → idle` (continuous loop)
- Saves each utterance as WAV in `utterances/<session_id>/`

**Configuration:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `sample_rate` | 48000 | Incoming audio sample rate |
| `silence_threshold` | 1.0s | Silence duration before saving |
| VAD mode | 3 | Aggressiveness (0-3, 3 = most aggressive) |
| VAD frame | 30ms | Frame duration for VAD processing |

## Utterance Output

Utterances are saved in `utterances/<session_id>/`:

```
utterances/
└── 367763e3-c695-4f0d-b85d-10e3e9ce50b0/
    ├── utt_1778675221298.wav    # First utterance
    ├── utt_1778675225412.wav    # Second utterance
    └── ...                      # One WAV per speech segment
```

Each WAV file: 48kHz, 16-bit, mono PCM.

## Dependencies

| Package | Purpose |
|---------|---------|
| `aiortc` | WebRTC peer connections (SDP, ICE, media tracks) |
| `aiohttp` | Async HTTP server |
| `aiohttp-cors` | CORS middleware |
| `webrtcvad` | Voice activity detection |
| `numpy` | Audio array processing |

## Related Documentation

- [Main README](../README.md) – Project overview
- [Client README](../client/README.md) – Frontend details
- [Agent Module](../agent/README.md) – Future AI agent logic
- [MCP Module](../mcp/README.md) – Future MCP server

---

**Version:** 0.1.0  
**Last Updated:** May 2026
