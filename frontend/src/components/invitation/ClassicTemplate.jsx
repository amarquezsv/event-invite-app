/**
 * ClassicTemplate
 *
 * White card with a rose accent header.
 * Romantic and traditional — perfect for wedding invitations.
 */
export default function ClassicTemplate({ event, guest }) {
  const seatLabel = guest?.seats === 1 ? 'seat' : 'seats'

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl overflow-hidden">
        {/* Rose header */}
        <div className="bg-rose-500 px-8 py-10 sm:py-12 text-center">
          <p className="text-rose-200 text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Wedding Invitation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            {event?.name ?? 'Our Wedding'}
          </h1>
        </div>

        {/* Card body */}
        <div className="px-8 py-8 sm:px-10 text-center">
          {event?.description && (
            <p className="text-slate-500 italic text-sm sm:text-base leading-relaxed mb-6">
              {event.description}
            </p>
          )}

          {/* Date / Time grid */}
          {(event?.date || event?.time) && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {event?.date && (
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">
                    Date
                  </p>
                  <p className="font-semibold text-slate-700 text-sm">{event.date}</p>
                </div>
              )}
              {event?.time && (
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">
                    Time
                  </p>
                  <p className="font-semibold text-slate-700 text-sm">{event.time}</p>
                </div>
              )}
            </div>
          )}

          {event?.location && (
            <p className="font-semibold text-slate-800 text-base mb-1">
              {event.location}
            </p>
          )}
          {event?.address && (
            <p className="text-slate-400 text-sm mb-6">{event.address}</p>
          )}

          {/* Guest seat callout */}
          {guest && (
            <div className="border-t border-rose-100 pt-6 mt-2">
              <p className="text-slate-600 text-sm">
                Dear{' '}
                <span className="font-bold text-slate-800">{guest.name}</span>,
                we have reserved{' '}
                <span className="font-bold text-rose-600">
                  {guest.seats} {seatLabel}
                </span>{' '}
                for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
