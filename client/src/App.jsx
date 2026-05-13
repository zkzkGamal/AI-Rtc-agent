import { useState, useRef, useCallback } from 'react'
import './App.css'

const SERVER_URL = 'http://localhost:8080'
const STUN_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

// Connection state → dot style
const DOT_CLASS = {
  idle:       'idle',
  creating:   'connecting',
  connecting: 'connecting',
  connected:  'connected',
  error:      'error',
  stopping:   'connecting',
}

// Microphone icon SVG
const MicIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6 8a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z"/>
  </svg>
)

export default function App() {
  // ── State ──────────────────────────────────────────────────────────
  const [status, setStatus]       = useState('idle')          // idle | creating | connecting | connected | error | stopping
  const [statusMsg, setStatusMsg] = useState('Not connected')
  const [sessionId, setSessionId] = useState(null)
  const [error, setError]         = useState(null)

  // ── Refs (not re-render triggers) ─────────────────────────────────
  const pcRef          = useRef(null)   // RTCPeerConnection
  const localStreamRef = useRef(null)   // MediaStream from microphone

  // ── Derived booleans for button enable/disable ────────────────────
  const isConnected  = status === 'connected'
  const isBusy       = status === 'creating' || status === 'connecting' || status === 'stopping'

  // ── Start session ─────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    setError(null)
    setStatus('creating')
    setStatusMsg('Creating session…')

    try {
      // 1. Create server-side session
      const sessionRes = await fetch(`${SERVER_URL}/session`)
      if (!sessionRes.ok) throw new Error(`Server error: ${sessionRes.status}`)
      const { session_id } = await sessionRes.json()
      setSessionId(session_id)
      setStatusMsg('Session created – requesting microphone…')

      // 2. Request microphone access (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      setStatusMsg('Microphone ready – connecting…')
      setStatus('connecting')

      // 3. Create RTCPeerConnection with STUN
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS })
      pcRef.current = pc

      // Add audio track to the connection
      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream))

      // Monitor connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        if (state === 'connected') {
          setStatus('connected')
          setStatusMsg('Connected – listening…')
        } else if (state === 'failed' || state === 'closed') {
          setStatus('error')
          setStatusMsg('Connection lost')
          setError('WebRTC connection failed or was closed.')
        }
      }

      // ICE candidate errors (non-fatal, just log)
      pc.onicecandidateerror = (e) => {
        console.warn('ICE candidate error:', e.errorText)
      }

      // 4. Create offer and set local description
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering to complete (or timeout after 5s)
      await waitForIceGathering(pc, 5000)

      // 5. Send offer to server
      const offerRes = await fetch(`${SERVER_URL}/session/${session_id}/offer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sdp:  pc.localDescription.sdp,
          type: pc.localDescription.type,
        }),
      })
      if (!offerRes.ok) throw new Error(`Offer error: ${offerRes.status}`)
      const answer = await offerRes.json()

      // 6. Apply server's SDP answer
      await pc.setRemoteDescription(new RTCSessionDescription(answer))

    } catch (err) {
      console.error('Start error:', err)
      setError(err.message || 'Unknown error')
      setStatus('error')
      setStatusMsg('Connection failed')
      _cleanup()
    }
  }, [])

  // ── Stop session ─────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    setStatus('stopping')
    setStatusMsg('Disconnecting…')
    _cleanup()
    setTimeout(() => {
      setStatus('idle')
      setStatusMsg('Not connected')
      setSessionId(null)
      setError(null)
    }, 400)
  }, [])

  // ── Internal cleanup ──────────────────────────────────────────────
  function _cleanup() {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* Header */}
      <header className="app-header">
        <h1>Voice AI Agent</h1>
        <p>Real-time audio streaming via WebRTC</p>
      </header>

      {/* Main card */}
      <main className="agent-card">

        {/* Animated visualizer */}
        <div className={`visualizer ${isConnected ? 'active' : ''}`}>
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="visualizer-core">
            <MicIcon />
          </div>
        </div>

        {/* Status info */}
        <div className="status-block">
          <div className="status-row">
            <span className={`status-dot ${DOT_CLASS[status] || 'idle'}`} />
            <span className="status-label">Status</span>
            <span className="status-value">{statusMsg}</span>
          </div>

          {sessionId && (
            <div className="status-row" style={{ alignItems: 'flex-start' }}>
              <span className="status-dot" style={{ marginTop: 5 }} />
              <span className="status-label">Session</span>
              <span className="session-id">{sessionId}</span>
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="btn-row">
          <button
            id="btn-start"
            className="btn btn-start"
            onClick={handleStart}
            disabled={isConnected || isBusy}
            aria-label="Start voice session"
          >
            🎙 Start
          </button>
          <button
            id="btn-stop"
            className="btn btn-stop"
            onClick={handleStop}
            disabled={!isConnected && !isBusy}
            aria-label="Stop voice session"
          >
            ⏹ Stop
          </button>
        </div>

      </main>

      <footer className="app-footer">
        Audio only · 48 kHz · WebRTC + VAD · Utterances saved server-side
      </footer>

    </div>
  )
}

// ── Helper: wait for ICE gathering to finish ─────────────────────────────────
function waitForIceGathering(pc, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') { resolve(); return; }
    const onStateChange = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', onStateChange)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', onStateChange)
    setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', onStateChange)
      resolve()   // resolve anyway after timeout; use whatever candidates gathered
    }, timeoutMs)
  })
}
