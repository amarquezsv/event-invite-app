const { getContainer } = require('../shared/cosmosClient')

/**
 * GET    /api/events/{id}  — get a single event by ID
 * PUT    /api/events/{id}  — update an existing event
 * DELETE /api/events/{id}  — delete an event
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData
  const method  = req.method.toUpperCase()

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Event ID is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)

    if (method === 'GET') {
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Event not found.' } }
        return
      }
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources[0],
      }
      return
    }

    if (method === 'PUT') {
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Event not found.' } }
        return
      }

      const existing = resources[0]
      const updates  = req.body ?? {}

      const updated = {
        ...existing,
        name:               updates.name?.trim()               ?? existing.name,
        category:           updates.category?.trim()           ?? existing.category,
        date:               updates.date?.trim()               ?? existing.date,
        time:               updates.time?.trim()               ?? existing.time,
        location:           updates.location?.trim()           ?? existing.location,
        address:            updates.address?.trim()            ?? existing.address,
        colorPalette:       updates.colorPalette               ?? existing.colorPalette,
        selectedTemplateId: updates.selectedTemplateId?.trim() ?? existing.selectedTemplateId,
        selectedComponents: Array.isArray(updates.selectedComponents)
          ? updates.selectedComponents
          : existing.selectedComponents,
        customTexts: updates.customTexts && typeof updates.customTexts === 'object'
          ? updates.customTexts
          : existing.customTexts,
        updatedAt: new Date().toISOString(),
      }

      const { resource } = await container.items.upsert(updated)
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
      return
    }

    if (method === 'DELETE') {
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Event not found.' } }
        return
      }

      await container.item(id.trim(), id.trim()).delete()
      context.res = { status: 204 }
      return
    }

    context.res = { status: 405, body: { error: 'Method not allowed.' } }
  } catch (err) {
    context.log.error('eventById:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
