import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/addons'

export default function Addon() {
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price: '' })

  const fetchAddons = () => {
    setLoading(true)
    fetch(API_URL)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json() })
      .then(json => { setAddons(json.data ?? json); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchAddons() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', price: '' }); setShowModal(true) }

  const openEdit = (a) => { setEditing(a); setForm({ name: a.name, price: a.price }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchAddons()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this addon?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchAddons()
    } catch {}
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Addons</h1>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add New Addon</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading addons...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Products</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {addons.map((a) => (
                    <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{a.id}</td>
                      <td className="px-6 py-4 text-gray-800">{a.name}</td>
                      <td className="px-6 py-4 text-gray-800">${Number(a.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-800 font-medium">{a.products_count ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/staff/addons/${a.id}`} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">View</Link>
                          <button onClick={() => openEdit(a)} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</button>
                          <button onClick={() => handleDelete(a.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {addons.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No addons found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Addon' : 'Add New Addon'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} step="0.01" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
