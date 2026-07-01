/**
 * ElegantTemplate
 *
 * Cream and gold colour scheme with serif typography.
 * Suitable for formal weddings and black-tie events.
 */
export default function ElegantTemplate({ event, guest }) {
  const seatLabel = guest?.seats === 1 ? 'seat' : 'seats'

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 sm:p-8">
      <div
        className="w-full max-w-lg bg-white rounded-sm shadow-2xl"
        style={{ border: '3px solid #d4a853' }}
      >
        {/* Gold top border accent */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg,#d4a853,#f0d080,#d4a853)' }} />

        <div className="px-8 py-10 sm:px-12 sm:py-14 text-center" style={{ fontFamily: 'Georgia, serif' }}>
          {/* Ornament row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-amber-300" />
            <span className="text-amber-500 text-2xl select-none">✦</span>
            <div className="flex-1 h-px bg-amber-300" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600 mb-5">
            You are cordially invited
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight mb-4">
            {event?.name ?? 'Our Special Day'}
          </h1>

          {event?.description && (
            <p className="text-slate-500 italic text-sm sm:text-base mb-6 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-amber-200" />
            <span className="text-amber-400 text-lg select-none">♥</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* Event details */}
          <div className="space-y-2 text-slate-700 mb-8">
            {event?.date && (
              <p className="font-semibold text-base sm:text-lg">
                {event.date}
                {event?.time && <span className="text-amber-600"> · {event.time}</span>}
              </p>
            )}
            {event?.location && (
              <p className="font-medium text-slate-600">{event.location}</p>
            )}
            {event?.address && (
              <p className="text-slate-400 text-sm">{event.address}</p>
            )}
          </div>

          {/* Guest seat callout */}
          {guest && (
            <div
              className="rounded-sm px-6 py-4 mb-6 text-sm"
              style={{ background: '#fdf8ec', border: '1px solid #e9c97e' }}
            >
              <p className="text-slate-600">
                Dear{' '}
                <span className="font-semibold text-slate-800">{guest.name}</span>,
                we have reserved{' '}
                <span className="font-semibold text-amber-700">
                  {guest.seats} {seatLabel}
                </span>{' '}
                for you.
              </p>
            </div>
          )}

          {/* Bottom ornament */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-amber-300" />
            <span className="text-amber-500 text-2xl select-none">✦</span>
            <div className="flex-1 h-px bg-amber-300" />
          </div>
        </div>

        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg,#d4a853,#f0d080,#d4a853)' }} />
      </div>
    </div>
  )
}
