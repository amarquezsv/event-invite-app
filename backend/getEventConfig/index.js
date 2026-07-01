const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/event/config
 *
 * Returns the single event configuration document.
 * If none has been saved yet a sensible default is returned so the
 * frontend always has something to render.
 */
module.exports = async function (context, req) {
  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)

    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: 'event-config' }],
      })
      .fetchAll()

    const config = resources[0] ?? {
      id: 'event-config',
      name: 'Our Special Day',
      description: 'Join us for a wonderful celebration.',
      location: 'Grand Ballroom',
      address: '123 Celebration Ave, City, State 00000',
      date: '',
      time: '',
      templateId: 'elegant',
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: config,
    }
  } catch (err) {
    context.log.error('getEventConfig:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
