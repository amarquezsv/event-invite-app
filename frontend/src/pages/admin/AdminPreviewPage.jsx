/**
 * AdminPreviewPage — admin-side full invitation preview with template switcher.
 *
 * URL: /admin/preview/:eventId/:guestId   (protected, opens in new tab)
 *
 * The selector exposes every available template in two groups:
 *   • Built-in Templates  — the 4 JSX component templates (elegant, modern,
 *                           classic, wedding-boda) with their distinct palettes.
 *   • Custom Designs      — any full-HTML / component invitation pages
 *                           created in the Invitation Editor for this event.
 *
 * Rendering mirrors Invitation.jsx exactly:
 *   1. built-in id        → JSX component rendered inline
 *   2. componentType page → JSX component rendered inline
 *   3. html page          → sandboxed iframe with tokens replaced
 *   4. CSS template       → InvitationRenderer in centered card
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  generatePreview,
  listInvitationPages,
  getInvitationPageById,
} from '../../services/api'
import ElegantTemplate     from '../../components/invitation/ElegantTemplate'
import ModernTemplate      from '../../components/invitation/ModernTemplate'
import ClassicTemplate     from '../../components/invitation/ClassicTemplate'
import WeddingBodaTemplate from '../../components/invitation/WeddingBodaTemplate'
import InvitationRenderer  from '../../components/invitation/InvitationRenderer'
import { BUILT_IN_TEMPLATES } from '../../components/invitation/builtInTemplates'
import { replaceTokens }   from '../../utils/replaceTokens'

// ── Template registries ──────────────────────────────────────────────────────

/** All built-in JSX templates keyed by their template id */
const BUILTIN_COMPONENTS = {
  'elegant':      ElegantTemplate,
  'modern':       ModernTemplate,
  'classic':      ClassicTemplate,
  'wedding-boda': WeddingBodaTemplate,
}

/** Component-based invitation pages (from the invitation editor) */
const PAGE_COMPONENTS = {
  'wedding-boda': WeddingBodaTemplate,
}

/** Prefix used in the <select> value to distinguish built-in template ids */
const BUILTIN_PREFIX  = '__builtin__:'
const DEFAULT_BUILTIN = `${BUILTIN_PREFIX}elegant`

function builtinId(templateId) { return `${BUILTIN_PREFIX}${templateId}` }
function isBuiltin(id)         { return id?.startsWith(BUILTIN_PREFIX) }
function templateKey(id)       { return id?.replace(BUILTIN_PREFIX, '') }

