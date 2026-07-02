const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/preview/{eventId}/{guestId}
 *
 * Returns merged event + guest + template data required to render a full
 * invitation preview.  Used by both the admin "Preview" button and the
 * public invitation page.
 */
module.exports = async function (context, req) {
  const { eventId, guestId } = context.bindingData

  if (!eventId?.trim() || !guestId?.trim()) {
    context.res = { status: 400, body: { error: 'eventId and guestId are required.' } }
    return
  }

  try {
    const [guestContainer, eventContainer, templateContainer, pageContainer] = await Promise.all([
      getContainer(process.env.COSMOS_CONTAINER_GUESTS),
      getContainer(process.env.COSMOS_CONTAINER_EVENTS),
      getContainer(process.env.COSMOS_CONTAINER_TEMPLATES),
      getContainer((process.env.COSMOS_CONTAINER_INVITATION_PAGES ?? 'invitation-pages')),
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

    // Fetch the template if the event has one selected
    let template = null
    if (event.selectedTemplateId) {
      const { resources: templates } = await templateContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: event.selectedTemplateId }],
        })
        .fetchAll()
      template = templates[0] ?? null
    }

    // Fetch the invitation page — guest's pinned page takes priority over the active page
    let invitationPage = null
    try {
      if (guest.invitationPageId) {
        // Guest has a specific template assigned — fetch it directly
        const { resources: pinned } = await pageContainer.items
          .query({
            query:      'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: guest.invitationPageId }],
          })
          .fetchAll()
        invitationPage = pinned[0] ?? null
      }

      if (!invitationPage) {
        // Fall back to the active page for the event, then most recent
        const { resources: activePages } = await pageContainer.items
          .query({
            query:      'SELECT TOP 1 * FROM c WHERE c.eventId = @eventId AND c.isActive = true',
            parameters: [{ name: '@eventId', value: event.id }],
          })
          .fetchAll()
        if (activePages?.length) {
          invitationPage = activePages[0]
        } else {
          const { resources: pages } = await pageContainer.items
            .query({
              query:      'SELECT TOP 1 * FROM c WHERE c.eventId = @eventId ORDER BY c._ts DESC',
              parameters: [{ name: '@eventId', value: event.id }],
            })
            .fetchAll()
          invitationPage = pages[0] ?? null
        }
      }
    } catch (_) { /* non-fatal */ }

    const baseUrl    = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    const inviteLink = guest.inviteLink ?? `${baseUrl}/invite/${guest.id}`

    // Build token map for frontend rendering
    const palette   = event.colorPalette ?? {}
    const tokenMap  = {
      eventName:    event.name     ?? '',
      eventDate:    event.date     ?? '',
      eventTime:    event.time     ?? '',
      eventLocation: event.location ?? '',
      eventAddress: event.address  ?? '',
      category:     event.category ?? '',
      color1:       palette.color1 ?? '#6d28d9',
      color2:       palette.color2 ?? '#a78bfa',
      color3:       palette.color3 ?? '#ddd6fe',
      color4:       palette.color4 ?? '#1e1b4b',
      color5:       palette.color5 ?? '#ffffff',
      guestName:    guest.name     ?? '',
      guestSeats:   String(guest.seats ?? 1),
      customNotes:  guest.customNotes ?? '',
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
        tokenMap,
        inviteLink,
      },
    }
  } catch (err) {
    context.log.error('preview:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
