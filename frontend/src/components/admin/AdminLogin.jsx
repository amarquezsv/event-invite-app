import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

/**
 * Full-page admin login form.
 * Validates the entered key against the VITE_ADMIN_KEY env var via the
 * AdminAuthContext and redirects to the dashboard on success.
 */
export default function AdminLogin() {
  const { login }  = useAdminAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [key, setKey]     = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const ok = login(key)
    if (ok) {
      // Redirect back to the page the user was trying to reach, or dashboard
      const from = location.state?.from?.pathname ?? '/admin/dashboard'
      navigate(from, { replace: true })
    } else {
      setError('Invalid admin key. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Panel</h1>
          <p className="text-sm text-slate-500">
            Enter the admin key to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="adminKey"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Admin Key
            </label>
            <input
              id="adminKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white font-semibold py-2.5 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
