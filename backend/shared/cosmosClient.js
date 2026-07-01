const https = require('https')
const { CosmosClient } = require('@azure/cosmos')

/**
 * Shared Cosmos DB client module.
 *
 * Configuration is loaded exclusively from environment variables —
 * no secrets are ever hardcoded here.
 *
 * Required env vars:
 *   COSMOS_ENDPOINT          — https://<account>.documents.azure.com:443/
 *   COSMOS_KEY               — primary or secondary account key
 *   COSMOS_DB                — database name
 *
 * Per-function container env vars (each function passes the resolved name):
 *   COSMOS_CONTAINER_EVENTS     — stores the single event-config document
 *   COSMOS_CONTAINER_GUESTS     — stores guest records
 *   COSMOS_CONTAINER_TEMPLATES  — stores custom invitation templates
 */

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const dbId     = process.env.COSMOS_DB

if (!endpoint || !key || !dbId) {
  throw new Error(
    'Missing required Cosmos DB environment variables: ' +
      'COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DB'
  )
}

// When running against the local Cosmos DB Emulator (localhost:8081) the
// emulator uses a self-signed certificate. We supply a custom HTTPS agent
// that disables TLS verification only for localhost — never for production.
const isEmulator = endpoint.includes('localhost') || endpoint.includes('127.0.0.1')
const clientOptions = { endpoint, key }
if (isEmulator) {
  clientOptions.agent = new https.Agent({ rejectUnauthorized: false })
}

// A single CosmosClient instance is reused across function invocations
// to take advantage of connection pooling.
const client = new CosmosClient(clientOptions)

/**
 * Returns a reference to a Cosmos DB container, creating the database
 * and container on first access if they do not yet exist.
 *
 * @param {string} containerId  Resolved container name (not an env var key).
 * @returns {Promise<import('@azure/cosmos').Container>}
 */
async function getContainer(containerId) {
  if (!containerId) {
    throw new Error(
      'containerId is required — pass the resolved container name, ' +
        'e.g. process.env.COSMOS_CONTAINER_GUESTS'
    )
  }

  const { database } = await client.databases.createIfNotExists({ id: dbId })

  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/id'] },
  })

  return container
}

module.exports = { getContainer }
