/**
 * PreviewPage — renders a full invitation preview for a given event + guest.
 *
 * Public URL: /preview/:eventId/:guestId
 *
 * Fetches event, guest, template and token map from /api/preview/:eventId/:guestId
 * and renders the template with all tokens replaced. Falls back to a
 * structured default layout when no template is assigned.
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { generatePreview } from '../services/api'
import InvitationRenderer from '../components/invitation/InvitationRenderer'
import { replaceTokens } from '../utils/replaceTokens'

const CATEGORY_EMOJI = {
  wedding:     '💍',
  birthday:    '🎂',
  'baby-shower': '👶',
  corporate:   '🏢',
  anniversary: '🥂',
  graduation:  '🎓',
  religious:   '⛪',
  other:       '🎉',
}

function DefaultInvitation({ tokenMap, event }) {
  const p = event.colorPalette ?? {}
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-8 py-16"
      style={{ backgroundColor: p.color5 ?? '#ffffff' }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 text-5xl opacity-30" style={{ color: p.color2 }}>❀</div>
      <div className="absolute top-4 right-4 text-5xl opacity-30 scale-x-[-1]" style={{ color: p.color2 }}>❀</div>
      <div className="absolute bottom-4 left-4 text-5xl opacity-30" style={{ color: p.color2 }}>❀</div>
      <div className="absolute bottom-4 right-4 text-5xl opacity-30 scale-x-[-1]" style={{ color: p.color2 }}>❀</div>

      {/* Border */}
      <div className="absolute inset-4 border-2 rounded pointer-events-none" style={{ borderColor: p.color3 ?? p.color2 }} />

      <div className="relative text-center max-w-sm mx-auto space-y-4">
        <div className="text-4xl mb-2">{CATEGORY_EMOJI[event.category] ?? '🎉'}</div>

        {tokenMap.guestName && (
          <p className="text-lg italic" style={{ color: p.color2 }}>
            Dear <strong>{tokenMap.guestName}</strong>,
          </p>
        )}

        <h1 className="text-4xl font-bold font-serif leading-tight" style={{ color: p.color1 }}>
          {tokenMap.eventName}
        </h1>

        <div className="text-2xl" style={{ color: p.color2 }}>◆ ◆ ◆</div>

        <div className="space-y-2 text-base" style={{ color: p.color4 }}>
          {tokenMap.eventDate && (
            <p className="font-semibold" style={{ color: p.color1 }}>📅 {tokenMap.eventDate}</p>
          )}
          {tokenMap.eventTime && (
            <p className="font-semibold" style={{ color: p.color2 }}>🕐 {tokenMap.eventTime}</p>
          )}
          {tokenMap.eventLocation && (
            <p className="font-semibold" style={{ color: p.color1 }}>📍 {tokenMap.eventLocation}</p>
          )}
          {tokenMap.eventAddress && (
            <p className="text-sm opacity-75">{tokenMap.eventAddress}</p>
          )}
        </div>

        {tokenMap.guestSeats && (
          <p className="text-sm" style={{ color: p.color4 }}>
            🎟 Reserved seats: <strong>{tokenMap.guestSeats}</strong>
          </p>
        )}

        {tokenMap.customNotes && (
          <p className="text-sm italic opacity-75" style={{ color: p.color4 }}>
            📝 {tokenMap.customNotes}
          </p>
        )}

        <div className="pt-4">
          <div className="text-xl" style={{ color: p.color2 }}>❧ ── ✿ ── ❧</div>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const { eventId, guestId } = useParams()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!eventId || !guestId) return
    generatePreview(eventId, guestId)
      .then(setData)
      .catch(() => setError('Preview not available. The event or guest may not exist.'))
      .finally(() => setLoading(false))
  }, [eventId, guestId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading preview…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-slate-500">{error ?? 'Preview unavailable.'}</p>
        <Link to="/admin/events" className="text-violet-600 text-sm hover:underline">
          ← Back to Events
        </Link>
      </div>
    )
  }

  const { event, template, tokenMap, invitationPage } = data

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin preview bar */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between">
        <span>
          Preview: <strong>{data.guest?.name}</strong> · {event.name}
          {invitationPage && (
            <span className="ml-2 text-slate-400">— {invitationPage.name}</span>
          )}
        </span>
        <Link to="/admin/guests" className="text-slate-400 hover:text-white">
          ← Admin
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {invitationPage?.html ? (
          // Full HTML invitation page — render in an iframe so the design is pixel-perfect
          <iframe
            srcDoc={replaceTokens(invitationPage.html, tokenMap)}
            title="Invitation Preview"
            className="w-full max-w-sm shadow-2xl rounded-xl border-0"
            style={{ height: '80vh' }}
            sandbox="allow-scripts allow-popups"
          />
        ) : (
          <div className="w-full max-w-sm shadow-2xl overflow-hidden rounded-xl">
          {template?.html ? (
            <InvitationRenderer
              templateHtml={template.html}
              templateCss={template.css}
              tokenMap={tokenMap}
              className="bg-white"
            />
          ) : (
            <DefaultInvitation tokenMap={tokenMap} event={event} />
          )}
          </div>
        )}
      </div>
    </div>
  )
}
