const { getContainer } = require('../shared/cosmosClient')

/**
 * GET /api/public/page/{id}
 *
 * Serves the invitation page as a raw HTML document.
 * No authentication required — this URL is what guests receive.
 *
 * The response has Content-Type: text/html so browsers render it directly.
 * No admin UI, no React shell, no navigation — pure HTML as the admin designed it.
 */
module.exports = async function (context, req) {
  const { id } = context.bindingData

  if (!id?.trim()) {
    context.res = {
      status:  400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body:    notFoundHtml('Invalid invitation link.'),
    }
    return
  }

  try {
    const container = await getContainer((process.env.COSMOS_CONTAINER_INVITATION_PAGES ?? 'invitation-pages'))
    const { resources } = await container.items
      .query({
        query:      'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id.trim() }],
      })
      .fetchAll()

    if (!resources?.length || !resources[0].html) {
      context.res = {
        status:  404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body:    notFoundHtml('This invitation link is invalid or has expired.'),
      }
      return
    }

    context.res = {
      status:  200,
      headers: {
        'Content-Type':  'text/html; charset=utf-8',
        // Allow the page to be embedded in an iframe by the React app
        'X-Frame-Options': 'SAMEORIGIN',
      },
      body: resources[0].html,
    }
  } catch (err) {
    context.log.error('serveInvitationPage:', err.message)
    context.res = {
      status:  500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body:    notFoundHtml('An error occurred. Please try again.'),
    }
  }
}

function notFoundHtml(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
    .card { text-align: center; padding: 2rem; }
    h2 { color: #1e293b; margin-bottom: 0.5rem; }
    p  { color: #64748b; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Invitation not found</h2>
    <p>${message}</p>
  </div>
</body>
</html>`
}
