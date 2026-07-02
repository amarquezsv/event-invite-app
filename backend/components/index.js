const { getContainer }    = require('../shared/cosmosClient')
const defaultComponents   = require('../shared/defaultComponents')

/**
 * GET  /api/components  — list all components (seeds defaults on first call)
 * POST /api/components  — create a custom component
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_COMPONENTS)
      const { resources } = await container.items
        .query('SELECT * FROM c ORDER BY c.category ASC, c.name ASC')
        .fetchAll()

      // Seed default components on first ever call
      if (resources.length === 0) {
        await Promise.all(
          defaultComponents.map((c) => container.items.upsert(c))
        )
        context.res = {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: defaultComponents,
        }
        return
      }

      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources,
      }
    } catch (err) {
      context.log.error('getComponents:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'POST') {
    const { name, type, defaultHtml, defaultCss, imageUrl, colorizable, allowedPositions, category } =
      req.body ?? {}

    if (!name?.trim()) {
      context.res = { status: 400, body: { error: 'Component name is required.' } }
      return
    }
    if (!type?.trim()) {
      context.res = { status: 400, body: { error: 'Component type is required.' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_COMPONENTS)
      const doc = {
        id:               `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name:             name.trim(),
        type:             type.trim(),
        category:         (category ?? 'custom').trim(),
        defaultHtml:      (defaultHtml ?? '').trim(),
        defaultCss:       (defaultCss ?? '').trim(),
        imageUrl:         imageUrl ?? null,
        colorizable:      Boolean(colorizable),
        allowedPositions: Array.isArray(allowedPositions)
          ? allowedPositions
          : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
        isDefault: false,
        createdAt: new Date().toISOString(),
      }
      const { resource } = await container.items.create(doc)
      context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('createComponent:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
