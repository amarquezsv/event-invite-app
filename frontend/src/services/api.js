/**
 * API service layer.
 *
 * All requests are sent to the Azure Function App base URL defined
 * in the VITE_API_URL environment variable. This value is injected
 * at build time by Vite and must be set in `.env` for local dev and
 * in Azure Static Web Apps settings for production.
 */

const API_BASE = import.meta.env.VITE_API_URL

/**
 * Submit an RSVP to the backend.
 *
 * @param {{ name: string, email: string, attending: 'yes' | 'no' }} data
 * @returns {Promise<{ message: string }>}
 */
export async function submitRsvp(data) {
  const response = await fetch(`${API_BASE}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error || 'Failed to submit RSVP')
  }

  return response.json()
}

/**
 * Fetch a guest record by ID.
 *
 * @param {string} id - The Cosmos DB document ID of the guest.
 * @returns {Promise<object>} Guest RSVP document.
 */
export async function getGuest(id) {
  const response = await fetch(`${API_BASE}/guest/${encodeURIComponent(id)}`)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.error || 'Guest not found')
  }

  return response.json()
}
