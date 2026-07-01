import RSVPForm from '../components/RSVPForm'

/**
 * Invitation page — renders the RSVP form inside a card.
 */
export default function Invitation() {
  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">RSVP</h2>
        <p className="text-slate-600">
          Please let us know if you'll be joining us.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
        <RSVPForm />
      </div>
    </div>
  )
}
