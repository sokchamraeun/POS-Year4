import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_BASE = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', status: true })

  useEffect(() => { fetchCustomers() }, [])

  async function fetchCustomers() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/users?type=customer`, { headers: authHeaders })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setCustomers(json.data ?? json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({ name: '', email: '', password: '', phone: '', status: true })
    setEditing(null)
  }

  function openAddModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(user) {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone ?? '',
      status: user.status ?? true,
    })
    setEditing(user)
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.email) return
    try {
      const body = { ...formData }
      if (!body.password && editing) delete body.password

      const url = editing ? `${API_BASE}/users/${editing.id}` : `${API_BASE}/users`
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || `HTTP ${res.status}`)
      }

      setShowModal(false)
      resetForm()
      fetchCustomers()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this customer?')) return
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: authHeaders })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fetchCustomers()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <Loader text="Loading customers..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Customer
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-bold">&times;</button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-orange-50 border-b border-gray-200">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-orange-50">
                      <td className="px-6 py-4 text-gray-800 font-medium">{c.id}</td>
                      <td className="px-6 py-4 text-gray-800">{c.name}</td>
                      <td className="px-6 py-4 text-gray-600">{c.email}</td>
                      <td className="px-6 py-4 text-gray-600">{c.phone ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.status
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {c.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(c)}
                            className="text-amber-600 hover:text-amber-800 text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editing ? 'Edit Customer' : 'Add Customer'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="customer@email.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Optional"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password {editing && '(leave blank to keep)'}</label>
                    <input
                      type="password" value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editing ? 'Save Changes' : 'Add Customer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
