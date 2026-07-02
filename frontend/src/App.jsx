import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Header from './components/Header'
import Footer from './components/Footer'

// Public pages
import Home            from './pages/Home'
import Invitation      from './pages/Invitation'
import Confirmation    from './pages/Confirmation'
import PreviewPage     from './pages/PreviewPage'
import InvitationPage  from './pages/InvitationPage'

// Admin shell & pages
import AdminLogin        from './components/admin/AdminLogin'
import AdminLayout       from './components/admin/AdminLayout'
import Dashboard         from './pages/admin/Dashboard'
import EventConfig       from './pages/admin/EventConfig'
import EventManager      from './pages/admin/EventManager'
import GuestManagement   from './pages/admin/GuestManagement'
import TemplateManager   from './pages/admin/TemplateManager'
import TemplateBuilder   from './pages/admin/TemplateBuilder'
import ComponentCatalog  from './pages/admin/ComponentCatalog'
import InvitationEditor  from './pages/admin/InvitationEditor'

/**
 * ProtectedRoute — redirects unauthenticated users to /admin/login.
 */
function ProtectedRoute({ children }) {
  const { authenticated } = useAdminAuth()
  return authenticated ? children : <Navigate to="/admin/login" replace />
}

/**
 * PublicShell — wraps public pages in the shared Header / Footer layout.
 * Invitation-specific routes (/invite, /confirmed) are intentionally excluded
 * so guests see only the invitation with no navigation or admin links.
 */
function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/"                              element={<Home />} />
          {/* Multi-event preview page (public — admins open from guest table) */}
          <Route path="/preview/:eventId/:guestId"     element={<PreviewPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

/**
 * InvitationShell — layout wrapper for guest-facing routes.
 * No header, no navigation — guests only see the invitation and a minimal footer.
 * Uses <Outlet /> so React Router resolves child route paths correctly.
 */
function InvitationShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1">
        <Outlet />
      </main>
      {/* pb-20 keeps the text above the sticky CTA bar on the invite route */}
      <footer className="py-6 pb-20 text-center border-t border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} EventInvite App. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

/**
 * Root application component.
 *
 * Route structure:
 *   /                              → Public home page
 *   /invite/:guestId               → Personalised invitation poster
 *   /confirmed                     → Attendance confirmed thank-you
 *   /preview/:eventId/:guestId     → Admin / shareable invitation preview
 *   /admin/login                   → Admin login (no auth required)
 *   /admin/dashboard               → Admin dashboard (protected)
 *   /admin/events                  → Event manager (protected)
 *   /admin/event                   → Legacy single-event config (protected)
 *   /admin/guests                  → Guest management (protected)
 *   /admin/templates               → Template management (protected)
 *   /admin/template-builder        → Template builder (protected)
 *   /admin/components              → Component catalog (protected)
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
            <Route path="dashboard"           element={<Dashboard />} />
            <Route path="events"              element={<EventManager />} />
            <Route path="event"               element={<EventConfig />} />
            <Route path="guests"              element={<GuestManagement />} />
            <Route path="invitation-editor"   element={<InvitationEditor />} />
            <Route path="templates"           element={<TemplateManager />} />
            <Route path="template-builder"    element={<TemplateBuilder />} />
            <Route path="components"          element={<ComponentCatalog />} />
          </Route>

          {/* Full-screen public invitation page — no shell, no nav */}
          <Route path="/page/:id" element={<InvitationPage />} />

          {/* Guest-facing invitation routes — layout route ensures correct path matching */}
          <Route element={<InvitationShell />}>
            <Route path="/invite/:guestId" element={<Invitation />} />
            <Route path="/confirmed"        element={<Confirmation />} />
          </Route>

          {/* All remaining public routes share the Header + Footer shell */}
          <Route path="/*" element={<PublicShell />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}

