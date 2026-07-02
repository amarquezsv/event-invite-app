/**
 * EventManager — admin page for creating, editing, and deleting events.
 *
 * URL: /admin/events
 *
 * Features:
 *  - List all events with category badge, date, template info
 *  - Create new event via slide-in form
 *  - Edit existing event inline
 *  - Delete with confirmation
 *  - Color palette preview strip
 */
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getEvents, createEvent, updateEventDef, deleteEvent, getTemplates,
} from '../../services/api'
import EventForm from '../../components/admin/EventForm'

const CATEGORY_COLORS = {
  wedding:     'bg-pink-100 text-pink-700',
  birthday:    'bg-yellow-100 text-yellow-700',
  'baby-shower': 'bg-sky-100 text-sky-700',
  corporate:   'bg-slate-100 text-slate-700',
  anniversary: 'bg-rose-100 text-rose-700',
  graduation:  'bg-emerald-100 text-emerald-700',
  religious:   'bg-amber-100 text-amber-700',
  other:       'bg-violet-100 text-violet-700',
}

export default function EventManager() {
  const [events,    setEvents]    = useState([])
  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Drawer state
  const [drawer,   setDrawer]   = useState(null) // null | 'create' | eventObj
  const [deleting, setDeleting] = useState(null) // eventId being confirmed

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [evts, tmpl] = await Promise.all([getEvents(), getTemplates()])
      setEvents(Array.isArray(evts) ? evts : [])
      setTemplates(Array.isArray(tmpl) ? tmpl : [])
    } catch {
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave(formData) {
    if (drawer === 'create') {
      const created = await createEvent(formData)
      setEvents((prev) => [created, ...prev])
    } else {
      const updated = await updateEventDef(drawer.id, formData)
      setEvents((prev) => prev.map((e) => (e.id === drawer.id ? updated : e)))
    }
    setDrawer(null)
  }

  async function handleDelete(id) {
    await deleteEvent(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
  }

  function templateName(id) {
    return templates.find((t) => t.id === id)?.name ?? '—'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 text-sm">Manage all events on the platform</p>
        </div>
        <button
          onClick={() => setDrawer('create')}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
        >
          + New Event
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Event list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-medium">No events yet</p>
          <p className="text-sm">Create your first event to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Palette strip */}
              <div className="flex gap-1 shrink-0">
                {['color1','color2','color3','color4','color5'].map((c) => (
                  <div
                    key={c}
                    className="w-4 h-10 rounded-sm"
                    style={{ backgroundColor: evt.colorPalette?.[c] ?? '#e2e8f0' }}
                    title={evt.colorPalette?.[c]}
                  />
                ))}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 truncate">{evt.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[evt.category] ?? CATEGORY_COLORS.other}`}>
                    {evt.category}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                  {evt.date && <span>📅 {evt.date}</span>}
                  {evt.time && <span>🕐 {evt.time}</span>}
                  {evt.location && <span>📍 {evt.location}</span>}
                  <span>Template: {templateName(evt.selectedTemplateId)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/admin/guests?eventId=${evt.id}`}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Guests
                </Link>
                <button
                  onClick={() => setDrawer(evt)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleting(evt.id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit drawer */}
      {drawer !== null && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full overflow-y-auto p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {drawer === 'create' ? 'New Event' : `Edit: ${drawer.name}`}
            </h2>
            <EventForm
              initial={drawer === 'create' ? null : drawer}
              templates={templates}
              onSave={handleSave}
              onCancel={() => setDrawer(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleting(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-slate-900 mb-2">Delete event?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This action cannot be undone. The event and its configuration will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
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