export default function AdminPreviewPage() {
  const { eventId, guestId } = useParams()

  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  /** All invitation pages for this event (lightweight list for the selector) */
  const [pages,       setPages]       = useState([])

  /** Value shown in the <select> */
  const [selectedId,   setSelectedId]   = useState(DEFAULT_BUILTIN)
  /** Full page object (html / componentType) — null when a built-in is shown */
  const [selectedPage, setSelectedPage] = useState(null)
  const [loadingPage,  setLoadingPage]  = useState(false)

  // ── Initial data load ────────────────────────────────────────────────────

  useEffect(() => {
    if (!eventId || !guestId) return

    Promise.all([
      generatePreview(eventId, guestId),
      listInvitationPages(),
    ])
      .then(([previewData, allPages]) => {
        setData(previewData)

        // Filter to pages that belong to this event
        const eventPages = (Array.isArray(allPages) ? allPages : []).filter(
          (p) => p.eventId === eventId,
        )
        setPages(eventPages)

        // Initial selection priority:
        //   1. Guest's assigned invitation page
        //   2. Event's built-in template (event.templateId)
        //   3. Fallback to elegant
        const assignedPage = previewData.invitationPage ?? null
        if (assignedPage?.id) {
          setSelectedId(assignedPage.id)
          setSelectedPage(assignedPage)
        } else {
          const evtTemplateId = previewData.event?.templateId
          setSelectedId(
            evtTemplateId && BUILTIN_COMPONENTS[evtTemplateId]
              ? builtinId(evtTemplateId)
              : DEFAULT_BUILTIN,
          )
          setSelectedPage(null)
        }
      })
      .catch(() => setError('Preview not available. The event or guest may not exist.'))
      .finally(() => setLoading(false))
  }, [eventId, guestId])

  // ── Template switcher ────────────────────────────────────────────────────

  async function handleSelectChange(newId) {
    if (newId === selectedId) return
    setSelectedId(newId)

    // Built-in template — no fetch needed
    if (isBuiltin(newId)) {
      setSelectedPage(null)
      return
    }

    // Reuse the already-loaded initial page to avoid an extra round-trip
    if (newId === data?.invitationPage?.id) {
      setSelectedPage(data.invitationPage)
      return
    }

    setLoadingPage(true)
    try {
      const page = await getInvitationPageById(newId)
      setSelectedPage(page)
    } catch { /* ignore — viewer stays on previous state */ }
    finally { setLoadingPage(false) }
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 animate-pulse text-sm">Loading preview…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
        <p className="text-slate-500 text-sm">{error ?? 'Preview unavailable.'}</p>
        <Link
          to="/admin/guests"
          className="text-violet-600 text-sm hover:underline"
        >
          ← Back to Guests
        </Link>
      </div>
    )
  }

  const { event, template, tokenMap } = data
  const guest = data.guest

  // ── Invitation renderer ──────────────────────────────────────────────────

  function renderInvitation() {
    if (loadingPage) {
      return (
        <div className="flex items-center justify-center h-full bg-slate-50">
          <p className="text-slate-400 animate-pulse text-sm">Loading template…</p>
        </div>
      )
    }

    // ① Built-in JSX template selected directly
    if (isBuiltin(selectedId)) {
      const key  = templateKey(selectedId)
      const Comp = BUILTIN_COMPONENTS[key]
      if (Comp) {
        return (
          <div className="overflow-y-auto h-full">
            <Comp
              event={event}
              guest={guest}
              tokenMap={tokenMap ?? {}}
              lang={event?.lang ?? 'es'}
            />
          </div>
        )
      }
    }

    // ② Component-based custom invitation page (JSX — responsive, animated)
    if (selectedPage?.componentType) {
      const Comp = PAGE_COMPONENTS[selectedPage.componentType]
      if (Comp) {
        return (
          <div className="overflow-y-auto h-full">
            <Comp
              event={event}
              guest={guest}
              tokenMap={tokenMap ?? {}}
              lang={event?.lang ?? 'es'}
            />
          </div>
        )
      }
    }

    // ③ Full-HTML custom invitation page — sandboxed iframe (pixel-perfect)
    if (selectedPage?.html) {
      return (
        <iframe
          key={selectedPage.id}
          srcDoc={replaceTokens(selectedPage.html, tokenMap ?? {})}
          title="Invitation Preview"
          className="w-full h-full border-0 block"
          sandbox="allow-scripts allow-popups"
        />
      )
    }

    // ④ Event has a custom CSS/HTML template (from the template builder)
    if (template?.html) {
      return (
        <div className="overflow-y-auto h-full flex items-start justify-center py-8 bg-slate-100">
          <div className="w-full max-w-sm shadow-2xl overflow-hidden rounded-xl">
            <InvitationRenderer
              templateHtml={template.html}
              templateCss={template.css}
              tokenMap={tokenMap ?? {}}
            />
          </div>
        </div>
      )
    }

    // ⑤ Nothing matched
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 text-sm">
        No renderable content for the selected template.
      </div>
    )
  }

  // Label shown next to the guest name
  const currentBuiltinMeta = isBuiltin(selectedId)
    ? BUILT_IN_TEMPLATES.find((t) => t.id === templateKey(selectedId))
    : null
  const selectedLabel = currentBuiltinMeta
    ? currentBuiltinMeta.name
    : (pages.find((p) => p.id === selectedId)?.name ?? '')

  // Preview area height:
  //   viewport − admin top bar (56px) − body py-6 padding (48px)
  //   − selector bar (~68px) − gap + hint (~48px)
  const PREVIEW_HEIGHT = 'calc(100vh - 240px)'

  return (
    <div className="flex flex-col gap-3">

      {/* ── Selector bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Guest / event info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {guest?.name}
            {event?.name && (
              <span className="text-slate-400 font-normal"> · {event.name}</span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin preview — guest view
            {selectedLabel && (
              <span className="ml-1 text-violet-600 font-medium">· {selectedLabel}</span>
            )}
          </p>
        </div>

        {/* Template picker */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="template-selector"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
          >
            Template:
          </label>
          <select
            id="template-selector"
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <optgroup label="Built-in Templates">
              {BUILT_IN_TEMPLATES.map((t) => (
                <option key={t.id} value={builtinId(t.id)}>
                  {t.name}
                </option>
              ))}
            </optgroup>
            {pages.length > 0 && (
              <optgroup label="Custom Designs">
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.isActive ? ' ✓' : ''}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Back link */}
        <Link
          to="/admin/guests"
          className="text-xs text-slate-500 hover:text-slate-800 whitespace-nowrap shrink-0"
        >
          ← Guests
        </Link>
      </div>

      {/* ── Preview area ──────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white"
        style={{ height: PREVIEW_HEIGHT, minHeight: '420px' }}
      >
        {renderInvitation()}
      </div>

      {/* Hint */}
      <p className="text-xs text-slate-400 text-center">
        Switching templates here does not change{' '}
        <strong>{guest?.name}</strong>'s assignment — use the Guest list to update it.
      </p>
    </div>
  )
}
