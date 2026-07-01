const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/templates/{id}  — fetch a single template
 * PUT /api/templates/{id}  — update an existing template
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Template ID is required.' } }
    return
  }

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()
      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Template not found.' } }
        return
      }
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources[0],
      }
    } catch (err) {
      context.log.error('getTemplateById:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'PUT') {
    const { name, html, css } = req.body ?? {}

    if (!name?.trim()) {
      context.res = { status: 400, body: { error: 'Template name is required.' } }
      return
    }
    if (!html?.trim()) {
      context.res = { status: 400, body: { error: 'Template HTML content is required.' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)
      const { resources } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()
      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Template not found.' } }
        return
      }
      const updated = {
        ...resources[0],
        name: name.trim(),
        html: html.trim(),
        css: (css ?? '').trim(),
        updatedAt: new Date().toISOString(),
      }
      const { resource } = await container.items.upsert(updated)
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('updateTemplate:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
