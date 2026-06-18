import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import defaultLogo from '../assets/images/logo.jpg'

const API_URL = import.meta.env.VITE_API_URL

const DEFAULTS = {
  site_name: 'The Bird Nest',
  tagline: 'Café',
  logo: defaultLogo,
  footer_location: 'Phnom Penh, Cambodia',
  footer_phone: '+855 12 345 678',
  footer_email: 'contact@thebirdnest.com',
}

const SettingsContext = createContext({ settings: DEFAULTS, refresh: () => {} })

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)

  const refresh = useCallback(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        // Fall back to defaults for any blank fields so the UI is never empty
        setSettings({
          site_name: data.site_name || DEFAULTS.site_name,
          tagline: data.tagline || DEFAULTS.tagline,
          logo: data.logo || DEFAULTS.logo,
          footer_location: data.footer_location || DEFAULTS.footer_location,
          footer_phone: data.footer_phone || DEFAULTS.footer_phone,
          footer_email: data.footer_email || DEFAULTS.footer_email,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
