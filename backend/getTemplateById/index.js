const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/templates/{id}
 *
 * Returns a single custom invitation template by its ID.
 * Used by the Template Builder when loading a template for editing.
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Template ID is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)

    // Use a parameterised query to prevent injection.
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
}
