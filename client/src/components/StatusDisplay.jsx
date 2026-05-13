/**
 * StatusDisplay.jsx — Shows connection status dot, label, session ID, and errors
 */

const DOT_CLASS = {
  idle: 'idle',
  creating: 'connecting',
  connecting: 'connecting',
  connected: 'connected',
  error: 'error',
  stopping: 'connecting',
}

export default function StatusDisplay({ status, statusMsg, sessionId, error }) {
  return (
    <div className="status-block">
      {/* Connection status */}
      <div className="status-row">
        <span className={`status-dot ${DOT_CLASS[status] || 'idle'}`} />
        <span className="status-label">Status</span>
        <span className="status-value">{statusMsg}</span>
      </div>

      {/* Session ID */}
      {sessionId && (
        <div className="status-row" style={{ alignItems: 'flex-start' }}>
          <span className="status-dot" style={{ marginTop: 5 }} />
          <span className="status-label">Session</span>
          <span className="session-id">{sessionId}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="error-banner" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
