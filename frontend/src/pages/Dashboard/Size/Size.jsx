import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2 } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/sizes'

export default function SizePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to fetch sizes')

      const json = await res.json()
      setItems(json)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name })
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

      if (!res.ok) throw new Error('Failed to save size')

      setShowModal(false)
      fetchItems()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this size?')) return

    const token = localStorage.getItem('token')

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchItems()
    } catch {
      alert('Delete failed')
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
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                Sizes
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage product sizes</p>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-700 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Size
            </button>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">

            {loading ? <Loader page={false} text="Loading sizes..." /> : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left text-teal-600 font-semibold bg-teal-50/50 border-b border-teal-100">
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
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 group-hover:scale-105"
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
                          <p className="font-medium">No sizes found</p>
                          <p className="text-sm mt-1">Click "Add Size" to create one</p>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-teal-200"
            >
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  {editing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editing ? 'Edit Size' : 'Add New Size'}
                </h2>
                <p className="text-teal-100 text-xs mt-1">
                  {editing ? 'Update size details' : 'Create a new product size'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Size Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Small, Medium, Large"
                    required
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter a unique size name</p>
                </div>
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
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-teal-700 hover:to-teal-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update Size' : 'Create Size')}
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