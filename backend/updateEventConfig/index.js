const { getContainer } = require('../shared/cosmosClient')

/**
 * POST /api/event/config
 *
 * Creates or replaces the event configuration document (upsert).
 *
 * Required body fields:
 *   name (string)
 *
 * Optional body fields:
 *   description, location, address, date, time, templateId
 */
module.exports = async function (context, req) {
  const { name, description, location, address, date, time, templateId } =
    req.body ?? {}

  if (!name?.trim()) {
    context.res = { status: 400, body: { error: 'Event name is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_EVENTS)

    const doc = {
      id: 'event-config',
      name: name.trim(),
      description: (description ?? '').trim(),
      location: (location ?? '').trim(),
      address: (address ?? '').trim(),
      date: (date ?? '').trim(),
      time: (time ?? '').trim(),
      templateId: (templateId ?? 'elegant').trim(),
      updatedAt: new Date().toISOString(),
    }

    const { resource } = await container.items.upsert(doc)

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: resource,
    }
  } catch (err) {
    context.log.error('updateEventConfig:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
