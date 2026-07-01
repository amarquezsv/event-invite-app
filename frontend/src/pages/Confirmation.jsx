import { Link } from 'react-router-dom'

/**
 * Confirmation page — shown after a successful RSVP submission.
 */
export default function Confirmation() {
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

      <h2 className="text-3xl font-bold text-slate-900 mb-3">You're all set!</h2>
      <p className="text-slate-600 mb-8">
        Thank you for your RSVP. We look forward to celebrating with you!
      </p>

      <Link
        to="/"
        className="inline-block rounded-full bg-violet-600 px-8 py-3 text-white font-semibold hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
