import { Link, NavLink } from 'react-router-dom'

/**
 * Site-wide header with navigation links.
 * Uses NavLink for automatic active-state styling.
 */
export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="text-xl font-bold text-slate-900 hover:text-violet-600 transition-colors"
        >
          EventInvite
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-violet-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/invitation"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'text-violet-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            RSVP
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
