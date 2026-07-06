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

    // Fetch the invitation page.
    // Priority:
    //   1. Guest's pinned page (invitationPageId)  — explicit custom page
    //   2. Guest's built-in templateId             — explicit built-in, skip custom fallback
    //   3. Event's active page                     — event-level default
    //   4. Event's most-recent page                — last resort
    let invitationPage = null

    // Use separate try blocks so a failure in one doesn't block the others.
    // Use point-reads (container.item(id, id)) to avoid cross-partition query issues.
    if (guest.invitationPageId) {
      try {
        const { resource: pinned } = await pageContainer
          .item(guest.invitationPageId, guest.invitationPageId)
          .read()
        invitationPage = pinned ?? null
      } catch (_) { /* non-fatal */ }
    }

    // Only fall back to the event's active/recent page when the guest has NO
    // explicit assignment. If guest.templateId is set, the built-in JSX
    // component should render and a custom page must not override it.
    if (!invitationPage && !guest.invitationPageId && !guest.templateId) {
      // Fall back to the active page for the event, then most recent
      try {
        const { resources: activePages } = await pageContainer.items
          .query({
            query:      'SELECT TOP 1 * FROM c WHERE c.eventId = @eventId AND c.isActive = true',
            parameters: [{ name: '@eventId', value: event.id }],
          })
          .fetchAll()
        if (activePages?.length) {
          const { resource: active } = await pageContainer
            .item(activePages[0].id, activePages[0].id)
            .read()
          invitationPage = active ?? null
        }
      } catch (_) { /* non-fatal */ }
    }

    if (!invitationPage && !guest.invitationPageId && !guest.templateId) {
      try {
        const { resources: pages } = await pageContainer.items
          .query({
            query:      'SELECT TOP 1 * FROM c WHERE c.eventId = @eventId ORDER BY c._ts DESC',
            parameters: [{ name: '@eventId', value: event.id }],
          })
          .fetchAll()
        if (pages?.length) {
          const { resource: recent } = await pageContainer
            .item(pages[0].id, pages[0].id)
            .read()
          invitationPage = recent ?? null
        }
      } catch (_) { /* non-fatal */ }
    }

    const baseUrl    = (process.env.APP_BASE_URL ?? '').replace(/\/$/, '')
    const inviteLink = guest.inviteLink ?? `${baseUrl}/invite/${guest.id}`

    // Apply per-guest built-in template override: if the guest has a templateId
    // set it takes precedence over the event-level templateId so the frontend
    // InvitationPoster renders the correct component.
    const eventForResponse = guest.templateId
      ? { ...event, templateId: guest.templateId }
      : event

    // Build token map for frontend rendering
    const palette   = eventForResponse.colorPalette ?? {}
    const tokenMap  = {
      eventName:    eventForResponse.name     ?? '',
      eventDate:    eventForResponse.date     ?? '',
      eventTime:    eventForResponse.time     ?? '',
      eventLocation: eventForResponse.location ?? '',
      eventAddress: eventForResponse.address  ?? '',
      category:     eventForResponse.category ?? '',
      color1:       palette.color1 ?? '#6d28d9',
      color2:       palette.color2 ?? '#a78bfa',
      color3:       palette.color3 ?? '#ddd6fe',
      color4:       palette.color4 ?? '#1e1b4b',
      color5:       palette.color5 ?? '#ffffff',
      guestName:    guest.name     ?? '',
      guestSeats:   String(guest.seats ?? 1),
      customNotes:  guest.customNotes ?? '',
      inviteLink,
      ...(eventForResponse.customTexts ?? {}),
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        guest,
        event: eventForResponse,
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
