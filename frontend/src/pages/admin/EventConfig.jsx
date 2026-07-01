import { useEffect, useState } from 'react'
import { getEventConfig, updateEventConfig, getTemplates } from '../../services/api'

/**
 * Built-in template options (defined in the frontend codebase).
 * To add a new built-in template, create the component and add it here.
 */
const BUILTIN_TEMPLATES = [
  { id: 'elegant', name: 'Elegant (Gold)' },
  { id: 'modern',  name: 'Modern (Dark)' },
  { id: 'classic', name: 'Classic (Rose)' },
]

const FIELD_DEFS = [
  { id: 'name',        label: 'Event Name',    required: true },
  { id: 'description', label: 'Description',   multiline: true },
  { id: 'location',    label: 'Venue / Location' },
  { id: 'address',     label: 'Full Address',  multiline: true },
  { id: 'date',        label: 'Date',          type: 'date' },
  { id: 'time',        label: 'Time',          type: 'time' },
]

const EMPTY_FORM = {
  name: '', description: '', location: '',
  address: '', date: '', time: '', templateId: 'elegant',
}

/**
 * EventConfig — admin page for configuring the event details and
 * selecting the invitation template.
 */
export default function EventConfig() {
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.all([getEventConfig(), getTemplates()])
      .then(([cfg, customTpls]) => {
        setForm({
          name:        cfg.name        ?? '',
          description: cfg.description ?? '',
          location:    cfg.location    ?? '',
          address:     cfg.address     ?? '',
          date:        cfg.date        ?? '',
          time:        cfg.time        ?? '',
          templateId:  cfg.templateId  ?? 'elegant',
        })
        // Merge built-in + custom templates from DB
        const customArr = Array.isArray(customTpls) ? customTpls : []
        if (customArr.length > 0) {
          setTemplates([
            ...BUILTIN_TEMPLATES,
            ...customArr.map((t) => ({ id: t.id, name: t.name })),
          ])
        }
      })
      .catch(() => setError('Failed to load configuration.'))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      await updateEventConfig(form)
      setSaved(true)
      // Auto-clear the success banner after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Event Configuration</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          ✓ Event configuration saved successfully.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
      >
        {FIELD_DEFS.map(({ id, label, required, multiline, type }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {multiline ? (
              <textarea
                id={id}
                name={id}
                value={form[id]}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            ) : (
              <input
                id={id}
                name={id}
                type={type ?? 'text'}
                value={form[id]}
                onChange={handleChange}
                required={required}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            )}
          </div>
        ))}

        {/* Template selector */}
        <div>
          <label
            htmlFor="templateId"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Invitation Template
          </label>
          <select
            id="templateId"
            name="templateId"
            value={form.templateId}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Add custom templates on the Templates page.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}
