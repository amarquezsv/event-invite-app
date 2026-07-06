/**
 * EventForm — create/edit form for a multi-event record.
 *
 * Props:
 *   initial   — existing event object (null = new event)
 *   templates — array of template options [{ id, name }]
 *   onSave    — async (formData) => void
 *   onCancel  — () => void
 */
import { useState, useEffect } from 'react'
import ColorPaletteEditor from './ColorPaletteEditor'
import BuiltInTemplatePicker from './BuiltInTemplatePicker'
import { getRecommendedTemplateId } from '../invitation/builtInTemplates'
import { useLang } from '../../context/LanguageContext'

const CATEGORIES = [
  { value: 'wedding',     label: 'Wedding' },
  { value: 'birthday',    label: 'Birthday' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'corporate',   label: 'Corporate' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'graduation',  label: 'Graduation' },
  { value: 'religious',   label: 'Religious' },
  { value: 'other',       label: 'Other' },
]

const DEFAULT_PALETTE = {
  color1: '#21418d',
  color2: '#b8942d',
  color3: '#f7f3ea',
  color4: '#2e7d32',
  color5: '#ffffff',
}

export default function EventForm({ initial, templates = [], onSave, onCancel }) {
  const { lang } = useLang()

  const [form, setForm] = useState({
    name:               initial?.name               ?? '',
    category:           initial?.category           ?? 'other',
    date:               initial?.date               ?? '',
    time:               initial?.time               ?? '',
    location:           initial?.location           ?? '',
    address:            initial?.address            ?? '',
    templateId:         initial?.templateId         ?? getRecommendedTemplateId(initial?.category ?? 'other'),
    selectedTemplateId: initial?.selectedTemplateId ?? '',
    colorPalette:       initial?.colorPalette       ?? DEFAULT_PALETTE,
  })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  // When category changes on a NEW event (no initial data), auto-suggest a template
  useEffect(() => {
    if (initial) return  // don't override choices on edit
    setForm((prev) => ({
      ...prev,
      templateId: getRecommendedTemplateId(prev.category),
    }))
  }, [form.category, initial])

  function handleField(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Name + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleField}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            placeholder="The Johnson Wedding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleField}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            name="date"
            value={form.date}
            onChange={handleField}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            placeholder="Saturday, January 1, 2027"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
          <input
            name="time"
            value={form.time}
            onChange={handleField}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            placeholder="6:00 PM"
          />
        </div>
      </div>

      {/* Location + Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Venue / Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleField}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
          placeholder="The Grand Ballroom"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleField}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
          placeholder="123 Celebration Ave, City, State 00000"
        />
      </div>

      {/* Built-in Template Picker */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <BuiltInTemplatePicker
          value={form.templateId}
          onChange={(id) => setForm((prev) => ({ ...prev, templateId: id }))}
          eventCategory={form.category}
          lang={lang}
        />
      </div>

      {/* Custom (DB-stored) Template — shown only when templates exist */}
      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {lang === 'en' ? 'Custom HTML Template (optional)' : 'Plantilla HTML Personalizada (opcional)'}
          </label>
          <p className="text-xs text-slate-400 mb-2">
            {lang === 'en'
              ? 'Override the built-in template with a custom HTML design stored in the database.'
              : 'Reemplaza la plantilla integrada con un diseño HTML personalizado de la base de datos.'}
          </p>
          <select
            name="selectedTemplateId"
            value={form.selectedTemplateId}
            onChange={handleField}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
          >
            <option value="">{lang === 'en' ? '— Use built-in template —' : '— Usar plantilla integrada —'}</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Color Palette */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <ColorPaletteEditor
          palette={form.colorPalette}
          onChange={(p) => setForm((prev) => ({ ...prev, colorPalette: p }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
