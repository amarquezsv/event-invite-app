import { useParams } from 'react-router-dom'

/**
 * InvitationPage — public, full-screen invitation page.
 *
 * URL: /page/:id
 *
 * Renders the admin-designed HTML document in a full-viewport iframe.
 * No header, no footer, no React shell — guests see only the invitation.
 *
 * The iframe src points to the Azure Function that serves the raw HTML
 * (/api/public/page/:id). In local dev the Vite proxy forwards /api to
 * the Functions runtime at localhost:7071.
 */
export default function InvitationPage() {
  const { id } = useParams()

  return (
    <iframe
      src={`/api/public/page/${encodeURIComponent(id)}`}
      title="Invitation"
      className="fixed inset-0 w-full h-full border-0"
      sandbox="allow-scripts allow-popups allow-same-origin"
    />
  )
}
