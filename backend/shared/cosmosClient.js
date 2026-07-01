const { CosmosClient } = require('@azure/cosmos')

/**
 * Shared Cosmos DB client module.
 *
 * Configuration is loaded exclusively from environment variables —
 * no secrets are ever hardcoded here.
 *
 * Required env vars:
 *   COSMOS_ENDPOINT  — e.g. https://<account>.documents.azure.com:443/
 *   COSMOS_KEY       — primary or secondary account key
 *   COSMOS_DB        — database name
 *   COSMOS_CONTAINER — container name
 */

const endpoint = process.env.COSMOS_ENDPOINT
const key = process.env.COSMOS_KEY
const databaseId = process.env.COSMOS_DB
const containerId = process.env.COSMOS_CONTAINER

if (!endpoint || !key || !databaseId || !containerId) {
  throw new Error(
    'Missing required Cosmos DB environment variables: ' +
      'COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DB, COSMOS_CONTAINER'
  )
}

// A single CosmosClient instance is reused across function invocations
// to take advantage of connection pooling.
const client = new CosmosClient({ endpoint, key })

/**
 * Returns a reference to the configured Cosmos DB container.
 * Creates the database and container if they do not already exist.
 *
 * @returns {Promise<import('@azure/cosmos').Container>}
 */
async function getContainer() {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  })

  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/email'] },
  })

  return container
}

module.exports = { getContainer }
