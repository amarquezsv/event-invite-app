import { useLocation, Link } from 'react-router-dom'

/**
 * Confirmation — thank-you page shown after a guest confirms attendance.
 *
 * Receives guest and event data via React Router location state
 * (passed by the Invitation page on successful confirmation).
 * Falls back to generic copy when navigated to directly.
 */
export default function Confirmation() {
  const location  = useLocation()
  const { guest, event } = location.state ?? {}

  const firstName = guest?.name?.split(' ')[0]
  const seatLabel = guest?.seats === 1 ? 'seat' : 'seats'

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {/* Success icon */}
      <div className="rounded-full bg-green-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        {firstName ? `See you there, ${firstName}!` : "You're all set!"}
      </h2>

      <p className="text-slate-600 mb-3">
        {guest && event
          ? `Your ${guest.seats} ${seatLabel} for ${event.name} are confirmed.`
          : 'Your attendance has been confirmed. We look forward to celebrating with you!'}
      </p>

      {event?.date && (
        <p className="text-slate-400 text-sm mb-10">
          {event.date}
          {event.time && <span> · {event.time}</span>}
          {event.location && <span> — {event.location}</span>}
        </p>
      )}

      <Link
        to="/"
        className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  )
}
