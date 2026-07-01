const { getContainer } = require('../shared/cosmosClient')

/**
 * GET  /api/templates  — list all custom templates
 * POST /api/templates  — create a new custom template
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)
      const { resources } = await container.items
        .query('SELECT * FROM c ORDER BY c._ts ASC')
        .fetchAll()
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources,
      }
    } catch (err) {
      context.log.error('getTemplates:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  if (method === 'POST') {
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
      const doc = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: name.trim(),
        html: html.trim(),
        css: (css ?? '').trim(),
        createdAt: new Date().toISOString(),
      }
      const { resource } = await container.items.create(doc)
      context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('addTemplate:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
