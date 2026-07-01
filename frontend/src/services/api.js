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
 *
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method
 * @param {string} path   — path appended to API_BASE (must start with /)
 * @param {object} [body] — optional request body (serialised to JSON)
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
  // For list endpoints the body should always be JSON. If it isn't (e.g. an
  // Azure error page), fall back to an empty object so non-2xx detection still
  // works and array guards in components protect the render.
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`)
  }
  // Ensure callers that expect an array never receive null/undefined.
  return data ?? []
}

// ── Event configuration ──────────────────────────────────────────────────────

/** GET /api/event/config — returns the event config document. */
export const getEventConfig = () => request('GET', '/event/config')

/** POST /api/event/config — creates or replaces the event config document. */
export const updateEventConfig = (data) => request('POST', '/event/config', data)

// ── Templates ────────────────────────────────────────────────────────────────

/** GET /api/templates — returns all custom templates stored in Cosmos DB. */
export const getTemplates = () => request('GET', '/templates')

/** GET /api/templates/{id} — returns a single template by ID. */
export const getTemplateById = (id) =>
  request('GET', `/templates/${encodeURIComponent(id)}`)

/** POST /api/templates — creates a new custom template. */
export const addTemplate = (data) => request('POST', '/templates', data)

/** PUT /api/templates/{id} — updates an existing custom template. */
export const updateTemplate = (id, data) =>
  request('PUT', `/templates/${encodeURIComponent(id)}`, data)

// ── Guests ───────────────────────────────────────────────────────────────────

/** GET /api/guests — returns all guest records (admin only). */
export const getGuests = () => request('GET', '/guests')

/** POST /api/guests — creates a new guest record. */
export const addGuest = (data) => request('POST', '/guests', data)

/**
 * PUT /api/guests/{id} — partially updates a guest record.
 * Only the fields present in `data` are modified.
 */
export const updateGuest = (id, data) =>
  request('PUT', `/guests/${encodeURIComponent(id)}`, data)

// ── Invitations & confirmation ───────────────────────────────────────────────

/**
 * GET /api/invite/{id}
 *
 * Returns the guest record, event config, personalised invite link, and
 * a pre-encoded WhatsApp deep-link URL — all in one call.
 * Used by both the public invitation page and the admin guest table.
 */
export const generateInviteLink = (guestId) =>
  request('GET', `/invite/${encodeURIComponent(guestId)}`)

/**
 * POST /api/confirm/{id}
 *
 * Marks a guest as confirmed. Idempotent — safe to call multiple times.
 * Returns the updated guest document.
 */
export const confirmAttendance = (guestId) =>
  request('POST', `/confirm/${encodeURIComponent(guestId)}`)

