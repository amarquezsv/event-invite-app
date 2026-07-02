const { getContainer } = require('../shared/cosmosClient')

/**
 * GET    /api/invitation-pages/{id}  — fetch by id (includes full HTML)
 * PUT    /api/invitation-pages/{id}  — update name, eventId, html, assets
 * DELETE /api/invitation-pages/{id}  — remove the page
 */
module.exports = async function (context, req) {
  const { id }  = context.bindingData
  const method  = req.method.toUpperCase()

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Invitation page ID is required.' } }
    return
  }

  let container
  try {
    container = await getContainer((process.env.COSMOS_CONTAINER_INVITATION_PAGES ?? 'invitation-pages'))
  } catch (err) {
    context.log.error('invitationPageById container:', err.message)
    context.res = { status: 500, body: { error: 'Storage unavailable.' } }
    return
  }

  // ── GET ───────────────────────────────────────────────────────
  if (method === 'GET') {
    try {
      const { resources } = await container.items
        .query({
          query:      'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!resources?.length) {
        context.res = { status: 404, body: { error: 'Invitation page not found.' } }
        return
      }
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources[0],
      }
    } catch (err) {
      context.log.error('getInvitationPageById:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  // ── PUT ───────────────────────────────────────────────────────
  if (method === 'PUT') {
    const { name, eventId, html, assets } = req.body ?? {}

    try {
      const { resources: existing } = await container.items
        .query({
          query:      'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!existing?.length) {
        context.res = { status: 404, body: { error: 'Invitation page not found.' } }
        return
      }

      const doc = {
        ...existing[0],
        ...(name    !== undefined && { name:    name.trim() }),
        ...(eventId !== undefined && { eventId: eventId }),
        ...(html    !== undefined && { html }),
        ...(assets  !== undefined && { assets }),
        updatedAt: new Date().toISOString(),
      }

      const { resource } = await container.items.upsert(doc)
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('updateInvitationPage:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  // ── DELETE ────────────────────────────────────────────────────
  if (method === 'DELETE') {
    try {
      const { resources: existing } = await container.items
        .query({
          query:      'SELECT c.id FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id.trim() }],
        })
        .fetchAll()

      if (!existing?.length) {
        context.res = { status: 404, body: { error: 'Invitation page not found.' } }
        return
      }

      await container.item(id.trim(), id.trim()).delete()
      context.res = { status: 204 }
    } catch (err) {
      context.log.error('deleteInvitationPage:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
