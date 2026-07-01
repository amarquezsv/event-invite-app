const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/guests
 *
 * Returns all guest records ordered by creation time (newest first).
 * This endpoint is intended for the admin panel only.
 */
module.exports = async function (context, req) {
  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)

    const { resources } = await container.items
      .query('SELECT * FROM c ORDER BY c._ts DESC')
      .fetchAll()

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resources,
    }
  } catch (err) {
    context.log.error('getGuests:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
