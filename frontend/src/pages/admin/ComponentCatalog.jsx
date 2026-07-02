/**
 * ComponentCatalog — admin page for browsing and managing design components.
 *
 * URL: /admin/components
 *
 * Features:
 *  - Browse all components grouped by category
 *  - Visual preview of each component's default HTML
 *  - Create custom components
 *  - Delete custom components (default components protected)
 */
import { useEffect, useState, useCallback } from 'react'
import {
  getComponents, createComponent, deleteComponent,
} from '../../services/api'

const TYPE_BADGE = {
  text:      'bg-blue-50 text-blue-700',
  image:     'bg-pink-50 text-pink-700',
  separator: 'bg-slate-100 text-slate-600',
  icon:      'bg-amber-50 text-amber-700',
}

const CATEGORY_ORDER = ['text', 'decorative', 'icon', 'separator', 'custom']

function groupByCategory(components) {
  const map = {}
  for (const c of components) {
    const cat = c.category ?? 'custom'
    if (!map[cat]) map[cat] = []
    map[cat].push(c)
  }
  return map
}

export default function ComponentCatalog() {
  const [components, setComponents] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [deleting,   setDeleting]   = useState(null)
  const [preview,    setPreview]    = useState(null)

  // New component form
  const EMPTY = { name: '', type: 'text', category: 'custom', defaultHtml: '', defaultCss: '', imageUrl: '', colorizable: true }
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [formError, setFormError] = useState(null)

  const loadComponents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getComponents()
      setComponents(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load components.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadComponents() }, [loadComponents])

  async function handleCreate(e) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const created = await createComponent({
        ...form,
        colorizable: Boolean(form.colorizable),
      })
      setComponents((prev) => [...prev, created])
      setForm(EMPTY)
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteComponent(id)
    setComponents((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  const grouped = groupByCategory(components)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Component Catalog</h1>
          <p className="text-slate-500 text-sm">Reusable building blocks for invitation templates</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
        >
          + New Component
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                {cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[cat].map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-violet-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900 text-sm leading-tight">{comp.name}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_BADGE[comp.type] ?? TYPE_BADGE.text}`}>
                            {comp.type}
                          </span>
                          {comp.colorizable && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                              colorizable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setPreview(comp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                          title="Preview"
                        >
                          👁
                        </button>
                        {!comp.isDefault && (
                          <button
                            onClick={() => setDeleting(comp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>

                    <code className="block text-xs bg-slate-50 rounded p-2 text-slate-500 font-mono truncate">
                      {comp.defaultHtml?.slice(0, 80) ?? ''}
                    </code>

                    {comp.allowedPositions?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {comp.allowedPositions.map((pos) => (
                          <span key={pos} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {pos}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {components.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">🎨</p>
              <p className="font-medium">No components yet</p>
              <p className="text-sm">Components are seeded automatically on first API call.</p>
            </div>
          )}
        </div>
      )}

      {/* Create form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">New Component</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                    placeholder="My Component"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                  >
                    {['text','image','separator','icon'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                >
                  {['text','decorative','icon','separator','custom'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default HTML</label>
                <textarea
                  rows={4}
                  value={form.defaultHtml}
                  onChange={(e) => setForm((p) => ({ ...p, defaultHtml: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400"
                  placeholder='<p style="color:{color1}">{eventName}</p>'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default CSS</label>
                <textarea
                  rows={3}
                  value={form.defaultCss}
                  onChange={(e) => setForm((p) => ({ ...p, defaultCss: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-400"
                  placeholder=".my-class { font-size: 1rem; }"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
                  placeholder="https://…"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.colorizable}
                  onChange={(e) => setForm((p) => ({ ...p, colorizable: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">Colorizable (palette colors apply)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreview(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full">
            <h3 className="font-bold text-slate-900 mb-3">{preview.name}</h3>
            {preview.defaultCss && <style>{preview.defaultCss}</style>}
            <div
              className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-16 overflow-auto"
              dangerouslySetInnerHTML={{ __html: preview.defaultHtml }}
            />
            <button
              onClick={() => setPreview(null)}
              className="mt-4 w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleting(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-slate-900 mb-2">Delete component?</h3>
            <p className="text-sm text-slate-500 mb-5">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
