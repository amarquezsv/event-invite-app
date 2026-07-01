import { useEffect, useState } from 'react'
import { getEventConfig } from '../services/api'

/**
 * Home — public landing page.
 *
 * Fetches the event config from the backend and displays the event summary.
 * Falls back to placeholder content if the API is unreachable.
 */
export default function Home() {
  const [event,   setEvent]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEventConfig()
      .then(setEvent)
      .catch(() => setEvent(null)) // Silently fall back to static placeholder
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-4">
        You're invited
      </p>

      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
        {loading ? (
          <span className="animate-pulse text-slate-300">Loading…</span>
        ) : (
          event?.name ?? 'An Evening to Remember'
        )}
      </h1>

      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
        {event?.description ??
          'Join us for a special celebration. We would be honoured to have you with us on this memorable occasion.'}
      </p>

      {/* Event details grid */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Date
          </p>
          <p className="font-semibold text-slate-800">
            {loading ? '—' : event?.date || '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Time
          </p>
          <p className="font-semibold text-slate-800">
            {loading ? '—' : event?.time || '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Venue
          </p>
          <p className="font-semibold text-slate-800">
            {loading ? '—' : event?.location || '—'}
          </p>
        </div>
      </div>

      {event?.address && (
        <p className="text-sm text-slate-400 mb-8">{event.address}</p>
      )}

      <p className="text-sm text-slate-500 mt-8">
        Check your WhatsApp for your personalised invitation link.
      </p>
    </div>
  )
}

