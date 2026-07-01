const { getContainer } = require('../shared/cosmosClient')

/**
 * POST /api/confirm/{id}
 *
 * Marks a guest as having confirmed their attendance.
 * This operation is idempotent — calling it multiple times is safe
 * and will always return the latest guest document.
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Guest ID is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)

    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (!resources?.length) {
      context.res = { status: 404, body: { error: 'Guest not found.' } }
      return
    }

    const updated = {
      ...resources[0],
      confirmed: true,
      confirmedAt: new Date().toISOString(),
    }

    const { resource } = await container.items.upsert(updated)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resource,
    }
  } catch (err) {
    context.log.error('confirmAttendance:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
