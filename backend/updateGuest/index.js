const { getContainer } = require('../shared/cosmosClient')

/**
 * PUT /api/guests/{id}
 *
 * Partially updates an existing guest document.
 * Only the fields provided in the request body are changed;
 * all other fields retain their current values.
 *
 * Updatable fields: name, whatsapp, seats, confirmed, customNotes, eventId,
 *                    invitationPageId, templateId
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Guest ID is required.' } }
    return
  }

  const updates = req.body ?? {}

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_GUESTS)

    // Fetch the current document using a parameterised query to prevent injection.
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

    const existing = resources[0]

    // Merge only the allowed mutable fields.
    const updated = {
      ...existing,
      name: updates.name?.trim() ?? existing.name,
      whatsapp: updates.whatsapp
        ? updates.whatsapp.replace(/[\s\-()]/g, '')
        : existing.whatsapp,
      seats:
        updates.seats !== undefined
          ? parseInt(updates.seats, 10)
          : existing.seats,
      confirmed:
        updates.confirmed !== undefined
          ? Boolean(updates.confirmed)
          : existing.confirmed,
      eventId:          updates.eventId?.trim()     ?? existing.eventId ?? null,
      customNotes:      updates.customNotes?.trim() ?? existing.customNotes ?? '',
      invitationPageId: updates.invitationPageId !== undefined
        ? (updates.invitationPageId || null)
        : (existing.invitationPageId ?? null),
      templateId: updates.templateId !== undefined
        ? (updates.templateId?.trim() || null)
        : (existing.templateId ?? null),
      updatedAt: new Date().toISOString(),
    }

    const { resource } = await container.items.upsert(updated)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resource,
    }
  } catch (err) {
    context.log.error('updateGuest:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
