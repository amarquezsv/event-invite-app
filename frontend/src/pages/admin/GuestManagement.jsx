import { useEffect, useState, useCallback } from 'react'
import {
  getGuests,
  addGuest,
  updateGuest,
  generateInviteLink,
} from '../../services/api'
import WhatsAppButton from '../../components/admin/WhatsAppButton'
import { getCountryFromPhone } from '../../utils/phoneCountry'

/**
 * GuestManagement — admin page for managing the guest list.
 *
 * Features:
 *   - Add new guests (name, WhatsApp number, seat count)
 *   - Toggle confirmed / pending status inline
 *   - Copy personalised invitation link to clipboard
 *   - Generate and open pre-filled WhatsApp deep links
 */
export default function GuestManagement() {
  const [guests,       setGuests]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  // Map of guestId → whatsappUrl (loaded on demand)
  const [waUrls,       setWaUrls]       = useState({})

  // New-guest form
  const EMPTY = { name: '', whatsapp: '', seats: 2 }
  const [form,      setForm]      = useState(EMPTY)
  const [adding,    setAdding]    = useState(false)
  const [formError, setFormError] = useState(null)

  const loadGuests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGuests()
      setGuests(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load guests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGuests() }, [loadGuests])

  // ── New guest form ─────────────────────────────────────────────

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'seats' ? Number(value) : value,
    }))
  }

  async function handleAddGuest(e) {
    e.preventDefault()
    setFormError(null)
    setAdding(true)
    try {
      const newGuest = await addGuest(form)
      setGuests((prev) => [newGuest, ...prev])
      setForm(EMPTY)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setAdding(false)
    }
  }

  // ── Inline status toggle ───────────────────────────────────────

  async function handleToggleConfirmed(guest) {
    try {
      const updated = await updateGuest(guest.id, { confirmed: !guest.confirmed })
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? updated : g)))
    } catch {
      alert('Failed to update guest status.')
    }
  }

  // ── WhatsApp deep link (loaded on demand) ─────────────────────

  async function handleFetchWhatsApp(guest) {
    try {
      const data = await generateInviteLink(guest.id)
      setWaUrls((prev) => ({ ...prev, [guest.id]: data.whatsappUrl }))
    } catch {
      alert('Failed to generate invitation link.')
    }
  }

  // ── Copy invite link ──────────────────────────────────────────

  function copyLink(link) {
    navigator.clipboard
      .writeText(link)
      .then(() => alert('Invitation link copied to clipboard!'))
      .catch(() => alert(`Link: ${link}`))
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Guest Management</h1>

      {/* ── Add guest form ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Guest</h2>

        {formError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}

        <form onSubmit={handleAddGuest} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              placeholder="Jane Doe"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="mt-1 h-4" />
          </div>

          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleFormChange}
                required
                placeholder="+503 7712 3456"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {/* Fixed-height hint — always occupies space so the form row never shifts */}
              <div className="mt-1 h-4">
                {(() => {
                  const country = getCountryFromPhone(form.whatsapp)
                  if (country) {
                    return (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 leading-none">
                        <span className="text-sm leading-none">{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    )
                  }
                  if (form.whatsapp.length > 0) {
                    return <span className="text-xs text-slate-400 leading-none">Unknown country code</span>
                  }
                  return null
                })()}
              </div>
            </div>
          </div>

          <div className="w-24">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Seats <span className="text-red-500">*</span>
            </label>
            <input
              name="seats"
              type="number"
              min="1"
              max="20"
              value={form.seats}
              onChange={handleFormChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="mt-1 h-4" />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="bg-violet-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm whitespace-nowrap mb-5"
          >
            {adding ? 'Adding…' : '+ Add Guest'}
          </button>
        </form>
      </div>

      {/* ── Guest table ────────────────────────────────── */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400 animate-pulse text-sm">Loading guests…</p>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">
            No guests yet. Add your first guest above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Name', 'WhatsApp', 'Seats', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {g.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {(() => {
                          const country = getCountryFromPhone(g.whatsapp)
                          return country ? (
                            <span
                              className="text-base leading-none shrink-0"
                              title={country.name}
                            >
                              {country.flag}
                            </span>
                          ) : null
                        })()}
                        <span>{g.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.seats}</td>
                    <td className="px-4 py-3">
                      {/* Click the badge to toggle confirmed / pending */}
                      <button
                        onClick={() => handleToggleConfirmed(g)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          g.confirmed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {g.confirmed ? 'Confirmed' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Copy invite link */}
                        <button
                          onClick={() => copyLink(g.inviteLink)}
                          className="text-xs text-violet-600 hover:text-violet-800 font-medium whitespace-nowrap"
                        >
                          Copy Link
                        </button>

                        {/* WhatsApp button — fetch URL on first click */}
                        {waUrls[g.id] ? (
                          <WhatsAppButton whatsappUrl={waUrls[g.id]} />
                        ) : (
                          <button
                            onClick={() => handleFetchWhatsApp(g)}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium whitespace-nowrap"
                          >
                            Get WhatsApp ↗
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">
              {guests.length} guest{guests.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
