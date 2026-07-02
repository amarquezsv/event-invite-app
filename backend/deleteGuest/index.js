const { getContainer } = require('../shared/cosmosClient')

/**
 * DELETE /api/guests/{id}  — delete a guest record
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

    await container.item(id.trim(), id.trim()).delete()
    context.res = { status: 204 }
  } catch (err) {
    context.log.error('deleteGuest:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
