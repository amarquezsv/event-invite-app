import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useLang } from '../../context/LanguageContext'

const NAV_KEYS = [
  { to: '/admin/dashboard',         key: 'nav.dashboard' },
  { to: '/admin/events',            key: 'nav.events' },
  { to: '/admin/guests',            key: 'nav.guests' },
  { to: '/admin/invitation-editor', key: 'nav.invitations' },
  { to: '/admin/templates',         key: 'nav.templates' },
  { to: '/admin/template-builder',  key: 'nav.builder' },
  { to: '/admin/components',        key: 'nav.components' },
  { to: '/admin/event',             key: 'nav.legacyConfig' },
]

/**
 * Persistent shell for all admin pages.
 * Renders a top bar, a sidebar nav, and a main content <Outlet>.
 */
export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate   = useNavigate()
  const { lang, toggleLang, t } = useLang()

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
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className="text-xs font-bold text-violet-200 hover:text-white border border-violet-400 hover:border-white rounded px-2 py-0.5 transition-colors"
            >
              {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-violet-200 hover:text-white transition-colors"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — hidden on small screens */}
        <aside className="w-44 shrink-0 hidden sm:block">
          <nav className="space-y-1" aria-label="Admin navigation">
            {NAV_KEYS.map(({ to, key }) => (
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
                {t(key)}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="sm:hidden w-full fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50">
          {NAV_KEYS.map(({ to, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 py-3 text-center text-xs font-medium transition-colors ${
                  isActive ? 'text-violet-700' : 'text-slate-500'
                }`
              }
            >
              {t(key)}
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
