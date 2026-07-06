import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import InvitationPoster from '../components/invitation/InvitationPoster'
import InvitationRenderer from '../components/invitation/InvitationRenderer'
import WeddingBodaTemplate from '../components/invitation/WeddingBodaTemplate'
import { generateInviteLink, confirmAttendance, getInvitationPageById } from '../services/api'
import { replaceTokens } from '../utils/replaceTokens'

/**
 * Registry of component-based invitation templates.
 *
 * When an invitationPage document has { componentType: 'wedding-boda' }
 * (or another key), the matching React component is rendered directly —
 * no iframe, no zoom hacks, fully responsive.
 *
 * To add a new template type:
 *  1. Create MySuperTemplate.jsx in components/invitation/
 *  2. Import it above.
 *  3. Add the entry here.
 */
const COMPONENT_TEMPLATES = {
  'wedding-boda': WeddingBodaTemplate,
}

/**
 * Invitation — public, guest-specific invitation page.
 *
 * URL: /invite/:guestId
 *
 * 1. Fetches guest + event data (and optional custom template) from the backend.
 * 2. If the invitation page has a componentType, renders a JSX template (responsive, animated).
 * 3. If the page has raw HTML, renders it via a sandboxed iframe (legacy path).
 * 4. Otherwise falls back to the built-in InvitationPoster.
 * 5. Shows a bilingual sticky bottom bar with the confirm CTA.
 */
export default function Invitation() {
  const { guestId }  = useParams()
  const navigate     = useNavigate()

  const [data,         setData]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [pageError,    setPageError]    = useState(null)
  const [confirming,   setConfirming]   = useState(false)
  const [confirmErr,   setConfirmErr]   = useState(null)
  // Selected invitation page (guest can switch between templates)
  const [selectedPage, setSelectedPage] = useState(null)
  const [loadingPage,  setLoadingPage]  = useState(false)

  useEffect(() => {
    if (!guestId) return
    generateInviteLink(guestId)
      .then((d) => {
        setData(d)
        setSelectedPage(d.invitationPage ?? null)
      })
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

  // Fetch the full HTML for a different template when the guest switches
  async function handleSelectPage(pageId) {
    if (pageId === selectedPage?.id || loadingPage) return
    setLoadingPage(true)
    try {
      const page = await getInvitationPageById(pageId)
      setSelectedPage(page)
    } catch { /* silently ignore — keep current page */ }
    finally { setLoadingPage(false) }
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

  const { guest, event, template, tokenMap, invitationPages } = data
  const alreadyConfirmed = guest?.confirmed

  // ── Language detection ─────────────────────────────────────────────────
  // Priority: URL ?lang= param → event.lang → default 'es'
  const urlLang = new URLSearchParams(window.location.search).get('lang')
  const invLang = (urlLang === 'en' || urlLang === 'es')
    ? urlLang
    : (event?.lang ?? 'es')

  // Bilingual strings for the sticky confirm bar
  const i18n = invLang === 'es'
    ? {
        seatsLabel:    (n) => `${n} ${n === 1 ? 'lugar reservado' : 'lugares reservados'} para ti`,
        confirmBtn:    'Confirmar Asistencia',
        confirming:    'Confirmando…',
        confirmed:     '✓ Asistencia confirmada — ¡te esperamos!',
        confirmFailed: 'Error al confirmar asistencia. Por favor intenta de nuevo.',
      }
    : {
        seatsLabel:    (n) => `${n} seat${n !== 1 ? 's' : ''} reserved for you`,
        confirmBtn:    'Reserve My Seats',
        confirming:    'Confirming…',
        confirmed:     '✓ Attendance confirmed — see you there!',
        confirmFailed: 'Failed to confirm attendance. Please try again.',
      }

  // Template picker removed — guests always see their assigned template only
  const showPicker = false
  const templatePicker = null

  // ── Shared sticky confirm bar ──────────────────────────────────────────
  const StickyBar = (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-4">
      {confirmErr && (
        <p className="text-center text-xs text-red-600 mb-2">{i18n.confirmFailed}</p>
      )}
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600 text-center sm:text-left">
          <span className="font-semibold text-slate-800">{guest.seats}</span>{' '}
          {i18n.seatsLabel(guest.seats).replace(/^\d+ /, '')}
        </p>
        {alreadyConfirmed ? (
          <span className="text-sm font-semibold text-green-600">{i18n.confirmed}</span>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="rounded-full bg-violet-600 px-8 py-3 text-white font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md whitespace-nowrap"
          >
            {confirming ? i18n.confirming : i18n.confirmBtn}
          </button>
        )}
      </div>
    </div>
  )

  // ── Component-based invitation page (new responsive path) ──────────────
  // When the invitation page has a `componentType`, render the JSX component
  // directly — no iframe, no zoom scaling, fully responsive & animated.

  if (selectedPage?.componentType) {
    const InvComponent = COMPONENT_TEMPLATES[selectedPage.componentType]
    if (InvComponent) {
      return (
        <>
          {templatePicker}
          <InvComponent
            event={event}
            guest={guest}
            tokenMap={tokenMap ?? {}}
            lang={invLang}
          />
          {StickyBar}
        </>
      )
    }
  }

  // ── Full HTML invitation page (legacy iframe path) ─────────────────────
  // Used when the page has raw HTML but no componentType.

  if (selectedPage?.html) {
    const renderedHtml = replaceTokens(selectedPage.html, tokenMap ?? {})
    return (
      <>
        {templatePicker}
        <iframe
          srcDoc={renderedHtml}
          title={selectedPage.name ?? 'Invitation'}
          className="w-full border-0 block"
          style={{ height: '100svh', marginTop: showPicker ? '2.5rem' : 0 }}
          sandbox="allow-scripts allow-popups"
        />
        {StickyBar}
      </>
    )
  }

  // ── Invitation poster + sticky CTA ─────────────────────────────────────

  return (
    <div className={`pb-24 ${showPicker ? 'pt-10' : ''}`}>
      {templatePicker}
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
        <InvitationPoster
          event={event}
          guest={guest}
          tokenMap={tokenMap ?? {}}
          lang={invLang}
        />
      )}
      {StickyBar}
    </div>
  )
}
