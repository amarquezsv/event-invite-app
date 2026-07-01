const { getContainer } = require('../shared/cosmosClient')

/**
 * PUT /api/templates/{id}
 *
 * Updates an existing custom invitation template.
 * Only the fields provided in the request body are changed;
 * createdAt is preserved from the original document.
 *
 * Updatable fields: name, html, css
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Template ID is required.' } }
    return
  }

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

    // Fetch existing document first to preserve createdAt and any other fields.
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

    const existing = resources[0]

    const updated = {
      ...existing,
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
}
