/**
 * api.js — API service for communicating with the backend
 */

const SERVER_URL = 'http://localhost:8080'

/**
 * Create a new voice session on the server.
 * @returns {Promise<string>} session_id
 */
export async function createSession() {
  const res = await fetch(`${SERVER_URL}/session`)
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`)
  const data = await res.json()
  return data.session_id
}

/**
 * Send an SDP offer to the server and get back an SDP answer.
 * @param {string} sessionId
 * @param {RTCSessionDescriptionInit} offer
 * @returns {Promise<RTCSessionDescriptionInit>} answer
 */
export async function sendOffer(sessionId, offer) {
  const res = await fetch(`${SERVER_URL}/session/${sessionId}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
  })
  if (!res.ok) throw new Error(`Offer failed: ${res.status}`)
  return res.json()
}
