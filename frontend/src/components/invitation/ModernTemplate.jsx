/**
 * ModernTemplate
 *
 * Dark background, bold type, minimal layout.
 * Ideal for contemporary events.
 */
export default function ModernTemplate({ event, guest }) {
  const seatLabel = guest?.seats === 1 ? 'seat' : 'seats'

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-lg">
        {/* Category label */}
        <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.4em] mb-5">
          Invitation
        </p>

        {/* Event name — hero */}
        <h1 className="text-5xl sm:text-6xl font-black text-white leading-none mb-5 wrap-break-word">
          {event?.name ?? 'Our Event'}
        </h1>

        {event?.description && (
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {event.description}
          </p>
        )}

        {/* Details — left-accented list */}
        <div className="border-l-2 border-violet-500 pl-6 space-y-5 mb-8">
          {event?.date && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Date &amp; Time
              </p>
              <p className="text-white font-semibold">
                {event.date}
                {event?.time && <span className="text-violet-300"> · {event.time}</span>}
              </p>
            </div>
          )}
          {event?.location && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Venue
              </p>
              <p className="text-white font-semibold">{event.location}</p>
            </div>
          )}
          {event?.address && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
                Address
              </p>
              <p className="text-slate-300">{event.address}</p>
            </div>
          )}
        </div>

        {/* Guest callout */}
        {guest && (
          <div className="rounded-xl bg-violet-900/40 border border-violet-700 px-6 py-4">
            <p className="text-slate-300 text-sm">
              <span className="text-white font-semibold">{guest.name}</span>
              {' — '}
              <span className="text-violet-300 font-semibold">
                {guest.seats} {seatLabel} reserved
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
