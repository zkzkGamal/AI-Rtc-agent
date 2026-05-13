"""
audio_processor.py
Handles per-session audio buffering, VAD (Voice Activity Detection),
and saving speech utterances as WAV files.

Architecture inspired by the VoiceModule pattern:
  - Continuously receive PCM frames
  - Run VAD on every frame
  - When speech → accumulate in buffer
  - When silence ≥ threshold after speech → save utterance as WAV, reset, continue loop
  - On session close → flush any remaining audio
"""

import os
import time
import wave
import logging
import asyncio
import numpy as np

import webrtcvad

logger = logging.getLogger(__name__)

# ─── Constants ──────────────────────────────────────────────────────
# webrtcvad supports 8kHz, 16kHz, 32kHz, 48kHz
# We use 16kHz for VAD (proven reliable), downsample from 48kHz
VAD_SAMPLE_RATE = 16000
VAD_FRAME_DURATION_MS = 30                                         # 30ms frames (matches VoiceModule)
VAD_FRAME_BYTES = int(VAD_SAMPLE_RATE * VAD_FRAME_DURATION_MS / 1000) * 2  # 480 samples × 2 bytes = 960 bytes


class AudioSession:
    """
    Manages one user's audio stream:
    - Receives raw PCM frames (48 kHz, 16-bit, mono)
    - Downsamples to 16 kHz for VAD
    - Detects speech / silence boundaries
    - Saves each utterance to utterances/<session_id>/utt_<timestamp>.wav
    - After saving, resets and continues listening (loop)
    """

    def __init__(self, session_id: str, sample_rate: int = 48000, silence_threshold: float = 1.0):
        self.session_id = session_id
        self.sample_rate = sample_rate
        self.silence_threshold = silence_threshold   # seconds of silence before saving

        # VAD: aggressiveness 3 = most aggressive filtering (matches VoiceModule)
        self.vad = webrtcvad.Vad(3)

        # ── Buffers ──
        self._speech_buffer = bytearray()            # raw 48kHz PCM accumulated during speech
        self._vad_residue = bytearray()              # leftover bytes for 16kHz VAD framing

        # ── State machine ──
        self._is_speaking = False
        self._silence_start: float | None = None
        self._utterance_count = 0

        # ── Output ──
        self._output_dir = os.path.join("utterances", session_id)
        os.makedirs(self._output_dir, exist_ok=True)

        logger.info(f"[{self.session_id}] AudioSession created  →  {self._output_dir}")

    # ─── Public API ─────────────────────────────────────────────────

    async def add_frame(self, pcm_bytes: bytes, sample_rate: int) -> None:
        """
        Called for every audio frame from the WebRTC track.
        pcm_bytes:   raw 16-bit little-endian mono PCM at `sample_rate`
        sample_rate: typically 48000
        """
        if not pcm_bytes or len(pcm_bytes) < 2:
            return

        # ── Downsample 48kHz → 16kHz for VAD ──
        # Simple 3:1 decimation (prototype quality).
        # TODO: for production, use scipy.signal.resample_poly(x, 1, 3) for proper anti-aliasing.
        pcm_16k = self._decimate(pcm_bytes, sample_rate)

        # ── Feed to VAD in 30ms chunks ──
        self._vad_residue.extend(pcm_16k)

        # Process all complete 30ms frames in the residue
        while len(self._vad_residue) >= VAD_FRAME_BYTES:
            chunk = bytes(self._vad_residue[:VAD_FRAME_BYTES])
            del self._vad_residue[:VAD_FRAME_BYTES]

            try:
                is_speech = self.vad.is_speech(chunk, VAD_SAMPLE_RATE)
            except Exception as e:
                logger.warning(f"[{self.session_id}] VAD error: {e}")
                is_speech = False

            # ── State machine: speech/silence transitions ──
            if is_speech:
                if not self._is_speaking:
                    self._is_speaking = True
                    self._silence_start = None
                    logger.info(f"[{self.session_id}] 🎙️  Speech started")

                # Accumulate raw 48kHz audio
                self._speech_buffer.extend(pcm_bytes)
                self._silence_start = None

            else:
                if self._is_speaking:
                    # Include some trailing silence for natural cutoff
                    self._speech_buffer.extend(pcm_bytes)

                    if self._silence_start is None:
                        self._silence_start = time.monotonic()
                    else:
                        elapsed = time.monotonic() - self._silence_start
                        if elapsed >= self.silence_threshold:
                            # ── Save and reset (continue loop) ──
                            await self._save_utterance()
                            self._reset_buffers()
                            logger.info(f"[{self.session_id}] 🔇  Silence detected ({elapsed:.1f}s) → saved & reset, listening again...")

    async def close(self) -> None:
        """Flush remaining audio on session end."""
        if self._speech_buffer:
            logger.info(f"[{self.session_id}] Flushing remaining audio on close")
            await self._save_utterance()
        self._reset_buffers()
        logger.info(f"[{self.session_id}] AudioSession closed (total utterances: {self._utterance_count})")

    # ─── Private helpers ────────────────────────────────────────────

    def _decimate(self, pcm_bytes: bytes, source_rate: int) -> bytes:
        """
        Downsample by keeping every Nth sample.
        48kHz → 16kHz: N=3.  If source is already 16kHz, pass through.
        """
        ratio = source_rate // VAD_SAMPLE_RATE
        if ratio <= 1:
            return pcm_bytes

        samples = np.frombuffer(pcm_bytes, dtype=np.int16)
        decimated = samples[::ratio]
        return decimated.tobytes()

    async def _save_utterance(self) -> None:
        """Save the speech buffer as a WAV file."""
        if not self._speech_buffer:
            return

        self._utterance_count += 1
        timestamp = int(time.time() * 1000)
        filename = os.path.join(self._output_dir, f"utt_{timestamp}.wav")
        data = bytes(self._speech_buffer)
        duration = len(data) / (self.sample_rate * 2)  # 2 bytes per sample

        # Write in thread to avoid blocking the event loop
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, self._write_wav, filename, data)

        logger.info(
            f"[{self.session_id}] 💾  Utterance #{self._utterance_count} saved → {filename} "
            f"({len(data):,} bytes / {duration:.2f}s)"
        )

    def _write_wav(self, filename: str, data: bytes) -> None:
        with wave.open(filename, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)                   # 16-bit
            wf.setframerate(self.sample_rate)     # 48000 Hz
            wf.writeframes(data)

    def _reset_buffers(self) -> None:
        """Reset state to listen for the next utterance."""
        self._speech_buffer = bytearray()
        self._vad_residue = bytearray()
        self._is_speaking = False
        self._silence_start = None
