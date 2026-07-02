const { BlobServiceClient } = require('@azure/storage-blob')

/**
 * Shared Azure Blob Storage client.
 *
 * Uses the AzureWebJobsStorage connection string that Azure Functions
 * already requires. In local development this points to Azurite
 * (UseDevelopmentStorage=true).
 *
 * Container name: BLOB_CONTAINER_INVITATIONS (default: 'invitations')
 * The container is created with public blob access so images embedded
 * in invitation HTML are accessible without authentication.
 */

function getBlobServiceClient() {
  const connectionString = process.env.AzureWebJobsStorage
  if (!connectionString) {
    throw new Error('AzureWebJobsStorage environment variable is not set.')
  }
  return BlobServiceClient.fromConnectionString(connectionString)
}

/**
 * Returns a reference to the invitations blob container, creating it if it
 * does not yet exist.  Attempts to enable public blob access; if the storage
 * account has disabled it at the account level (PublicAccessNotPermitted /
 * AllowBlobPublicAccess=false), falls back to creating without public access.
 *
 * @returns {Promise<import('@azure/storage-blob').ContainerClient>}
 */
async function getInvitationsContainer() {
  const containerName   = process.env.BLOB_CONTAINER_INVITATIONS ?? 'invitations'
  const serviceClient   = getBlobServiceClient()
  const containerClient = serviceClient.getContainerClient(containerName)

  try {
    // 'blob' access level makes individual blobs publicly readable
    await containerClient.createIfNotExists({ access: 'blob' })
  } catch (err) {
    // Azure Storage accounts created after late 2023 disable blob public
    // access by default.  Fall back to creating without public access.
    if (err.code === 'PublicAccessNotPermitted' || err.statusCode === 409) {
      await containerClient.createIfNotExists()
    } else {
      throw err
    }
  }

  return containerClient
}

/**
 * Uploads binary data to blob storage and returns the public URL.
 *
 * @param {string} blobPath    — relative path inside the container, e.g. 'inv-page-123/assets/photo.jpg'
 * @param {Buffer} data        — binary content
 * @param {string} contentType — MIME type, e.g. 'image/jpeg'
 * @returns {Promise<string>}  — publicly accessible blob URL
 */
async function uploadBlob(blobPath, data, contentType) {
  const containerClient = await getInvitationsContainer()
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: contentType },
  })
  return blockBlobClient.url
}

module.exports = { getInvitationsContainer, uploadBlob }
