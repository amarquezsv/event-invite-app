import { useState } from 'react'

/**
 * RSVPForm — legacy component. In the current system, guest attendance
 * is confirmed via the personalised /invite/:guestId page. This form
 * is kept as a reusable shell for future public RSVP flows.
 *
 * Props:
 *   onSubmit(data)  — async handler called with { name, email, attending }
 *   loading         — shows a spinner on the submit button when true
 */
export default function RSVPForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attending: 'yes',
  })
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (onSubmit) await onSubmit(formData)
    } catch (err) {
      setError(err?.message ?? 'Failed to submit. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Name field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Email Address <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* Attending radio group */}
      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">
          Will you attend?
        </legend>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={formData.attending === 'yes'}
              onChange={handleChange}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Yes, I'll be there!</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="attending"
              value="no"
              checked={formData.attending === 'no'}
              onChange={handleChange}
              className="accent-violet-600 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Sorry, I can't make it</span>
          </label>
        </div>
      </fieldset>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-violet-600 px-6 py-3 text-white font-semibold hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting…' : 'Submit RSVP'}
      </button>
    </form>
  )
}
