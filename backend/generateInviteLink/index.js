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
    const [guestContainer, eventContainer] = await Promise.all([
      getContainer(process.env.COSMOS_CONTAINER_GUESTS),
      getContainer(process.env.COSMOS_CONTAINER_EVENTS),
    ])

    const { resources: guests } = await guestContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (!guests?.length) {
      context.res = { status: 404, body: { error: 'Guest not found.' } }
      return
    }

    const guest = guests[0]

    // If the guest is linked to a specific event, load that event;
    // otherwise fall back to the legacy single event-config document.
    const eventLookupId = guest.eventId ?? 'event-config'
    const { resources: events } = await eventContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: eventLookupId }],
      })
      .fetchAll()

    const event = events[0] ?? {
      name: 'Our Event',
      date: '',
      time: '',
      location: '',
      address: '',
    }

    const baseUrl    = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    const inviteLink = guest.inviteLink ?? `${baseUrl}/invite/${guest.id}`
    const seatLabel  = guest.seats === 1 ? 'seat' : 'seats'

    // Build the personalised WhatsApp message.
    const lines = [
      `Hello ${guest.name}, you have ${guest.seats} ${seatLabel} reserved for ${event.name}.`,
    ]
    if (event.date) lines.push(`📅 ${event.date}${event.time ? ` at ${event.time}` : ''}`)
    if (event.location) lines.push(`📍 ${event.location}`)
    if (guest.customNotes) lines.push(`📝 ${guest.customNotes}`)
    lines.push(`Please confirm your attendance here: ${inviteLink}`)

    const whatsappMessage = lines.join('\n')
    const whatsappUrl     = `https://wa.me/${guest.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`

    // Fetch the template associated with the event (if any)
    let template = null
    if (event.selectedTemplateId) {
      try {
        const templateContainer = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)
        const { resources: tmpl } = await templateContainer.items
          .query({
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: event.selectedTemplateId }],
          })
          .fetchAll()
        template = tmpl[0] ?? null
      } catch (_) { /* non-fatal — template preview falls back gracefully */ }
    }

    // Fetch all invitation pages for this event so guests can browse/switch templates.
    // Returns lightweight metadata for all pages + full HTML for the default (active) one.
    let invitationPage  = null
    let invitationPages = []
    if (event.id) {
      try {
        const pageContainer = await getContainer(process.env.COSMOS_CONTAINER_INVITATION_PAGES)

        // Light metadata query for the template picker
        const { resources: allMeta } = await pageContainer.items
          .query({
            query: 'SELECT c.id, c.name, c.isActive FROM c WHERE c.eventId = @eventId ORDER BY c.isActive DESC, c._ts DESC',
            parameters: [{ name: '@eventId', value: event.id }],
          })
          .fetchAll()
        invitationPages = allMeta ?? []

        // Full HTML only for the default page (active one, or most recent)
        if (invitationPages.length > 0) {
          const defaultId = invitationPages.find((p) => p.isActive)?.id ?? invitationPages[0].id
          const { resources: full } = await pageContainer.items
            .query({
              query:      'SELECT * FROM c WHERE c.id = @id',
              parameters: [{ name: '@id', value: defaultId }],
            })
            .fetchAll()
          invitationPage = full[0] ?? null
        }
      } catch (_) { /* non-fatal */ }
    }

    // Build token map for the frontend renderer
    const palette  = event.colorPalette ?? {}
    const tokenMap = {
      eventName:     event.name     ?? '',
      eventDate:     event.date     ?? '',
      eventTime:     event.time     ?? '',
      eventLocation: event.location ?? '',
      eventAddress:  event.address  ?? '',
      category:      event.category ?? '',
      color1:  palette.color1 ?? '#6d28d9',
      color2:  palette.color2 ?? '#a78bfa',
      color3:  palette.color3 ?? '#ddd6fe',
      color4:  palette.color4 ?? '#1e1b4b',
      color5:  palette.color5 ?? '#ffffff',
      guestName:   guest.name    ?? '',
      guestSeats:  String(guest.seats ?? 1),
      customNotes: guest.customNotes ?? '',
      inviteLink,
      ...(event.customTexts ?? {}),
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        guest,
        event,
        template,
        invitationPage,
        invitationPages,
        tokenMap,
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
