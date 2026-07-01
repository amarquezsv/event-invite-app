const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/invite/{id}
 *
 * Returns everything the public invitation page needs in one call:
 *   - The guest record (name, seats, confirmed status)
 *   - The event configuration
 *   - The personalised invitation link
 *   - A pre-encoded WhatsApp deep-link URL ready to open in the app
 *
 * The WhatsApp message follows this format:
 *   "Hello <name>, you have <X> seat(s) reserved for <event>.
 *    📅 <date> at <time>  📍 <location>
 *    Please confirm: <link>"
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Guest ID is required.' } }
    return
  }

  try {
    // Fetch guest and event config in parallel for lower latency.
    const [guestContainer, eventContainer] = await Promise.all([
      getContainer(process.env.COSMOS_CONTAINER_GUESTS),
      getContainer(process.env.COSMOS_CONTAINER_EVENTS),
    ])

    const [{ resources: guests }, { resources: events }] = await Promise.all([
      guestContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll(),
      eventContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: 'event-config' }],
        })
        .fetchAll(),
    ])

    if (!guests?.length) {
      context.res = { status: 404, body: { error: 'Guest not found.' } }
      return
    }

    const guest = guests[0]
    const event = events[0] ?? {
      name: 'Our Event',
      date: '',
      time: '',
      location: '',
      address: '',
    }

    const baseUrl   = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    const inviteLink = guest.inviteLink ?? `${baseUrl}/invite/${guest.id}`
    const seatLabel  = guest.seats === 1 ? 'seat' : 'seats'

    // Build the personalised WhatsApp message.
    const lines = [
      `Hello ${guest.name}, you have ${guest.seats} ${seatLabel} reserved for ${event.name}.`,
    ]
    if (event.date) lines.push(`📅 ${event.date}${event.time ? ` at ${event.time}` : ''}`)
    if (event.location) lines.push(`📍 ${event.location}`)
    lines.push(`Please confirm your attendance here: ${inviteLink}`)

    const whatsappMessage = lines.join('\n')
    const whatsappUrl     = `https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        guest,
        event,
        inviteLink,
        whatsappUrl,
        whatsappMessage,
      },
    }
  } catch (err) {
    context.log.error('generateInviteLink:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
