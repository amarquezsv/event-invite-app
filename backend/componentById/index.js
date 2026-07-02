const { getContainer } = require('../shared/cosmosClient')

/**
 * GET    /api/components/{id}  — get a single component
 * PUT    /api/components/{id}  — update a component
 * DELETE /api/components/{id}  — delete a component
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData
  const method  = req.method.toUpperCase()

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Component ID is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_COMPONENTS)

    if (method === 'GET') {
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Component not found.' } }
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
        context.res = { status: 404, body: { error: 'Component not found.' } }
        return
      }

      const existing = resources[0]
      const updates  = req.body ?? {}

      const updated = {
        ...existing,
        name:             updates.name?.trim()      ?? existing.name,
        type:             updates.type?.trim()      ?? existing.type,
        category:         updates.category?.trim()  ?? existing.category,
        defaultHtml:      updates.defaultHtml       ?? existing.defaultHtml,
        defaultCss:       updates.defaultCss        ?? existing.defaultCss,
        imageUrl:         updates.imageUrl !== undefined ? updates.imageUrl : existing.imageUrl,
        colorizable:      updates.colorizable !== undefined ? Boolean(updates.colorizable) : existing.colorizable,
        allowedPositions: Array.isArray(updates.allowedPositions)
          ? updates.allowedPositions
          : existing.allowedPositions,
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
        context.res = { status: 404, body: { error: 'Component not found.' } }
        return
      }

      await container.item(id.trim(), id.trim()).delete()
      context.res = { status: 204 }
      return
    }

    context.res = { status: 405, body: { error: 'Method not allowed.' } }
  } catch (err) {
    context.log.error('componentById:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
