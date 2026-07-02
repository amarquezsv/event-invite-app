const { BlobServiceClient } = require('@azure/storage-blob')

/**
 * Shared Azure Blob Storage client for user-uploaded assets.
 *
 * Uses BLOB_STORAGE_CONNECTION_STRING when set (recommended for production,
 * pointing to a dedicated storage account with blob public access enabled).
 * Falls back to AzureWebJobsStorage for local development / simple setups.
 *
 * Container name: BLOB_CONTAINER_INVITATIONS (default: 'invitations')
 * The container is created with public blob access so images embedded
 * in invitation HTML are accessible without authentication.
 *
 * Production setup:
 *   1. Create an Azure Storage account with "Allow Blob public access" = Enabled
 *   2. Add its connection string as BLOB_STORAGE_CONNECTION_STRING in the
 *      Static Web App's Application Settings (Azure Portal → SWA → Configuration)
 */

function getBlobServiceClient() {
  const connectionString =
    process.env.BLOB_STORAGE_CONNECTION_STRING ??
    process.env.AzureWebJobsStorage

  if (!connectionString) {
    throw new Error(
      'Blob storage connection string is not configured. ' +
      'Set BLOB_STORAGE_CONNECTION_STRING in the application settings.'
    )
  }
  return BlobServiceClient.fromConnectionString(connectionString)
}

/**
 * Returns a reference to the invitations blob container, creating it if it
 * does not yet exist.  Attempts to enable public blob access; if the storage
 * account has disabled it at the account level (PublicAccessNotPermitted),
 * falls back to creating without public access.
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
    if (err.code === 'PublicAccessNotPermitted') {
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
