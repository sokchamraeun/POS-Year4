import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/events'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', order: 0, is_active: true })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

  const fetchEvents = () => {
    setLoading(true)
    fetch(API_URL, { headers: authHeaders() })
      .then((res) => { if (!res.ok) throw new Error('Failed to fetch'); return res.json() })
      .then((json) => { setEvents(json.data ?? json); setLoading(false) })
      .catch((err) => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchEvents() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', order: 0, is_active: true })
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  const openEdit = (e) => {
    setEditing(e)
    setForm({ title: e.title ?? '', order: e.order ?? 0, is_active: e.is_active ?? true })
    setImageFile(null)
    setImagePreview(e.image)
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editing && !imageFile) { alert('Please choose an image.'); return }
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    // POST always (PHP cannot parse multipart on PUT); spoof method when editing
    const fd = new FormData()
    fd.append('title', form.title ?? '')
    fd.append('order', form.order)
    fd.append('is_active', form.is_active ? '1' : '0')
    if (imageFile) fd.append('image', imageFile)
    if (editing) fd.append('_method', 'PUT')

    setSubmitting(true)
    try {
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchEvents()
    } catch (err) { alert(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchEvents()
    } catch {}
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-900 to-teal-800 bg-clip-text text-transparent">
                Events
              </h1>
              <p className="text-sm text-slate-500 mt-1">Event images shown on the customer home page.</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-900 to-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-950 hover:to-teal-900 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              Add Event
            </button>
          </div>

          {loading ? (
            <Loader page={false} text="Loading events..." />
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">No events yet. Add one to show it on the home page.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {events.map((e) => (
                <div key={e.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative aspect-square bg-slate-100">
                    <img src={e.image} alt={e.title || 'Event'} className="w-full h-full object-cover" />
                    {!e.is_active && (
                      <span className="absolute top-2 left-2 bg-gray-800/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEdit(e)} className="px-3 py-1.5 text-xs font-medium bg-white text-slate-800 rounded-md hover:bg-slate-100">Edit</button>
                      <button onClick={() => handleDelete(e.id)} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 truncate">{e.title || 'Untitled'}</span>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">#{e.order}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6"
            >
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Event' : 'Add Event'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Image {editing && '(leave empty to keep current)'}
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="mt-2 h-32 w-full object-cover rounded border" />
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                    <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} min="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="flex-1 flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                      <span className="text-sm font-medium text-slate-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowModal(false)} disabled={submitting} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-gradient-to-r from-teal-900 to-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-teal-950 hover:to-teal-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
