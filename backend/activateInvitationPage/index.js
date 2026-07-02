const { getContainer } = require('../shared/cosmosClient')

/**
 * POST /api/invitation-pages/{id}/activate
 *
 * Marks the given invitation page as the active one for its event:
 *   - Sets isActive = true  on the target page
 *   - Sets isActive = false on every other page that shares the same eventId
 *
 * This ensures only one page per event is ever "active" (i.e. shown to guests).
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Invitation page ID is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_INVITATION_PAGES)

    // Fetch the target page
    const { resources: targets } = await container.items
      .query({
        query:      'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (!targets?.length) {
      context.res = { status: 404, body: { error: 'Invitation page not found.' } }
      return
    }

    const target  = targets[0]
    const eventId = target.eventId ?? null

    // Deactivate all sibling pages that share the same eventId (if any)
    if (eventId) {
      const { resources: siblings } = await container.items
        .query({
          query:      'SELECT * FROM c WHERE c.eventId = @eventId AND c.id != @id AND c.isActive = true',
          parameters: [
            { name: '@eventId', value: eventId },
            { name: '@id',      value: id.trim() },
          ],
        })
        .fetchAll()

      await Promise.all(
        siblings.map((sib) =>
          container.items.upsert({ ...sib, isActive: false, updatedAt: new Date().toISOString() })
        )
      )
    }

    // Activate the target page
    const updated = { ...target, isActive: true, updatedAt: new Date().toISOString() }
    const { resource } = await container.items.upsert(updated)

    context.res = {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
      body:    resource,
    }
  } catch (err) {
    context.log.error('activateInvitationPage:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
