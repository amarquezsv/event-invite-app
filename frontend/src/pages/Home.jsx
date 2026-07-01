import { Link } from 'react-router-dom'

/**
 * Home page — hero section with event details and RSVP call-to-action.
 */
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 mb-4">
        You're invited
      </p>

      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
        An Evening to Remember
      </h1>

      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
        Join us for a special celebration. We would be honoured to have you with
        us on this memorable occasion.
      </p>

      {/* Event details grid */}
      <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Date
          </p>
          <p className="font-semibold text-slate-800">Saturday, Sept 20</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Time
          </p>
          <p className="font-semibold text-slate-800">6:00 PM</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Venue
          </p>
          <p className="font-semibold text-slate-800">The Grand Hall</p>
        </div>
      </div>

      <Link
        to="/invitation"
        className="inline-block rounded-full bg-violet-600 px-8 py-3.5 text-white font-semibold text-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors shadow-md"
      >
        RSVP Now
      </Link>
    </div>
  )
}
