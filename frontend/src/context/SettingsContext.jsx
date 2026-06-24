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
  hours_weekday: '7:00 - 20:00',
  hours_saturday: '8:00 - 21:00',
  hours_sunday: '8:00 - 18:00',
  receipt_shop_name: '',
  receipt_location: '',
  receipt_phone: '',
  receipt_wifi_name: '',
  receipt_wifi_password: '',
  receipt_exchange_rate: 4100,
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
          hours_weekday: data.hours_weekday || DEFAULTS.hours_weekday,
          hours_saturday: data.hours_saturday || DEFAULTS.hours_saturday,
          hours_sunday: data.hours_sunday || DEFAULTS.hours_sunday,
          receipt_shop_name: data.receipt_shop_name || '',
          receipt_location: data.receipt_location || '',
          receipt_phone: data.receipt_phone || '',
          receipt_wifi_name: data.receipt_wifi_name || '',
          receipt_wifi_password: data.receipt_wifi_password || '',
          receipt_exchange_rate: Number(data.receipt_exchange_rate) || DEFAULTS.receipt_exchange_rate,
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
