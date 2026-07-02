const { getContainer } = require('../shared/cosmosClient')

/**
 * GET  /api/events  — list all events (excludes legacy single event-config doc)
 * POST /api/events  — create a new event
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)
      const { resources } = await container.items
        .query("SELECT * FROM c WHERE c.id != 'event-config' ORDER BY c._ts DESC")
        .fetchAll()
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources,
      }
    } catch (err) {
      context.log.error('getEvents:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'POST') {
    const {
      name, category, date, time, location, address,
      colorPalette, selectedTemplateId, selectedComponents, customTexts,
    } = req.body ?? {}

    if (!name?.trim()) {
      context.res = { status: 400, body: { error: 'Event name is required.' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)
      const doc = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: name.trim(),
        category: (category ?? 'other').trim(),
        date: (date ?? '').trim(),
        time: (time ?? '').trim(),
        location: (location ?? '').trim(),
        address: (address ?? '').trim(),
        colorPalette: colorPalette ?? {
          color1: '#6d28d9',
          color2: '#a78bfa',
          color3: '#ddd6fe',
          color4: '#1e1b4b',
          color5: '#ffffff',
        },
        selectedTemplateId: (selectedTemplateId ?? '').trim(),
        selectedComponents: Array.isArray(selectedComponents) ? selectedComponents : [],
        customTexts: customTexts && typeof customTexts === 'object' ? customTexts : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const { resource } = await container.items.create(doc)
      context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('createEvent:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
