import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGuests, getEvents } from '../../services/api'
import StatCard from '../../components/admin/StatCard'

/**
 * Admin Dashboard — multi-event aggregate view.
 *
 * Shows platform-wide stats (all events) plus a per-event breakdown table.
 */
export default function Dashboard() {
  const [guests,  setGuests]  = useState([])
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([getGuests(), getEvents()])
      .then(([g, e]) => {
        setGuests(Array.isArray(g) ? g : [])
        setEvents(Array.isArray(e) ? e : [])
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
      <p className="text-slate-500 text-sm mb-6">
        {events.length} event{events.length !== 1 ? 's' : ''} · {total} guest{total !== 1 ? 's' : ''} total
      </p>

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
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Confirmation Rate (All Events)</h2>
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

      {/* Per-event breakdown */}
      {!loading && events.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Events Breakdown</h2>
            <Link to="/admin/events" className="text-xs text-violet-600 hover:underline">
              Manage Events →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Event', 'Category', 'Date', 'Guests', 'Confirmed', 'Rate'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const evtGuests    = guests.filter((g) => g.eventId === evt.id)
                  const evtConfirmed = evtGuests.filter((g) => g.confirmed).length
                  const rate         = evtGuests.length
                    ? Math.round((evtConfirmed / evtGuests.length) * 100)
                    : 0
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <Link to={`/admin/guests?eventId=${evt.id}`} className="hover:text-violet-600">
                          {evt.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{evt.category}</td>
                      <td className="px-4 py-3 text-slate-500">{evt.date || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{evtGuests.length}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{evtConfirmed}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-violet-500"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-slate-500 font-medium mb-1">No events yet</p>
          <Link to="/admin/events" className="text-sm text-violet-600 hover:underline">
            Create your first event →
          </Link>
        </div>
      )}
    </div>
  )
}

