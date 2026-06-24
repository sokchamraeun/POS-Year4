import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/addons'
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

function getImageUrl(image) {
  if (!image) return ''
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function Addon() {
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredAddons = addons.filter(a =>
    !searchQuery || a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchAddons = () => {
    setLoading(true)
    fetch(API_URL, { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        setAddons(json.data ?? json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAddons()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', price: '' })
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({ name: a.name, price: a.price })
    setImageFile(null)
    setImagePreview(a.image ? getImageUrl(a.image) : '')
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Use FormData so the image can be uploaded; method-spoof PUT for edits.
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('price', form.price)
    if (imageFile) fd.append('image', imageFile)
    if (editing) fd.append('_method', 'PUT')

    const url = editing ? `${API_URL}/${editing.id}` : API_URL

    setSubmitting(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      })

      if (!res.ok) throw new Error('Failed to save')

      setShowModal(false)
      fetchAddons()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this addon?')) return

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      fetchAddons()
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
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-900 to-teal-800 bg-clip-text text-transparent">
                Addons
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage extra product add-ons</p>
            </div>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-900 to-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-950 hover:to-teal-900 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Addon
            </button>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search addons..."
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 w-80"
            />
            <button
              onClick={() => setSearchQuery(searchQuery)}
              className="bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              Search
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">

            {loading ? <Loader page={false} text="Loading addons..." /> : error ? (
              <div className="p-10 text-center text-red-500">
                {error}
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead className="bg-teal-50 border-b border-teal-100">
                  <tr className="text-left text-teal-600 font-semibold">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredAddons.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200 group"
                    >

                      <td className="px-6 py-4">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                          {String(a.id).padStart(2, '0')}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {a.image ? (
                          <img src={getImageUrl(a.image)} alt={a.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-xs">—</div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {a.name}
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ${Number(a.price).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-700 font-medium">
                          {a.products_count ?? 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/staff/addons/${a.id}`}
                            className="px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition"
                          >
                            View
                          </Link>

                          <button
                            onClick={() => openEdit(a)}
                            className="px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(a.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredAddons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        No addons found
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            )}

          </div>

        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-teal-200">

            <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-4">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                {editing ? 'Edit Addon' : 'Add New Addon'}
              </h2>
              <p className="text-teal-100 text-xs mt-1">
                {editing ? 'Update addon details' : 'Create a new addon option'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6">

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300 text-xs">No image</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g., Whipped Cream, Chocolate Syrup"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-xl text-sm font-medium hover:from-teal-950 hover:to-teal-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
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

          </div>

        </div>
      )}

    </div>
  )
}