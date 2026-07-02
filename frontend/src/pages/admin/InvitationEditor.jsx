import { useEffect, useRef, useState } from 'react'
import {
  listInvitationPages,
  createInvitationPage,
  updateInvitationPage,
  deleteInvitationPage,
  uploadInvitationAsset,
  activateInvitationPage,
  getEvents,
} from '../../services/api'
import { replaceTokens, TOKENS, SAMPLE_DATA, TOKEN_GROUPS } from '../../utils/replaceTokens'

// ── Starter HTML injected when creating a new invitation ─────────────────────

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">

  <h1 class="text-5xl font-bold text-gray-800 mb-4">You're Invited!</h1>
  <p class="text-xl text-gray-500 mb-2">Replace this content with your own design.</p>
  <p class="text-sm text-gray-400">
    Use any HTML, TailwindCSS classes, inline styles, or external images.
  </p>

</body>
</html>`

// ── Utility: convert a File object to a base64 string ────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1]) // strip "data:...;base64," prefix
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvitationEditor() {
  // ── List state ──────────────────────────────────────────────
  const [pages,      setPages]      = useState([])
  const [events,     setEvents]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activating, setActivating] = useState(null)  // id being activated

  // ── Editor state ─────────────────────────────────────────────
  // editing: null = list view | 'new' = creating | '<id>' = editing existing
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState({ name: '', eventId: '', html: DEFAULT_HTML })
  const [assets,    setAssets]    = useState([])
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState(null)

  // ── Preview state ─────────────────────────────────────────────
  const [preview,     setPreview]     = useState(false)
  const [tokenFilter, setTokenFilter] = useState('')
  const [tokensOpen,  setTokensOpen]  = useState(false)

  // ── Image upload state ────────────────────────────────────────
  const [uploading, setUploading] = useState(false)
  const fileRef    = useRef(null)

  // ── Clipboard feedback ────────────────────────────────────────
  const [copiedKey, setCopiedKey] = useState(null)

  // ── Initial data load ─────────────────────────────────────────
  useEffect(() => {
    Promise.all([listInvitationPages(), getEvents()])
      .then(([p, e]) => {
        setPages(Array.isArray(p) ? p : [])
        setEvents(Array.isArray(e) ? e : [])
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Navigation helpers ────────────────────────────────────────

  function startNew() {
    setEditing('new')
    setForm({ name: '', eventId: '', html: DEFAULT_HTML })
    setAssets([])
    setError(null)
    setSaved(false)
  }

  function startEdit(page) {
    setEditing(page.id)
    setForm({ name: page.name, eventId: page.eventId ?? '', html: page.html ?? DEFAULT_HTML })
    setAssets(page.assets ?? [])
    setError(null)
    setSaved(false)
  }

  function cancelEdit() {
    setEditing(null)
    setError(null)
    setSaved(false)
  }

  // ── Save ──────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Invitation name is required.')
      return
    }
    if (!form.html.trim()) {
      setError('HTML content is required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        name:    form.name.trim(),
        eventId: form.eventId || null,
        html:    form.html,
      }

      if (editing === 'new') {
        const created = await createInvitationPage(payload)
        setPages((prev) => [created, ...prev])
        setEditing(created.id)        // switch to edit mode so uploads work
        setAssets(created.assets ?? [])
      } else {
        const updated = await updateInvitationPage(editing, { ...payload, assets })
        setPages((prev) => prev.map((p) => (p.id === editing ? updated : p)))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────

  async function handleDelete(pageId) {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this invitation page? This cannot be undone.')) return
    try {
      await deleteInvitationPage(pageId)
      setPages((prev) => prev.filter((p) => p.id !== pageId))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleActivate(pageId) {
    setActivating(pageId)
    setError(null)
    try {
      const updated = await activateInvitationPage(pageId)
      // Mark this page active and all sibling pages inactive in local state
      setPages((prev) =>
        prev.map((p) =>
          p.eventId === updated.eventId ? { ...p, isActive: p.id === pageId } : p
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setActivating(null)
    }
  }

  // ── Image upload ──────────────────────────────────────────────

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    if (editing === 'new') {
      setError('Save the invitation first, then upload images.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const base64  = await fileToBase64(file)
      const result  = await uploadInvitationAsset(editing, {
        filename:    file.name,
        contentType: file.type,
        data:        base64,
      })
      setAssets((prev) => [...prev.filter((a) => a.name !== result.name), result])
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Clipboard ─────────────────────────────────────────────────

  function copyText(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // ── Helpers ───────────────────────────────────────────────────

  function eventName(eventId) {
    return events.find((e) => e.id === eventId)?.name ?? ''
  }

  function publicUrl(pageId) {
    return `${window.location.origin}/page/${pageId}`
  }

  // ─────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────

  if (!editing) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invitation Editor</h1>
            <p className="text-sm text-slate-500 mt-1">
              Design fully custom HTML invitation pages for any event.
            </p>
          </div>
          <button
            onClick={startNew}
            className="shrink-0 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            + New Invitation
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && pages.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-lg font-medium mb-1">No invitation pages yet</p>
            <p className="text-sm">Click "New Invitation" to design your first one.</p>
          </div>
        )}

        {/* Page cards */}
        {!loading && pages.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => (
              <div key={page.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm truncate">{page.name}</p>
                      {page.isActive && (
                        <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ Active
                        </span>
                      )}
                    </div>
                    {page.eventId && (
                      <p className="text-xs text-violet-500 mt-0.5 truncate">{eventName(page.eventId)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="shrink-0 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {page.assets?.length > 0 && (
                  <p className="text-xs text-slate-400">
                    {page.assets.length} image{page.assets.length !== 1 ? 's' : ''}
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  {new Date(page.updatedAt).toLocaleDateString(undefined, {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>

                <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-100">
                  <button
                    onClick={() => startEdit(page)}
                    className="text-xs bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg font-medium hover:bg-violet-100 transition-colors"
                  >
                    Edit
                  </button>
                  <a
                    href={publicUrl(page.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                  >
                    Preview ↗
                  </a>
                  <button
                    onClick={() => copyText(publicUrl(page.id), page.id)}
                    className="text-xs bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                  >
                    {copiedKey === page.id ? '✓ Copied' : 'Copy Link'}
                  </button>
                  {/* Only show Set Active when the page is linked to an event and not already active */}
                  {page.eventId && !page.isActive && (
                    <button
                      onClick={() => handleActivate(page.id)}
                      disabled={activating === page.id}
                      className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      {activating === page.id ? '…' : 'Set Active'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // EDITOR VIEW
  // ─────────────────────────────────────────────────────────────

  const tailwindSnippet = '<script src="https://cdn.tailwindcss.com"></script>'

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={cancelEdit}
          className="text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
        >
          ← Back
        </button>

        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Invitation name…"
          className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        {saved && (
          <span className="text-xs text-green-600 font-medium shrink-0">✓ Saved</span>
        )}

        <button
          onClick={() => setPreview(true)}
          className="shrink-0 text-sm bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
        >
          Preview
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 text-sm bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm -mt-2">{error}</p>
      )}

      {/* ── Editor + tools ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1">

        {/* HTML textarea */}
        <div className="xl:col-span-2 flex flex-col">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            HTML
          </label>
          <textarea
            value={form.html}
            onChange={(e) => setForm((prev) => ({ ...prev, html: e.target.value }))}
            placeholder="Paste or write your invitation HTML here…"
            spellCheck={false}
            className="flex-1 w-full font-mono text-xs leading-relaxed rounded-xl p-4
                       border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500
                       resize-none bg-slate-950 text-green-300 caret-green-400"
            style={{ minHeight: 'calc(100vh - 260px)' }}
          />
        </div>

        {/* Tools panel */}
        <div className="flex flex-col gap-4">

          {/* Link to event */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Link to Event
            </label>
            <select
              value={form.eventId}
              onChange={(e) => setForm((prev) => ({ ...prev, eventId: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">— No event —</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5 leading-snug">
              Guests of the selected event will see this invitation when they open their invite link.
            </p>
          </div>

          {/* TailwindCSS CDN snippet */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold text-slate-600 mb-1.5">TailwindCSS CDN</p>
            <code className="text-xs text-slate-500 block break-all mb-2 leading-snug">
              {tailwindSnippet}
            </code>
            <button
              onClick={() => copyText(tailwindSnippet, 'tailwind')}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded font-medium hover:bg-slate-100 transition-colors"
            >
              {copiedKey === 'tailwind' ? '✓ Copied' : 'Copy tag'}
            </button>
          </div>

          {/* Token reference */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setTokensOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-600">«» Available Tokens</span>
              <span className="text-slate-400 text-xs">{tokensOpen ? '▲' : '▼'}</span>
            </button>

            {tokensOpen && (
              <div className="p-3 space-y-3">
                <p className="text-xs text-slate-500 leading-snug">
                  Use <code className="bg-slate-100 px-1 rounded">{'{tokenKey}'}</code> anywhere in your HTML.
                  Tokens are replaced with the guest’s real data when the invitation is opened.
                </p>

                <input
                  type="search"
                  value={tokenFilter}
                  onChange={(e) => setTokenFilter(e.target.value)}
                  placeholder="Filter tokens…"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                {TOKEN_GROUPS.map((group) => {
                  const filtered = TOKENS.filter(
                    (t) =>
                      t.group === group &&
                      (!tokenFilter ||
                        t.key.toLowerCase().includes(tokenFilter.toLowerCase()) ||
                        t.label.toLowerCase().includes(tokenFilter.toLowerCase()))
                  )
                  if (!filtered.length) return null
                  return (
                    <div key={group}>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{group}</p>
                      <ul className="space-y-1">
                        {filtered.map((token) => (
                          <li key={token.key} className="flex items-center justify-between gap-1">
                            <div className="min-w-0">
                              <code
                                className="text-xs text-violet-700 bg-violet-50 px-1 py-0.5 rounded cursor-pointer hover:bg-violet-100 transition-colors"
                                onClick={() => copyText(`{${token.key}}`, `tok-${token.key}`)}
                                title={token.description}
                              >
                                {`{${token.key}}`}
                              </code>
                              <span className="text-xs text-slate-400 ml-1">{token.label}</span>
                            </div>
                            <span className="shrink-0 text-xs text-green-600">
                              {copiedKey === `tok-${token.key}` ? '✓' : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Upload Image
            </label>

            {editing === 'new' ? (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                Save the invitation first, then you can upload images.
              </p>
            ) : (
              <div className="flex gap-2 mb-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="flex-1 text-xs min-w-0
                             file:mr-2 file:py-1.5 file:px-2 file:rounded file:border-0
                             file:text-xs file:font-medium file:bg-violet-50 file:text-violet-700
                             hover:file:bg-violet-100"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="shrink-0 text-xs bg-violet-600 text-white px-3 py-1 rounded-lg
                             font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? '…' : 'Upload'}
                </button>
              </div>
            )}

            {/* Asset list */}
            {assets.length > 0 && (
              <ul className="space-y-1.5">
                {assets.map((asset) => (
                  <li
                    key={asset.name}
                    className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-slate-600 truncate min-w-0">{asset.name}</span>
                    <button
                      onClick={() => copyText(asset.url, `asset-${asset.name}`)}
                      className="shrink-0 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
                    >
                      {copiedKey === `asset-${asset.name}` ? '✓' : 'Copy URL'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Public link */}
          {editing !== 'new' && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Public link</p>
              <p className="text-xs text-slate-400 break-all mb-2 leading-snug">
                {publicUrl(editing)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText(publicUrl(editing), 'publink')}
                  className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded font-medium hover:bg-slate-100 transition-colors"
                >
                  {copiedKey === 'publink' ? '✓ Copied' : 'Copy'}
                </button>
                <a
                  href={publicUrl(editing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded font-medium hover:bg-slate-100 transition-colors"
                >
                  Open ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview modal ────────────────────────────────────── */}
      {preview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 shrink-0">
            <span className="text-sm text-white font-medium">
              Preview — {form.name || 'Untitled'}
              <span className="ml-2 text-xs text-slate-400 font-normal">(sample guest data applied)</span>
            </span>
            <button
              onClick={() => setPreview(false)}
              className="text-slate-400 hover:text-white text-sm transition-colors px-2 py-1 rounded hover:bg-slate-700"
            >
              ✕ Close
            </button>
          </div>
          <iframe
            srcDoc={replaceTokens(form.html, SAMPLE_DATA)}
            title="Invitation Preview"
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-popups"
          />
        </div>
      )}
    </div>
  )
}
