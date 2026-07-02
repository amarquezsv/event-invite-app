/**
 * API service layer.
 *
 * All requests target the Azure Function App whose base URL is provided
 * by the VITE_API_URL environment variable (injected at build time by Vite).
 *
 * Local development — add to frontend/.env:
 *   VITE_API_URL=http://localhost:7071/api
 *
 * Azure Static Web Apps — the /api prefix is automatically proxied to the
 * linked Function App, so VITE_API_URL can be left as "/api" in production.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

// ── Internal helper ─────────────────────────────────────────────────────────

/**
 * Thin wrapper around fetch that:
 *  - Serialises the body to JSON when present
 *  - Parses the JSON response
 *  - Throws a descriptive Error on non-2xx responses
 */
async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const res  = await fetch(`${API_BASE}${path}`, options)
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`)
  }
  return data ?? []
}

// ── Event configuration (legacy single-event) ────────────────────────────────
export const getEventConfig    = ()     => request('GET',  '/event/config')
export const updateEventConfig = (data) => request('POST', '/event/config', data)

// ── Events (multi-event) ─────────────────────────────────────────────────────
export const getEvents      = ()         => request('GET',    '/events')
export const getEventById   = (id)       => request('GET',    `/events/${encodeURIComponent(id)}`)
export const createEvent    = (data)     => request('POST',   '/events', data)
export const updateEventDef = (id, data) => request('PUT',    `/events/${encodeURIComponent(id)}`, data)
export const deleteEvent    = (id)       => request('DELETE', `/events/${encodeURIComponent(id)}`)

// ── Templates ────────────────────────────────────────────────────────────────
export const getTemplates    = ()         => request('GET',  '/templates')
export const getTemplateById = (id)       => request('GET',  `/templates/${encodeURIComponent(id)}`)
export const addTemplate     = (data)     => request('POST', '/templates', data)
export const updateTemplate  = (id, data) => request('PUT',  `/templates/${encodeURIComponent(id)}`, data)

// ── Guests ───────────────────────────────────────────────────────────────────
/** GET /api/guests — returns all guests, optionally filtered by eventId. */
export const getGuests   = (eventId) =>
  request('GET', eventId ? `/guests?eventId=${encodeURIComponent(eventId)}` : '/guests')
export const addGuest    = (data)     => request('POST',   '/guests', data)
export const updateGuest = (id, data) => request('PUT',    `/guests/${encodeURIComponent(id)}`, data)
export const deleteGuest = (id)       => request('DELETE', `/guests/${encodeURIComponent(id)}`)

// ── Invite / RSVP (public) ───────────────────────────────────────────────────
export const generateInviteLink  = (id) => request('GET',  `/invite/${encodeURIComponent(id)}`)
export const confirmAttendance   = (id) => request('POST', `/confirm/${encodeURIComponent(id)}`)

// ── Components ───────────────────────────────────────────────────────────────
export const getComponents      = ()         => request('GET',    '/components')
export const getComponentById   = (id)       => request('GET',    `/components/${encodeURIComponent(id)}`)
export const createComponent    = (data)     => request('POST',   '/components', data)
export const updateComponent    = (id, data) => request('PUT',    `/components/${encodeURIComponent(id)}`, data)
export const deleteComponent    = (id)       => request('DELETE', `/components/${encodeURIComponent(id)}`)

// ── Preview & WhatsApp ────────────────────────────────────────────────────────
export const generatePreview     = (eventId, guestId) =>
  request('GET', `/preview/${encodeURIComponent(eventId)}/${encodeURIComponent(guestId)}`)
export const generateWhatsAppMsg = (eventId, guestId) =>
  request('GET', `/whatsapp/${encodeURIComponent(eventId)}/${encodeURIComponent(guestId)}`)

