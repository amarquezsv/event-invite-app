const { getContainer } = require('../shared/cosmosClient')
const { uploadBlob }   = require('../shared/blobClient')

/**
 * POST /api/invitation-pages/{id}/assets
 *
 * Accepts a base64-encoded image, stores it in Azure Blob Storage under
 * <id>/assets/<filename>, and appends the asset metadata to the invitation
 * page document in Cosmos DB.
 *
 * Request body (JSON):
 *   filename    {string}  — original file name, e.g. "banner.jpg"
 *   contentType {string}  — MIME type, e.g. "image/jpeg"
 *   data        {string}  — base64-encoded file content (without data-URI prefix)
 *
 * Response (201):
 *   { name: string, url: string }
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData
  const { filename, contentType, data } = req.body ?? {}

  if (!id?.trim()) {
    context.res = { status: 400, body: { error: 'Invitation page ID is required.' } }
    return
  }
  if (!filename?.trim()) {
    context.res = { status: 400, body: { error: 'filename is required.' } }
    return
  }
  if (!data?.trim()) {
    context.res = { status: 400, body: { error: 'data (base64) is required.' } }
    return
  }

  // Sanitise filename — allow only safe path characters
  const safeName = filename.trim().replace(/[^a-zA-Z0-9._-]/g, '_')
  const blobPath = `${id.trim()}/assets/${safeName}`

  try {
    const buffer  = Buffer.from(data, 'base64')
    const blobUrl = await uploadBlob(blobPath, buffer, contentType ?? 'application/octet-stream')

    // Persist asset metadata on the invitation page document
    const container = await getContainer((process.env.COSMOS_CONTAINER_INVITATION_PAGES ?? 'invitation-pages'))
    const { resources } = await container.items
      .query({
        query:      'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (resources?.length) {
      const doc = resources[0]
      doc.assets    = [...(doc.assets ?? []).filter(a => a.name !== safeName), { name: safeName, url: blobUrl }]
      doc.updatedAt = new Date().toISOString()
      await container.items.upsert(doc)
    }

    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: { name: safeName, url: blobUrl },
    }
  } catch (err) {
    context.log.error('uploadInvitationAsset:', err.message)
    context.res = { status: 500, body: { error: 'Failed to upload asset.' } }
  }
}
