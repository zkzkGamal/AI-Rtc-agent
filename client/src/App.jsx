/**
 * App.jsx — Main application shell
 * Orchestrates the WebRTC voice session using services and components.
 */

import { useState, useRef, useCallback } from 'react'
import './App.css'

// Services
import { createSession, sendOffer } from './services/api'
import { createConnection, applyAnswer, closeConnection } from './services/webrtc'

// Components
import AudioVisualizer from './components/AudioVisualizer'
import StatusDisplay from './components/StatusDisplay'
import ControlButtons from './components/ControlButtons'

export default function App() {
  // ── State ──
  const [status, setStatus] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('Not connected')
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)

  // ── Refs (no re-renders) ──
  const pcRef = useRef(null)
  const streamRef = useRef(null)

  // ── Derived ──
  const isConnected = status === 'connected'
  const isBusy = status === 'creating' || status === 'connecting' || status === 'stopping'

  // ── Connection state handler ──
  const handleConnectionState = useCallback((state) => {
    if (state === 'connected') {
      setStatus('connected')
      setStatusMsg('Connected — listening for voice…')
    } else if (state === 'failed' || state === 'closed') {
      setStatus('error')
      setStatusMsg('Connection lost')
      setError('WebRTC connection failed or was closed.')
    }
  }, [])

  // ── Start ──
  const handleStart = useCallback(async () => {
    setError(null)
    setStatus('creating')
    setStatusMsg('Creating session…')

    try {
      // 1. Create server session
      const sid = await createSession()
      setSessionId(sid)
      setStatusMsg('Requesting microphone…')

      // 2. Create WebRTC connection + get microphone
      setStatus('connecting')
      setStatusMsg('Connecting…')
      const { pc, stream, offer } = await createConnection(handleConnectionState)
      pcRef.current = pc
      streamRef.current = stream

      // 3. Exchange SDP with server
      const answer = await sendOffer(sid, offer)
      await applyAnswer(pc, answer)

    } catch (err) {
      console.error('Start error:', err)
      setError(err.message || 'Unknown error')
      setStatus('error')
      setStatusMsg('Connection failed')
      closeConnection(pcRef.current, streamRef.current)
      pcRef.current = null
      streamRef.current = null
    }
  }, [handleConnectionState])

  // ── Stop ──
  const handleStop = useCallback(() => {
    setStatus('stopping')
    setStatusMsg('Disconnecting…')
    closeConnection(pcRef.current, streamRef.current)
    pcRef.current = null
    streamRef.current = null
    setTimeout(() => {
      setStatus('idle')
      setStatusMsg('Not connected')
      setSessionId(null)
      setError(null)
    }, 400)
  }, [])

  // ── Render ──
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Voice AI Agent</h1>
        <p>Real-time audio streaming via WebRTC</p>
      </header>

      <main className="agent-card">
        <AudioVisualizer isActive={isConnected} />
        <StatusDisplay
          status={status}
          statusMsg={statusMsg}
          sessionId={sessionId}
          error={error}
        />
        <ControlButtons
          onStart={handleStart}
          onStop={handleStop}
          isConnected={isConnected}
          isBusy={isBusy}
        />
      </main>

      <footer className="app-footer">
        Audio only · 48 kHz · WebRTC + VAD · Utterances saved server-side
      </footer>
    </div>
  )
}
