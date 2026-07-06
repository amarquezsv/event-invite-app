import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  getGuests, getEvents, addGuest, updateGuest, deleteGuest,
  generateInviteLink, generateWhatsAppMsg, listInvitationPages,
} from '../../services/api'
import WhatsAppButton from '../../components/admin/WhatsAppButton'
import { getCountryFromPhone } from '../../utils/phoneCountry'
import { useLang } from '../../context/LanguageContext'
import { BUILT_IN_TEMPLATES } from '../../components/invitation/builtInTemplates'

/**
 * GuestManagement — admin page for managing guests across all events.
 *
 * Supports:
 *  - Event selector (URL param: ?eventId=)
 *  - Add guests with eventId + customNotes
 *  - Toggle confirmed / pending status inline
 *  - Preview invitation per guest
 *  - Generate WhatsApp deep link per guest
 *  - Delete guest
 */
export default function GuestManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlEventId = searchParams.get('eventId') ?? ''

  const [events,  setEvents]  = useState([])
  const [guests,  setGuests]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [selectedEventId, setSelectedEventId] = useState(urlEventId)

  // Delete confirmation
  const [deleting, setDeleting] = useState(null)

  // Send Invitation modal
  const [sendGuest,    setSendGuest]    = useState(null)   // guest being sent to
  const [sendFormat,   setSendFormat]   = useState('classic') // 'classic' | 'custom'
  const [sendPageId,   setSendPageId]   = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [sendWaUrl,    setSendWaUrl]    = useState(null)
  // Pages available in the Send modal — loaded from the guest's own event
  const [sendModalPages, setSendModalPages] = useState([])
  // Full-screen template preview overlay inside the modal
  const [previewPageId, setPreviewPageId] = useState(null)
  // invitationPageId confirmed saved in DB after last prepare
  const [savedInvitationPageId, setSavedInvitationPageId] = useState(null)
  // Language for the WhatsApp message (independent of the UI language)
  const [sendLang, setSendLang] = useState('es')

  const { lang, t } = useLang()

  // New-guest form
  const EMPTY = { name: '', whatsapp: '', seats: 2, customNotes: '', invitationPageId: '' }
  const [form,      setForm]      = useState(EMPTY)
  const [adding,    setAdding]    = useState(false)
  const [formError, setFormError] = useState(null)

  // Invitation pages for the selected event
  const [invitationPages, setInvitationPages] = useState([])

  // Load events once on mount
  useEffect(() => {
    getEvents()
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Keep URL in sync with selected event
  useEffect(() => {
    if (selectedEventId) {
      setSearchParams({ eventId: selectedEventId }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [selectedEventId, setSearchParams])

  // Load invitation pages whenever the selected event changes
  useEffect(() => {
    if (!selectedEventId) { setInvitationPages([]); return }
    listInvitationPages()
      .then((pages) => {
        const filtered = (Array.isArray(pages) ? pages : []).filter((p) => p.eventId === selectedEventId)
        setInvitationPages(filtered)
      })
      .catch(() => {})
  }, [selectedEventId])

  const loadGuests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getGuests(selectedEventId || undefined)
      setGuests(Array.isArray(data) ? data : [])
    } catch {
      setError(t('guests.failedLoad'))
    } finally {
      setLoading(false)
    }
  }, [selectedEventId])

  useEffect(() => { loadGuests() }, [loadGuests])

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
      const payload = {
        ...form,
        eventId: selectedEventId || null,
      }
      const newGuest = await addGuest(payload)
      setGuests((prev) => [newGuest, ...prev])
      setForm(EMPTY)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleToggleConfirmed(guest) {
    try {
      const updated = await updateGuest(guest.id, { confirmed: !guest.confirmed })
      setGuests((prev) => prev.map((g) => (g.id === guest.id ? updated : g)))
    } catch {
      alert(t('guests.failedUpdateStatus'))
    }
  }

  async function handleTemplateChange(guestId, value) {
    try {
      let updates
      if (!value) {
        // Event default — clear both overrides
        updates = { invitationPageId: null, templateId: null }
      } else if (value.startsWith('__builtin__:')) {
        // Built-in JSX template
        updates = { templateId: value.replace('__builtin__:', ''), invitationPageId: null }
      } else {
        // Custom invitation page
        updates = { invitationPageId: value, templateId: null }
      }
      const updated = await updateGuest(guestId, updates)
      setGuests((prev) => prev.map((g) => (g.id === guestId ? updated : g)))
    } catch {
      alert(t('guests.failedUpdateTemplate'))
    }
  }

  /** Returns the current <select> value for a guest's template assignment */
  function getGuestTemplateValue(g) {
    if (g.invitationPageId) return g.invitationPageId
    if (g.templateId)       return `__builtin__:${g.templateId}`
    return ''
  }

  // ── Send Invitation modal ─────────────────────────────────────

  function openSendModal(guest) {
    setSendGuest(guest)
    // Default to 'custom' when the guest already has a template, else 'classic'
    setSendFormat(guest.invitationPageId ? 'custom' : 'classic')
    setSendPageId(guest.invitationPageId ?? '')
    setSendWaUrl(null)
    setSendModalPages([])
    setSavedInvitationPageId(null)
    setPreviewPageId(null)
    setSendLang(lang) // default WA message language to current UI language
    // Load invitation pages for the guest's own event (not the list filter)
    const guestEventId = guest.eventId || selectedEventId
    if (guestEventId) {
      listInvitationPages()
        .then((pages) => {
          const filtered = (Array.isArray(pages) ? pages : []).filter(
            (p) => p.eventId === guestEventId
          )
          setSendModalPages(filtered)
        })
        .catch(() => setSendModalPages([]))
    } else {
      setSendModalPages([])
    }
  }

  function closeSendModal() {
    setSendGuest(null)
    setSendWaUrl(null)
    setSendModalPages([])
    setPreviewPageId(null)
    setSavedInvitationPageId(null)
  }

  async function handlePrepareInvite() {
    if (!sendGuest) return
    setSendingInvite(true)
    try {
      // Set or clear the guest's invitationPageId based on the chosen format
      const pageId = sendFormat === 'custom' ? (sendPageId || null) : null
      const updated = await updateGuest(sendGuest.id, { invitationPageId: pageId })
      setGuests((prev) => prev.map((g) => (g.id === sendGuest.id ? updated : g)))
      // Record what was actually persisted in the DB so the success UI can confirm it
      setSavedInvitationPageId(updated.invitationPageId ?? null)

      // Generate the WhatsApp URL in the selected language
      const data = sendGuest.eventId
        ? await generateWhatsAppMsg(sendGuest.eventId, sendGuest.id, sendLang)
        : await generateInviteLink(sendGuest.id, sendLang)
      setSendWaUrl(data.whatsappUrl)
    } catch {
      alert(t('guests.failedPrepareInvite'))
    } finally {
      setSendingInvite(false)
    }
  }

  async function handleDelete(id) {
    await deleteGuest(id)
    setGuests((prev) => prev.filter((g) => g.id !== id))
    setDeleting(null)
  }

  function copyLink(link) {
    navigator.clipboard
      .writeText(link)
      .then(() => alert(t('guests.linkCopied')))
      .catch(() => alert(`${t('guests.linkLabel')}: ${link}`))
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">{t('guests.title')}</h1>
        <Link
          to="/admin/events"
          className="text-sm text-violet-600 hover:text-violet-800"
        >
          {t('guests.allEvents')}
        </Link>
      </div>

      {/* Event selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          {t('guests.filterByEvent')}
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
        >
          <option value="">{t('guests.allEventsOption')}</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.name} {evt.date ? `· ${evt.date}` : ''}
            </option>
          ))}
        </select>
        {selectedEvent && (
          <div className="mt-2 flex gap-1">
            {['color1','color2','color3','color4','color5'].map((c) => (
              <div
                key={c}
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: selectedEvent.colorPalette?.[c] ?? '#e2e8f0' }}
              />
            ))}
            <span className="text-xs text-slate-400 ml-2">{selectedEvent.category}</span>
          </div>
        )}
      </div>

      {/* Add guest form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">{t('guests.addNewGuest')}</h2>

        {formError && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {formError}
          </p>
        )}

        <form onSubmit={handleAddGuest} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t('guests.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              placeholder="Jane Doe"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t('guests.whatsappNumber')} <span className="text-red-500">*</span>
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
              {form.whatsapp.length > 0 && (
                <div className="mt-0.5 h-4">
                  {(() => {
                    const country = getCountryFromPhone(form.whatsapp)
                    return country ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 leading-none">
                        <span className="text-sm leading-none">{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 leading-none">{t('guests.unknownCountry')}</span>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="w-24">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t('guests.seats')} <span className="text-red-500">*</span>
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
          </div>

          <div className="flex-1 min-w-44">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t('guests.customNotes')}
            </label>
            <input
              name="customNotes"
              value={form.customNotes}
              onChange={handleFormChange}
              placeholder="Park in north lot"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Template selector — only shown when the event has invitation pages */}
          {selectedEventId && invitationPages.length > 0 && (
            <div className="flex-1 min-w-44">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t('guests.invitationTemplate')}
              </label>
              <select
                name="invitationPageId"
                value={form.invitationPageId}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">{t('guests.eventDefault')}</option>
                {invitationPages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.isActive ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={adding}
            className="bg-violet-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition-colors text-sm whitespace-nowrap self-end mb-0.5"
          >
            {adding ? t('guests.adding') : t('guests.addGuest')}
          </button>
        </form>
      </div>

      {/* Guest table */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-slate-400 animate-pulse text-sm">{t('guests.loadingGuests')}</p>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-slate-400 text-sm">
            {t('guests.noGuests')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    t('guests.colName'), t('guests.colWA'), t('guests.colSeats'), t('guests.colNotes'),
                    ...(selectedEventId ? [t('guests.colTemplate')] : []),
                    t('guests.colStatus'), t('guests.colActions'),
                  ].map((h) => (
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
                      {g.eventId && !selectedEventId && (
                        <div className="text-xs text-slate-400 font-normal">
                          {events.find((e) => e.id === g.eventId)?.name ?? g.eventId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {(() => {
                          const country = getCountryFromPhone(g.whatsapp)
                          return country ? (
                            <span className="text-base leading-none shrink-0" title={country.name}>
                              {country.flag}
                            </span>
                          ) : null
                        })()}
                        <span>{g.whatsapp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.seats}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{g.customNotes}</td>

                    {/* Template selector — visible whenever an event is selected */}
                    {selectedEventId && (
                      <td className="px-4 py-3">
                        <select
                          value={getGuestTemplateValue(g)}
                          onChange={(e) => handleTemplateChange(g.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 max-w-40"
                        >
                          <option value="">{t('guests.defaultTemplate')}</option>
                          <optgroup label="Built-in">
                            {BUILT_IN_TEMPLATES.map((tmpl) => (
                              <option key={tmpl.id} value={`__builtin__:${tmpl.id}`}>
                                {tmpl.name}
                              </option>
                            ))}
                          </optgroup>
                          {invitationPages.length > 0 && (
                            <optgroup label="Custom Designs">
                              {invitationPages.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}{p.isActive ? ' ✓' : ''}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleConfirmed(g)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          g.confirmed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {g.confirmed ? t('guests.confirmed') : t('guests.pending')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Preview invitation */}
                        {g.eventId ? (
                          <Link
                            to={`/admin/preview/${g.eventId}/${g.id}`}
                            target="_blank"
                            className="text-xs text-violet-600 hover:text-violet-800 font-medium whitespace-nowrap"
                          >
                            {t('guests.preview')}
                          </Link>
                        ) : (
                          <a
                            href={g.inviteLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-violet-600 hover:text-violet-800 font-medium whitespace-nowrap"
                          >
                            {t('guests.preview')}
                          </a>
                        )}

                        {/* Copy invite link */}
                        <button
                          onClick={() => copyLink(g.inviteLink)}
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium whitespace-nowrap"
                        >
                          {t('guests.copyLink')}
                        </button>

                        {/* WhatsApp / Send Invite */}
                        <button
                          onClick={() => openSendModal(g)}
                          className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          {t('guests.sendInvite')}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleting(g.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium whitespace-nowrap"
                        >
                          {t('guests.deleteBtn')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">
              {t('guests.guestTotal', { n: guests.length })}
              {selectedEvent && ` · ${selectedEvent.name}`}
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleting(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-slate-900 mb-2">{t('guests.deleteConfirm')}</h3>
            <p className="text-sm text-slate-500 mb-5">{t('guests.deleteWarning')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom template preview overlay ────────────────────── */}
      {previewPageId && (
        <div className="fixed inset-0 z-60 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between bg-slate-900/95 backdrop-blur px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold">
                {sendModalPages.find((p) => p.id === previewPageId)?.name ?? t('guests.templatePreview')}
              </span>
              <span className="text-slate-400 text-xs">{t('guests.guestView')}</span>
            </div>
            <button
              onClick={() => setPreviewPageId(null)}
              className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {t('guests.closePreviewBtn')}
            </button>
          </div>
          {/* Full-screen iframe */}
          <iframe
            key={previewPageId}
            src={`/api/public/page/${encodeURIComponent(previewPageId)}`}
            title="Template Preview"
            className="flex-1 w-full border-0"
            sandbox="allow-scripts allow-popups"
          />
        </div>
      )}

      {/* ── Send Invitation modal ──────────────────────────────── */}
      {sendGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeSendModal} />
          <div className="relative bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
            <h3 className="font-bold text-slate-900 mb-0.5">{t('guests.sendInvitation')}</h3>
            <p className="text-sm text-slate-500 mb-5">
              {sendGuest.name} &middot; {sendGuest.whatsapp}
            </p>

            {/* Format tabs */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {t('guests.invitationFormat')}
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setSendFormat('classic'); setSendWaUrl(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  sendFormat === 'classic'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t('guests.classic')}
                <span className="block text-xs font-normal opacity-70">{t('guests.builtInPoster')}</span>
              </button>
              <button
                onClick={() => { setSendFormat('custom'); setSendWaUrl(null) }}
                disabled={sendModalPages.length === 0}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  sendFormat === 'custom'
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {t('guests.customTemplate')}
                <span className="block text-xs font-normal opacity-70">
                  {sendModalPages.length === 0 ? t('guests.noTemplatesForEvent') : t('guests.invitationEditor')}
                </span>
              </button>
            </div>

            {/* Template picker (custom only) */}
            {sendFormat === 'custom' && sendModalPages.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t('guests.selectTemplate')}
                </label>
                <select
                  value={sendPageId}
                  onChange={(e) => { setSendPageId(e.target.value); setSendWaUrl(null) }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">{t('guests.pickTemplate')}</option>
                  {sendModalPages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.isActive ? ' ✓ active' : ''}
                    </option>
                  ))}
                </select>
                {/* Preview button — only shown once a template is selected */}
                {sendPageId && (
                  <button
                    type="button"
                    onClick={() => setPreviewPageId(sendPageId)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-violet-300 text-violet-600 text-xs font-semibold hover:bg-violet-50 transition-colors"
                  >
                    {t('guests.previewTemplate')}
                  </button>
                )}
              </div>
            )}

            {/* Message language selector */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {t('guests.messageLanguage')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setSendLang('es'); setSendWaUrl(null) }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    sendLang === 'es'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🇪🇸 Español
                </button>
                <button
                  onClick={() => { setSendLang('en'); setSendWaUrl(null) }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    sendLang === 'en'
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>

            {/* WhatsApp link (shown after preparation) */}
            {sendWaUrl ? (
              <div className="mb-4">
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                  {t('guests.waReady')}
                  {savedInvitationPageId ? (
                    <span className="block mt-0.5 text-green-600">
                      {t('guests.templateSaved')} <strong>{sendModalPages.find((p) => p.id === savedInvitationPageId)?.name ?? savedInvitationPageId}</strong>
                    </span>
                  ) : sendFormat === 'classic' ? (
                    <span className="block mt-0.5 text-green-600">{t('guests.usingClassic')}</span>
                  ) : null}
                </p>
                <WhatsAppButton whatsappUrl={sendWaUrl} />
                {/* Verify link — opens the exact URL the guest will receive */}
                {sendGuest && (
                  <a
                    href={`/invite/${encodeURIComponent(sendGuest.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                  >
                    {t('guests.verifyGuestView')}
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={handlePrepareInvite}
                disabled={sendingInvite || (sendFormat === 'custom' && !sendPageId)}
                className="w-full mb-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {sendingInvite ? t('guests.preparing') : t('guests.prepareWA')}
              </button>
            )}

            <button
              onClick={closeSendModal}
              className="w-full py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
