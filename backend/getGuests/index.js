const { getContainer } = require('../shared/cosmosClient')

/**
 * GET  /api/guests  — list all guests
 * POST /api/guests  — create a new guest
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)
      const { resources } = await container.items
        .query('SELECT * FROM c ORDER BY c._ts DESC')
        .fetchAll()
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources,
      }
    } catch (err) {
      context.log.error('getGuests:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'POST') {
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
      context.res = { status: 400, body: { error: 'Seats must be a positive integer (≥ 1).' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)
      const guestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const baseUrl = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
      const doc = {
        id: guestId,
        name: name.trim(),
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
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
