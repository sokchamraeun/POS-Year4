import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/addons'
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

export default function Addon() {
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price: '' })

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
    setShowModal(true)
  }

  const openEdit = (a) => {
    setEditing(a)
    setForm({ name: a.name, price: a.price })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      fetchAddons()
    } catch (err) {
      alert(err.message)
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
    <div className="flex h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Addons
              </h1>
              <p className="text-sm text-gray-500">
                Manage extra product add-ons
              </p>
            </div>

            <button
              onClick={openCreate}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-teal-700 transition"
            >
              + Add Addon
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-teal-200 rounded-2xl shadow-sm overflow-hidden">

            {loading ? <Loader page={false} text="Loading addons..." /> : error ? (
              <div className="p-10 text-center text-red-500">
                {error}
              </div>
            ) : (
              <table className="w-full text-sm">

                <thead className="bg-teal-50 border-b border-teal-200">
                  <tr className="text-left text-teal-700 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {addons.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-teal-100 hover:bg-teal-50 transition"
                    >

                      <td className="px-6 py-4">
                        <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-lg text-xs font-semibold">
                          #{a.id}
                        </span>
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
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                          >
                            View
                          </Link>

                          <button
                            onClick={() => openEdit(a)}
                            className="px-3 py-1.5 text-xs font-semibold text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition"
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

                  {addons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
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

          <div className="bg-white border border-teal-200 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? 'Edit Addon' : 'Add Addon'}
            </h2>

            <form onSubmit={handleSubmit}>

              {/* NAME */}
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
                  className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* PRICE */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>

                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  className="w-full border border-teal-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
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