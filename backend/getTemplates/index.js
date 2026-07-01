const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/templates
 *
 * Returns all custom invitation templates stored in Cosmos DB.
 * Built-in templates (elegant, modern, classic) live in the frontend
 * codebase and are not stored here.
 */
module.exports = async function (context, req) {
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
}
