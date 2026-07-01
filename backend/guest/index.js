const { getContainer } = require('../shared/cosmosClient')

/**
 * HTTP GET /api/guest/{id}
 *
 * Returns the RSVP document for a guest identified by their Cosmos DB
 * document ID. Returns 404 if no matching document is found.
 */
module.exports = async function (context, req) {
  // The {id} route parameter is available via bindingData
  const { id } = context.bindingData

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    context.res = {
      status: 400,
      body: { error: 'Guest ID is required.' },
    }
    return
  }

  try {
    const container = await getContainer()

    // Use a parameterised query to prevent injection
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (!resources || resources.length === 0) {
      context.res = {
        status: 404,
        body: { error: 'Guest not found.' },
      }
      return
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resources[0],
    }
  } catch (err) {
    context.log.error('Error fetching guest:', err.message)
    context.res = {
      status: 500,
      body: { error: 'An internal error occurred. Please try again later.' },
    }
  }
}
