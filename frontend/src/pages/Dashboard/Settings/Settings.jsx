import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'
import { useSettings } from '../../../context/SettingsContext.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/settings'

export default function Settings() {
  const { refresh } = useSettings()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    site_name: '', tagline: '', footer_location: '', footer_phone: '', footer_email: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    fetch(API_URL)
      .then((r) => { if (!r.ok) throw new Error('Failed to load settings'); return r.json() })
      .then((data) => {
        setForm({
          site_name: data.site_name ?? '',
          tagline: data.tagline ?? '',
          footer_location: data.footer_location ?? '',
          footer_phone: data.footer_phone ?? '',
          footer_email: data.footer_email ?? '',
        })
        setLogoPreview(data.logo ?? '')
        setLoading(false)
      })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    const fd = new FormData()
    fd.append('site_name', form.site_name)
    fd.append('tagline', form.tagline ?? '')
    fd.append('footer_location', form.footer_location ?? '')
    fd.append('footer_phone', form.footer_phone ?? '')
    fd.append('footer_email', form.footer_email ?? '')
    if (logoFile) fd.append('logo', logoFile)

    setSubmitting(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })
      if (!res.ok) throw new Error('Failed to save settings')
      setLogoFile(null)
      refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Site Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Control your logo, store name, and footer contact details.</p>
            </div>

            {loading ? (
              <Loader page={false} text="Loading settings..." />
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-sm p-6 space-y-6"
              >
                {/* Branding */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Branding</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <img src={logoPreview} alt="logo preview" className="w-16 h-16 object-contain rounded-full border bg-gray-50" />
                        ) : (
                          <div className="w-16 h-16 rounded-full border bg-gray-50 flex items-center justify-center text-gray-300 text-xs">No logo</div>
                        )}
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                          onChange={handleLogoChange}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                      <input type="text" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} required className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tagline <span className="text-gray-400 font-normal">(small text under name)</span></label>
                      <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Café" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Footer contact */}
                <div className="pt-2 border-t border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 mt-4">Footer Contact</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" value={form.footer_location} onChange={(e) => setForm({ ...form, footer_location: e.target.value })} placeholder="Phnom Penh, Cambodia" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="text" value={form.footer_phone} onChange={(e) => setForm({ ...form, footer_phone: e.target.value })} placeholder="+855 12 345 678" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={form.footer_email} onChange={(e) => setForm({ ...form, footer_email: e.target.value })} placeholder="contact@example.com" className={inputCls} />
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                  {saved && <span className="text-sm font-medium text-emerald-600">Saved!</span>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
