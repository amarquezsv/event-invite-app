const { getContainer } = require('../shared/cosmosClient')

/**
 * POST /api/templates
 *
 * Creates a new custom invitation template.
 *
 * Required body fields:
 *   name (string)  — human-readable display name
 *   html (string)  — raw HTML markup for the template
 *
 * Optional body fields:
 *   css (string)   — additional CSS rules scoped to this template
 */
module.exports = async function (context, req) {
  const { name, html, css } = req.body ?? {}

  if (!name?.trim()) {
    context.res = { status: 400, body: { error: 'Template name is required.' } }
    return
  }
  if (!html?.trim()) {
    context.res = { status: 400, body: { error: 'Template HTML content is required.' } }
    return
  }

  try {
    const container = await getContainer(process.env.COSMOS_CONTAINER_TEMPLATES)

    const doc = {
      // Unique, URL-safe ID derived from timestamp + random suffix
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      html: html.trim(),
      css: (css ?? '').trim(),
      createdAt: new Date().toISOString(),
    }

    const { resource } = await container.items.create(doc)

    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: resource,
    }
  } catch (err) {
    context.log.error('addTemplate:', err.message)
    context.res = { status: 500, body: { error: 'Internal server error.' } }
  }
}
