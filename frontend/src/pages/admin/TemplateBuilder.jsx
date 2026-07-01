import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TemplateEditor  from '../../components/admin/templateBuilder/TemplateEditor'
import TokenSelector   from '../../components/admin/templateBuilder/TokenSelector'
import TemplatePreview from '../../components/admin/templateBuilder/TemplatePreview'
import TemplateForm    from '../../components/admin/templateBuilder/TemplateForm'
import {
  getTemplates,
  getTemplateById,
  addTemplate,
  updateTemplate,
} from '../../services/api'

/**
 * TemplateBuilder — full-featured admin page for creating and editing
 * custom invitation templates with live preview and token insertion.
 *
 * URL: /admin/template-builder
 * Query param: ?id=<templateId> opens an existing template for editing.
 *
 * Features:
 *  - HTML + CSS editors with monospace styling
 *  - Click-to-insert token sidebar
 *  - Real-time sandboxed preview with sample data
 *  - Create new / load existing / save / update
 */
export default function TemplateBuilder() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Ref to the HTML textarea — used to splice tokens at the cursor
  const htmlRef = useRef(null)

  // ── Template content ──────────────────────────────────────────────
  const [templateId, setTemplateId] = useState(null) // null = new template
  const [form, setForm] = useState({ name: '', html: '', css: '' })

  // ── UI state ──────────────────────────────────────────────────────
  const [isSaving,  setIsSaving]  = useState(false)
  const [savedMsg,  setSavedMsg]  = useState(null)
  const [error,     setError]     = useState(null)

  // ── Template list for the "Load" dropdown ─────────────────────────
  const [allTemplates,     setAllTemplates]     = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  // Load all templates once on mount for the Load dropdown
  useEffect(() => {
    getTemplates()
      .then((data) => setAllTemplates(Array.isArray(data) ? data : []))
      .catch(() => {
        // Non-fatal: the load dropdown won't populate but the editor still works
      })
      .finally(() => setLoadingTemplates(false))
  }, [])

  // If ?id= is in the URL on mount, load that template automatically
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) loadTemplateById(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────

  /** Fetch a template by ID and populate the editor */
  async function loadTemplateById(id) {
    setError(null)
    try {
      const tpl = await getTemplateById(id)
      setTemplateId(tpl.id)
      setForm({ name: tpl.name, html: tpl.html ?? '', css: tpl.css ?? '' })
      setSearchParams({ id: tpl.id }, { replace: true })
    } catch (err) {
      setError(`Failed to load template: ${err.message}`)
    }
  }

  /** Reset editor to a blank "new template" state */
  function handleNew() {
    setTemplateId(null)
    setForm({ name: '', html: '', css: '' })
    setSearchParams({}, { replace: true })
    setError(null)
    setSavedMsg(null)
  }

  /** Update a single form field */
  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  /**
   * Insert a token string at the current cursor position in the HTML textarea.
   * If no cursor position is available, the token is appended to the end.
   * Focus and cursor are restored after the React state update.
   */
  const handleInsertToken = useCallback((token) => {
    const ta = htmlRef.current

    if (!ta) {
      // Fallback: no ref available, just append
      setForm((prev) => ({ ...prev, html: prev.html + token }))
      return
    }

    const start = ta.selectionStart ?? ta.value.length
    const end   = ta.selectionEnd   ?? ta.value.length
    const newHtml = ta.value.slice(0, start) + token + ta.value.slice(end)

    setForm((prev) => ({ ...prev, html: newHtml }))

    // Restore focus and advance cursor to just after the inserted token
    requestAnimationFrame(() => {
      ta.focus()
      const newPos = start + token.length
      ta.setSelectionRange(newPos, newPos)
    })
  }, [])

  /** Validate, then create or update the template in Cosmos DB */
  async function handleSave() {
    setError(null)
    setSavedMsg(null)

    if (!form.name.trim()) {
      setError('Template name is required.')
      return
    }
    if (!form.html.trim()) {
      setError('HTML content is required.')
      return
    }

    setIsSaving(true)
    try {
      if (templateId) {
        // ── Update existing ────────────────────────────────
        const saved = await updateTemplate(templateId, form)
        // Refresh the name in the load dropdown
        setAllTemplates((prev) =>
          prev.map((t) => (t.id === saved.id ? { ...t, name: saved.name } : t))
        )
        setSavedMsg('Template updated successfully!')
      } else {
        // ── Create new ─────────────────────────────────────
        const saved = await addTemplate(form)
        setTemplateId(saved.id)
        setSearchParams({ id: saved.id }, { replace: true })
        setAllTemplates((prev) => [...prev, saved])
        setSavedMsg('Template saved successfully!')
      }

      // Auto-dismiss the success message after 4 s
      setTimeout(() => setSavedMsg(null), 4000)
    } catch (err) {
      setError(`Save failed: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto pb-20 sm:pb-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Template Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Design custom invitation templates with dynamic tokens and live preview.
          </p>
        </div>

        {/* Load existing template dropdown */}
        {!loadingTemplates && allTemplates.length > 0 && (
          <div className="shrink-0">
            <label htmlFor="load-tpl" className="block text-xs font-medium text-slate-500 mb-1">
              Load template
            </label>
            <select
              id="load-tpl"
              onChange={(e) => {
                if (e.target.value) loadTemplateById(e.target.value)
              }}
              value={templateId ?? ''}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white min-w-[200px]"
            >
              <option value="">— Select a template —</option>
              {allTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Status banners ───────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
        >
          {error}
        </div>
      )}
      {savedMsg && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3"
        >
          ✓ {savedMsg}
        </div>
      )}

      {/* ── Name + save row ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <TemplateForm
          name={form.name}
          isEditing={!!templateId}
          isSaving={isSaving}
          onNameChange={(val) => handleFieldChange('name', val)}
          onSave={handleSave}
          onNew={handleNew}
        />
      </div>

      {/* ── Editor + token sidebar ───────────────────────────────── */}
      <div className="grid xl:grid-cols-[1fr_260px] gap-5 mb-5">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <TemplateEditor
            html={form.html}
            css={form.css}
            htmlRef={htmlRef}
            onChange={handleFieldChange}
          />
        </div>

        {/* Token sidebar — stacks below editors on mobile */}
        <TokenSelector onInsert={handleInsertToken} />
      </div>

      {/* ── Live preview ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Live Preview
        </h2>
        <TemplatePreview html={form.html} css={form.css} />
      </section>
    </div>
  )
}
