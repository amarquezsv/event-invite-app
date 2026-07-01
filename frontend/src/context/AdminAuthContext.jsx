import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Simple admin authentication context.
 *
 * The admin key is compared against the VITE_ADMIN_KEY environment variable
 * which is injected at build time by Vite. For local dev add it to .env:
 *   VITE_ADMIN_KEY=your-secret-key
 *
 * ⚠️  For production, replace this with Azure Static Web Apps built-in auth
 *     (AAD / GitHub) or Azure AD B2C for proper server-validated identity.
 *
 * Authentication state is stored in sessionStorage so it survives page
 * refreshes within the same browser session but is cleared when the tab closes.
 */

const STORAGE_KEY = 'admin_authenticated'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true'
  )

  const login = useCallback((key) => {
    const adminKey = import.meta.env.VITE_ADMIN_KEY
    // If no key is configured (dev mode with no .env), allow access freely.
    if (!adminKey || key === adminKey) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
