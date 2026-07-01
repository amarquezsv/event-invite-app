import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Header from './components/Header'
import Footer from './components/Footer'

// Public pages
import Home         from './pages/Home'
import Invitation   from './pages/Invitation'
import Confirmation from './pages/Confirmation'

// Admin shell & pages
import AdminLogin      from './components/admin/AdminLogin'
import AdminLayout     from './components/admin/AdminLayout'
import Dashboard       from './pages/admin/Dashboard'
import EventConfig     from './pages/admin/EventConfig'
import GuestManagement from './pages/admin/GuestManagement'
import TemplateManager  from './pages/admin/TemplateManager'
import TemplateBuilder  from './pages/admin/TemplateBuilder'

/**
 * ProtectedRoute — redirects unauthenticated users to /admin/login.
 */
function ProtectedRoute({ children }) {
  const { authenticated } = useAdminAuth()
  return authenticated ? children : <Navigate to="/admin/login" replace />
}

/**
 * PublicShell — wraps public pages in the shared Header / Footer layout.
 */
function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Home — shows dynamic event summary */}
          <Route path="/" element={<Home />} />
          {/* Personalised invitation page for each guest */}
          <Route path="/invite/:guestId" element={<Invitation />} />
          {/* Post-confirmation thank-you page */}
          <Route path="/confirmed" element={<Confirmation />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

/**
 * Root application component.
 *
 * Route structure:
 *   /                     → Public home page
 *   /invite/:guestId      → Personalised invitation poster
 *   /confirmed            → Attendance confirmed thank-you
 *   /admin/login          → Admin login (no auth required)
 *   /admin/dashboard      → Admin dashboard (protected)
 *   /admin/event          → Event configuration (protected)
 *   /admin/guests         → Guest management (protected)
 *   /admin/templates      → Template management (protected)
 */
export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin login — standalone, no shared layout */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin area with its own persistent shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="event"     element={<EventConfig />} />
            <Route path="guests"    element={<GuestManagement />} />
            <Route path="templates"        element={<TemplateManager />} />
            <Route path="template-builder" element={<TemplateBuilder />} />
          </Route>

          {/* All public routes share the Header + Footer shell */}
          <Route path="/*" element={<PublicShell />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}

