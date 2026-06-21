import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2 } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/ice-levels'
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

export default function IceLevel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', requires_input: false })
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = () => {
    setLoading(true)
    fetch(API_URL, { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        setItems(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', requires_input: false })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name, requires_input: !!item.requires_input })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'

    setSubmitting(true)

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to save')

      setShowModal(false)
      fetchItems()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ice level?')) return

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to delete')
      }

      fetchItems()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-900 to-amber-800 bg-clip-text text-transparent">
                Ice Levels
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage drink ice customization</p>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900 to-amber-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-amber-950 hover:to-amber-900 transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Ice Level
            </button>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">

            {loading ? <Loader page={false} text="Loading ice levels..." /> : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left text-amber-600 font-semibold bg-amber-50/50 border-b border-amber-100">
                    <th className="px-6 py-4">#ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.requires_input && (
                            <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                              Custom input
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 text-amber-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="text-slate-400">
                          <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium">No ice levels found</p>
                          <p className="text-sm mt-1">Click "Add Ice Level" to create one</p>
                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-amber-200"
            >
              <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-6 py-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  {editing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editing ? 'Edit Ice Level' : 'Add Ice Level'}
                </h2>
                <p className="text-amber-100 text-xs mt-1">
                  {editing ? 'Update ice level details' : 'Create a new ice level option'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ice Level Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Less Ice, Normal Ice, Extra Ice"
                    required
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter a unique ice level name</p>
                </div>
                <label className="mb-5 flex items-start gap-3 rounded-xl border-2 border-slate-200 p-3 cursor-pointer hover:border-amber-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.requires_input}
                    onChange={(e) => setForm({ ...form, requires_input: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-amber-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-700">Requires custom input</span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      When selected during an order, the customer/staff can type an exact amount (e.g. More Ice).
                    </span>
                  </span>
                </label>
                <div className="flex gap-3 justify-end pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-xl text-sm font-medium hover:from-amber-950 hover:to-amber-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Ice Level' : 'Create Ice Level')}
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