const { getContainer } = require('../shared/cosmosClient')

/**
 * POST /api/guests
 *
 * Creates a new guest record and pre-generates their personalised
 * invitation link.
 *
 * Required body fields:
 *   name      (string)  — guest's full name
 *   whatsapp  (string)  — WhatsApp number including country code, e.g. 5491112345678
 *   seats     (number)  — number of seats reserved (≥ 1)
 */
module.exports = async function (context, req) {
  const { name, whatsapp, seats } = req.body ?? {}

  if (!name?.trim()) {
    context.res = { status: 400, body: { error: 'Guest name is required.' } }
    return
  }
  if (!whatsapp?.trim()) {
    context.res = { status: 400, body: { error: 'WhatsApp number is required.' } }
    return
  }

  const seatCount = parseInt(seats, 10)
  if (!Number.isFinite(seatCount) || seatCount < 1) {
    context.res = {
      status: 400,
      body: { error: 'Seats must be a positive integer (≥ 1).' },
    }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)

    const guestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const baseUrl = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')

    const doc = {
      id: guestId,
      name: name.trim(),
      // Strip spaces, dashes, parentheses from the WhatsApp number so it
      // can be used directly in wa.me URLs.
      whatsapp: whatsapp.replace(/[\s\-()]/g, ''),
      seats: seatCount,
      confirmed: false,
      inviteLink: `${baseUrl}/invite/${guestId}`,
      createdAt: new Date().toISOString(),
    }

    const { resource } = await container.items.create(doc)

    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: resource,
    }
  } catch (err) {
    context.log.error('addGuest:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
