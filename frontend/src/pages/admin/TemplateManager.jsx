import { useEffect, useState } from 'react'
import { getTemplates, addTemplate } from '../../services/api'

/**
 * TemplateManager — admin page for managing invitation templates.
 *
 * Built-in templates (elegant, modern, classic) are React components
 * bundled with the frontend and are always available. Custom templates
 * are stored in Cosmos DB and are rendered by injecting HTML/CSS.
 *
 * To add a new built-in template, create a component in
 * src/components/invitation/ and register it in InvitationPoster.jsx.
 */
export default function TemplateManager() {
  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [form,      setForm]      = useState({ name: '', html: '', css: '' })
  const [adding,    setAdding]    = useState(false)
  const [error,     setError]     = useState(null)
  const [saved,     setSaved]     = useState(false)

  useEffect(() => {
    getTemplates()
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    setAdding(true)
    try {
      const tpl = await addTemplate(form)
      setTemplates((prev) => [...prev, tpl])
      setForm({ name: '', html: '', css: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Templates</h1>
      <p className="text-sm text-slate-500 mb-6">
        Three built-in templates are always available (elegant, modern, classic).
        Add custom HTML templates below — they will appear in the Event Config
        template selector.
      </p>

      {/* ── Built-in templates (informational) ──────── */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {[
          { id: 'elegant', name: 'Elegant', desc: 'Cream & gold, serif' },
          { id: 'modern',  name: 'Modern',  desc: 'Dark, bold, minimal' },
          { id: 'classic', name: 'Classic', desc: 'White & rose, romantic' },
        ].map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <p className="font-semibold text-slate-800 text-sm mb-0.5">{t.name}</p>
            <p className="text-xs text-slate-400">{t.desc}</p>
            <span className="mt-2 inline-block text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              built-in
            </span>
          </div>
        ))}
      </div>

      {/* ── Custom templates from DB ─────────────────── */}
      {loading ? (
        <p className="text-slate-400 animate-pulse text-sm mb-6">Loading…</p>
      ) : templates.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <p className="font-semibold text-slate-800 text-sm mb-0.5">{t.name}</p>
              <p className="text-xs text-slate-400 font-mono truncate">{t.id}</p>
              <span className="mt-2 inline-block text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                custom
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm mb-6">No custom templates yet.</p>
      )}

      {/* ── Add custom template form ─────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Add Custom Template
        </h2>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {saved && (
          <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ Template saved successfully.
          </p>
        )}

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label
              htmlFor="tname"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              id="tname"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="My Custom Template"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="thtml"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              HTML Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="thtml"
              name="html"
              value={form.html}
              onChange={handleChange}
              required
              rows={10}
              placeholder={'<div class="p-8 text-center">\n  <h1>{{event.name}}</h1>\n</div>'}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
            <p className="text-xs text-slate-400 mt-1">
              Use Tailwind utility classes for styling. The HTML is stored and rendered as-is.
            </p>
          </div>

          <div>
            <label
              htmlFor="tcss"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Additional CSS (optional)
            </label>
            <textarea
              id="tcss"
              name="css"
              value={form.css}
              onChange={handleChange}
              rows={4}
              placeholder=".my-class { color: #d4a853; }"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {adding ? 'Saving…' : 'Add Template'}
          </button>
        </form>
      </div>
    </div>
  )
}
