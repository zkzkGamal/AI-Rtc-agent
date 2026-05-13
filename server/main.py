"""
main.py  –  AI-RTC-Agent backend server
Uses aiohttp + aiortc to handle WebRTC sessions.
Each user gets an isolated session with its own RTCPeerConnection and AudioSession.

Run:
    python main.py
Listens on 0.0.0.0:8080
"""

import asyncio
import json
import logging
import struct
import uuid
from dataclasses import dataclass, field
from typing import Dict, Optional

import aiohttp_cors
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack

from audio_processor import AudioSession

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Session registry
# ---------------------------------------------------------------------------

@dataclass
class Session:
    session_id: str
    pc: Optional[RTCPeerConnection] = None
    audio_session: Optional[AudioSession] = None
    tasks: list = field(default_factory=list)


# In-memory session store  { session_id → Session }
_sessions: Dict[str, Session] = {}


# ---------------------------------------------------------------------------
# Audio receive loop
# ---------------------------------------------------------------------------

async def _receive_audio(track: MediaStreamTrack, session: Session) -> None:
    """
    Continuously pull frames from the incoming WebRTC audio track,
    convert each av.AudioFrame to raw 16-bit mono PCM,
    and hand them off to the AudioSession for VAD + buffering.
    """
    logger.info(f"[{session.session_id}] Audio receive loop started")
    try:
        while True:
            try:
                frame = await track.recv()
            except Exception:
                # Track ended or peer disconnected
                break

            # av.AudioFrame → numpy → 16-bit mono PCM bytes
            # frame.format is usually 'fltp' (float32 planar) from browsers
            audio_array = frame.to_ndarray()           # shape: (channels, samples)
            if audio_array.ndim > 1:
                audio_array = audio_array[0]           # take first channel (mono)

            # Convert float32 to 16-bit PCM
            pcm_int16 = (audio_array * 32767).clip(-32768, 32767).astype("int16")
            pcm_bytes = struct.pack(f"<{len(pcm_int16)}h", *pcm_int16)

            sample_rate = frame.sample_rate or 48000
            await session.audio_session.add_frame(pcm_bytes, sample_rate)

    except asyncio.CancelledError:
        pass
    finally:
        logger.info(f"[{session.session_id}] Audio receive loop ended")
        if session.audio_session:
            await session.audio_session.close()


# ---------------------------------------------------------------------------
# Session cleanup
# ---------------------------------------------------------------------------

async def _cleanup_session(session_id: str) -> None:
    session = _sessions.pop(session_id, None)
    if session is None:
        return
    logger.info(f"[{session_id}] Cleaning up session")
    for task in session.tasks:
        task.cancel()
    if session.pc:
        await session.pc.close()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

async def handle_create_session(request: web.Request) -> web.Response:
    """
    GET /session
    Creates a new session, returns { session_id }
    """
    session_id = str(uuid.uuid4())
    _sessions[session_id] = Session(session_id=session_id)
    logger.info(f"[{session_id}] Session created")
    return web.json_response({"session_id": session_id})


async def handle_offer(request: web.Request) -> web.Response:
    """
    POST /session/{session_id}/offer
    Body: { sdp: string, type: "offer" }
    Sets up RTCPeerConnection for the session, returns SDP answer.
    """
    session_id = request.match_info["session_id"]

    if session_id not in _sessions:
        return web.json_response({"error": "Session not found"}, status=404)

    session = _sessions[session_id]

    # Parse offer
    try:
        body = await request.json()
        offer = RTCSessionDescription(sdp=body["sdp"], type=body["type"])
    except Exception as exc:
        logger.error(f"[{session_id}] Bad offer payload: {exc}")
        return web.json_response({"error": "Invalid offer payload"}, status=400)

    # Create AudioSession and PeerConnection
    session.audio_session = AudioSession(session_id=session_id)
    pc = RTCPeerConnection()
    session.pc = pc

    @pc.on("connectionstatechange")
    async def on_state_change():
        state = pc.connectionState
        logger.info(f"[{session_id}] Connection state → {state}")
        if state in ("failed", "closed", "disconnected"):
            await _cleanup_session(session_id)

    @pc.on("track")
    def on_track(track: MediaStreamTrack):
        if track.kind == "audio":
            logger.info(f"[{session_id}] Audio track received")
            loop = asyncio.get_event_loop()
            task = loop.create_task(_receive_audio(track, session))
            session.tasks.append(task)

    # SDP negotiation
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    logger.info(f"[{session_id}] SDP answer sent")
    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    })


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

def create_app() -> web.Application:
    app = web.Application()

    # Routes
    app.router.add_get("/session", handle_create_session)
    app.router.add_post("/session/{session_id}/offer", handle_offer)

    # CORS – allow all origins (restrict in production)
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods=["GET", "POST", "OPTIONS"],
        )
    })
    for route in list(app.router.routes()):
        cors.add(route)

    return app


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app = create_app()
    logger.info("Starting AI-RTC-Agent server on 0.0.0.0:8080")
    web.run_app(app, host="0.0.0.0", port=8080)
