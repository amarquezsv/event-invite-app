const { getContainer } = require('../shared/cosmosClient')

/**
 * HTTP POST /api/rsvp
 *
 * Validates the request body and stores a new RSVP document
 * in Azure Cosmos DB. Returns 201 on success.
 *
 * Expected request body:
 *   { "name": "Jane Doe", "email": "jane@example.com", "attending": "yes" }
 */
module.exports = async function (context, req) {
  const { name, email, attending } = req.body || {}

  // --- Input validation ---
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    context.res = {
      status: 400,
      body: { error: 'Name is required.' },
    }
    return
  }

  if (!email || typeof email !== 'string') {
    context.res = {
      status: 400,
      body: { error: 'Email is required.' },
    }
    return
  }

  // Basic email format check (defence-in-depth; frontend also validates)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    context.res = {
      status: 400,
      body: { error: 'Invalid email address.' },
    }
    return
  }

  try {
    const container = await getContainer()

    // Build the RSVP document
    const rsvpItem = {
      // Unique document ID combining timestamp and random suffix
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      attending: attending === 'yes',
      createdAt: new Date().toISOString(),
    }

    await container.items.create(rsvpItem)

    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: { message: 'RSVP saved successfully' },
    }
  } catch (err) {
    // Log the error server-side but never expose internal details to the client
    context.log.error('Error saving RSVP:', err.message)
    context.res = {
      status: 500,
      body: { error: 'An internal error occurred. Please try again later.' },
    }
  }
}
