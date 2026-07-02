const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/whatsapp/{eventId}/{guestId}
 *
 * Generates a pre-filled WhatsApp deep-link for a specific guest+event pair.
 * Returns { whatsappUrl, message }.
 */
module.exports = async function (context, req) {
  const { eventId, guestId } = context.bindingData

  if (!eventId?.trim() || !guestId?.trim()) {
    context.res = { status: 400, body: { error: 'eventId and guestId are required.' } }
    return
  }

  try {
    const [guestContainer, eventContainer] = await Promise.all([
      getContainer(process.env.COSMOS_CONTAINER_GUESTS),
      getContainer(process.env.COSMOS_CONTAINER_EVENTS),
    ])

    const [{ resources: guests }, { resources: events }] = await Promise.all([
      guestContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: guestId.trim() }],
        })
        .fetchAll(),
      eventContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: eventId.trim() }],
        })
        .fetchAll(),
    ])

    if (!guests?.length) {
      context.res = { status: 404, body: { error: 'Guest not found.' } }
      return
    }
    if (!events?.length) {
      context.res = { status: 404, body: { error: 'Event not found.' } }
      return
    }

    const guest = guests[0]
    const event = events[0]

    const baseUrl    = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    const inviteLink = guest.inviteLink ?? `${baseUrl}/invite/${guest.id}`
    const seatLabel  = guest.seats === 1 ? 'seat' : 'seats'

    const lines = [
      `Hello ${guest.name}, you have ${guest.seats} ${seatLabel} reserved for ${event.name}.`,
    ]
    if (event.date) lines.push(`📅 ${event.date}${event.time ? ` at ${event.time}` : ''}`)
    if (event.location) lines.push(`📍 ${event.location}`)
    if (guest.customNotes) lines.push(`📝 ${guest.customNotes}`)
    lines.push(`Please confirm your attendance here: ${inviteLink}`)

    const message     = lines.join('\n')
    const whatsappUrl = `https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(message)}`

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { whatsappUrl, message, guest, event },
    }
  } catch (err) {
    context.log.error('whatsappMsg:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
