import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard',        label: 'Dashboard' },
  { to: '/admin/event',            label: 'Event Config' },
  { to: '/admin/guests',           label: 'Guests' },
  { to: '/admin/templates',        label: 'Templates' },
  { to: '/admin/template-builder', label: 'Builder' },
]

/**
 * Persistent shell for all admin pages.
 * Renders a top bar, a sidebar nav, and a main content <Outlet>.
 */
export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate   = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="bg-violet-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">
            EventInvite · Admin
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-violet-200 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — hidden on small screens */}
        <aside className="w-44 shrink-0 hidden sm:block">
          <nav className="space-y-1" aria-label="Admin navigation">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="sm:hidden w-full fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-xs font-medium transition-colors ${
                  isActive ? 'text-violet-700' : 'text-slate-500'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Main content area */}
        <main className="flex-1 min-w-0 pb-16 sm:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
