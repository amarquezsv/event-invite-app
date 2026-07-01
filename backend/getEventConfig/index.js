const { getContainer } = require('../shared/cosmosClient')

/**
 * GET  /api/event/config  — read event configuration
 * POST /api/event/config  — create or replace event configuration
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: 'event-config' }],
        })
        .fetchAll()
      const config = resources[0] ?? {
        id: 'event-config',
        name: 'Our Special Day',
        description: 'Join us for a wonderful celebration.',
        location: 'Grand Ballroom',
        address: '123 Celebration Ave, City, State 00000',
        date: '',
        time: '',
        templateId: 'elegant',
      }
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: config,
      }
    } catch (err) {
      context.log.error('getEventConfig:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'POST') {
    const { name, description, location, address, date, time, templateId } =
      req.body ?? {}

    if (!name?.trim()) {
      context.res = { status: 400, body: { error: 'Event name is required.' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)
      const doc = {
        id: 'event-config',
        name: name.trim(),
        description: (description ?? '').trim(),
        location: (location ?? '').trim(),
        address: (address ?? '').trim(),
        date: (date ?? '').trim(),
        time: (time ?? '').trim(),
        templateId: (templateId ?? 'elegant').trim(),
        updatedAt: new Date().toISOString(),
      }
      const { resource } = await container.items.upsert(doc)
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('updateEventConfig:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
