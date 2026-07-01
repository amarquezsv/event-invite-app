import { useEffect, useState } from 'react'
import { getGuests, getEventConfig } from '../../services/api'
import StatCard from '../../components/admin/StatCard'

/**
 * Admin Dashboard
 *
 * Shows aggregate stats for the current event:
 *   - Total guests invited
 *   - Guests who confirmed
 *   - Guests still pending
 *   - Seats reserved vs total seats allocated
 */
export default function Dashboard() {
  const [guests,  setGuests]  = useState([])
  const [event,   setEvent]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([getGuests(), getEventConfig()])
      .then(([g, e]) => {
        setGuests(Array.isArray(g) ? g : [])
        setEvent(e)
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const total          = guests.length
  const confirmed      = guests.filter((g) => g.confirmed).length
  const pending        = total - confirmed
  const totalSeats     = guests.reduce((sum, g) => sum + (g.seats ?? 0), 0)
  const confirmedSeats = guests
    .filter((g) => g.confirmed)
    .reduce((sum, g) => sum + (g.seats ?? 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      {event && (
        <p className="text-slate-500 text-sm mb-6">
          {event.name}
          {event.date && <span> · {event.date}</span>}
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Guests"    value={total}           color="violet" />
          <StatCard label="Confirmed"       value={confirmed}       color="green"  />
          <StatCard label="Pending"         value={pending}         color="amber"  />
          <StatCard
            label="Seats Confirmed"
            value={`${confirmedSeats} / ${totalSeats}`}
            color="blue"
          />
        </div>
      )}

      {!loading && total > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Confirmation Rate</h2>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${total ? Math.round((confirmed / total) * 100) : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {total ? Math.round((confirmed / total) * 100) : 0}% of guests have confirmed
          </p>
        </div>
      )}
    </div>
  )
}
