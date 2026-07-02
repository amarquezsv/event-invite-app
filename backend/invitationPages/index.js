const { getContainer } = require('../shared/cosmosClient')

/**
 * GET  /api/invitation-pages  — list all invitation pages (newest first)
 * POST /api/invitation-pages  — create a new invitation page
 */
module.exports = async function (context, req) {
  const method = req.method.toUpperCase()

  // ── GET — list ────────────────────────────────────────────────
  if (method === 'GET') {
    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_INVITATION_PAGES)
      const { resources } = await container.items
        .query('SELECT c.id, c.name, c.eventId, c.assets, c.createdAt, c.updatedAt FROM c ORDER BY c._ts DESC')
        .fetchAll()
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: resources,
      }
    } catch (err) {
      context.log.error('listInvitationPages:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  // ── POST — create ─────────────────────────────────────────────
  if (method === 'POST') {
    const { name, eventId, html } = req.body ?? {}

    if (!name?.trim()) {
      context.res = { status: 400, body: { error: 'Invitation page name is required.' } }
      return
    }
    if (!html?.trim()) {
      context.res = { status: 400, body: { error: 'HTML content is required.' } }
      return
    }

    try {
      const container = await getContainer(process.env.COSMOS_CONTAINER_INVITATION_PAGES)
      const doc = {
        id:        `inv-page-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name:      name.trim(),
        eventId:   eventId ?? null,
        html:      html,
        assets:    [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const { resource } = await container.items.create(doc)
      context.res = {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: resource,
      }
    } catch (err) {
      context.log.error('createInvitationPage:', err.message)
      context.res = { status: 500, body: { error: 'Internal server error.' } }
    }
    return
  }

  context.res = { status: 405, body: { error: 'Method not allowed.' } }
}
