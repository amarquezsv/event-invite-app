import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

/**
 * LanguageContext
 *
 * Provides UI language switching (English / Spanish) across the admin panel.
 * The selected language persists in localStorage so it survives page refreshes.
 *
 * Usage:
 *   const { lang, toggleLang, t } = useLang()
 *   t('guests.title')              → 'Guest Management' | 'Gestión de Invitados'
 *   t('guests.guestTotal', {n: 3}) → '3 guest(s) total' | '3 invitado(s) en total'
 */

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('admin_lang') ?? 'es'
  )

  function switchLang(next) {
    localStorage.setItem('admin_lang', next)
    setLang(next)
  }

  function toggleLang() {
    switchLang(lang === 'es' ? 'en' : 'es')
  }

  /**
   * Translate a dot-notation key, optionally interpolating {varName} placeholders.
   *
   * @param {string} path  — e.g. 'guests.title' or 'common.cancel'
   * @param {object} vars  — e.g. { n: 5 }
   * @returns {string}
   */
  function t(path, vars = {}) {
    const keys = path.split('.')
    let val = translations[lang]
    for (const k of keys) {
      val = val?.[k]
      if (val === undefined) break
    }
    if (typeof val !== 'string') return path
    return val.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
