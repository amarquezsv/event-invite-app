import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import InvitationPoster from '../components/invitation/InvitationPoster'
import InvitationRenderer from '../components/invitation/InvitationRenderer'
import { generateInviteLink, confirmAttendance } from '../services/api'
import { replaceTokens } from '../utils/replaceTokens'

/**
 * Invitation — public, guest-specific invitation page.
 *
 * URL: /invite/:guestId
 *
 * 1. Fetches guest + event data (and optional custom template) from the backend.
 * 2. If the event has a custom template, renders it via InvitationRenderer.
 * 3. Otherwise falls back to the built-in InvitationPoster.
 * 4. Shows a sticky bottom bar with the "Reserve My Seats" CTA.
 */
export default function Invitation() {
  const { guestId }  = useParams()
  const navigate     = useNavigate()

  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [pageError,  setPageError]  = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmErr, setConfirmErr] = useState(null)

  useEffect(() => {
    if (!guestId) return
    generateInviteLink(guestId)
      .then((d) => setData(d))
      .catch(() => setPageError('Invitation not found or the link has expired.'))
      .finally(() => setLoading(false))
  }, [guestId])

  async function handleConfirm() {
    setConfirming(true)
    setConfirmErr(null)
    try {
      await confirmAttendance(guestId)
      navigate('/confirmed', {
        state: { guest: data.guest, event: data.event },
      })
    } catch {
      setConfirmErr('Failed to confirm attendance. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading your invitation…</p>
      </div>
    )
  }

  // ── Error / not found ─────────────────────────────────────────

  if (pageError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-slate-600 font-medium mb-1">Invitation not found</p>
          <p className="text-slate-400 text-sm">
            {pageError ?? 'Please check your invitation link and try again.'}
          </p>
        </div>
      </div>
    )
  }

  const { guest, event, template, tokenMap, invitationPage } = data
  const alreadyConfirmed = guest?.confirmed

  // ── Full HTML invitation page (admin-designed) ───────────────────────────
  // Takes precedence over the legacy template / built-in poster.

  if (invitationPage?.html) {
    // Apply token replacement so {guestName}, {eventName}, etc. become real values
    const renderedHtml = replaceTokens(invitationPage.html, tokenMap ?? {})

    return (
      <>
        {/* Admin-designed HTML in a sandboxed full-viewport iframe */}
        <iframe
          srcDoc={renderedHtml}
          title={invitationPage.name ?? 'Invitation'}
          className="w-full border-0 block"
          style={{ height: '100svh' }}
          sandbox="allow-scripts allow-popups"
        />
        {/* Sticky confirmation CTA overlays the iframe */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-4">
          {confirmErr && (
            <p className="text-center text-xs text-red-600 mb-2">{confirmErr}</p>
          )}
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-600 text-center sm:text-left">
              <span className="font-semibold text-slate-800">{guest.seats}</span>{' '}
              seat{guest.seats !== 1 ? 's' : ''} reserved for you
            </p>
            {alreadyConfirmed ? (
              <span className="text-sm font-semibold text-green-600">
                ✓ Attendance confirmed — see you there!
              </span>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="rounded-full bg-violet-600 px-8 py-3 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md whitespace-nowrap"
              >
                {confirming ? 'Confirming…' : 'Reserve My Seats'}
              </button>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Invitation poster + sticky CTA ─────────────────────────────────

  return (
    <div className="pb-24">
      {/* Render custom template if available, otherwise use built-in poster */}
      {template?.html ? (
        <div className="w-full max-w-sm sm:max-w-md mx-auto shadow-xl overflow-hidden my-6 rounded-xl px-4 sm:px-0">
          <InvitationRenderer
            templateHtml={template.html}
            templateCss={template.css}
            tokenMap={tokenMap ?? {}}
            className="bg-white"
          />
        </div>
      ) : (
        <InvitationPoster event={event} guest={guest} />
      )}

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-4">
        {confirmErr && (
          <p className="text-center text-xs text-red-600 mb-2">{confirmErr}</p>
        )}

        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-800">{guest.seats}</span>{' '}
            seat{guest.seats !== 1 ? 's' : ''} reserved for you
          </p>

          {alreadyConfirmed ? (
            <span className="text-sm font-semibold text-green-600">
              ✓ Attendance confirmed — see you there!
            </span>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="rounded-full bg-violet-600 px-8 py-3 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md whitespace-nowrap"
            >
              {confirming ? 'Confirming…' : 'Reserve My Seats'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

