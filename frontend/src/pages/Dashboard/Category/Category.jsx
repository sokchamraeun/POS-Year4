import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/categories'
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

export default function Category() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '' })

  const fetchCategories = () => {
    setLoading(true)
    fetch(API_URL, { headers: authHeaders })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(json => {
        setCategories(json.data ?? json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '' })
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'

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
      fetchCategories()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return

    const token = localStorage.getItem('token')

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      fetchCategories()
    } catch {}
  }

  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Categories
              </h1>
              <p className="text-sm text-gray-500">
                Manage your product categories
              </p>
            </div>

            <button
              onClick={openCreate}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-teal-700 transition"
            >
              + Add Category
            </button>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white border border-teal-200 rounded-2xl shadow-sm overflow-hidden">

            {loading ? <Loader page={false} text="Loading categories..." /> : error ? (
              <div className="p-10 text-center text-red-500">
                {error}
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead className="bg-teal-50 border-b border-teal-200">
                  <tr className="text-left text-teal-700 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-teal-100 hover:bg-teal-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-lg text-xs font-semibold">
                          #{c.id}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {c.name}
                      </td>

                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {c.products_count ?? 0}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/staff/categories/${c.id}`}
                            className="px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 bg-white rounded-lg hover:bg-teal-50 transition"
                          >
                            View
                          </Link>

                          <button
                            onClick={() => openEdit(c)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-white rounded-lg hover:bg-blue-50 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(c.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition"
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No categories found
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

          <div className="bg-white border border-teal-200 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? 'Edit Category' : 'Add New Category'}
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  {editing ? 'Update' : 'Create'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}