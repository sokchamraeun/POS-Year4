import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/ingredients'

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', unit: '', stock_quantity: '', reorder_level: '' })

  const fetchIngredients = () => {
    setLoading(true)
    fetch(API_URL)
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json() })
      .then(json => { setIngredients(json.data ?? json); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchIngredients() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', unit: '', stock_quantity: '', reorder_level: '' }); setShowModal(true) }

  const openEdit = (i) => { setEditing(i); setForm({ name: i.name, unit: i.unit, stock_quantity: i.stock_quantity, reorder_level: i.reorder_level }); setShowModal(true) }

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
      fetchIngredients()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ingredient?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchIngredients()
    } catch {}
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Ingredients</h1>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add New Ingredient</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading ingredients...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Unit</th>
                    <th className="px-6 py-3">Stock Quantity</th>
                    <th className="px-6 py-3">Reorder Level</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((i) => (
                    <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{i.id}</td>
                      <td className="px-6 py-4 text-gray-800">{i.name}</td>
                      <td className="px-6 py-4 text-gray-800">{i.unit}</td>
                      <td className="px-6 py-4 text-gray-800">{Number(i.stock_quantity).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-800">{Number(i.reorder_level).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/staff/ingredients/${i.id}`} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">View</Link>
                          <button onClick={() => openEdit(i)} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</button>
                          <button onClick={() => handleDelete(i.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ingredients.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No ingredients found.</td></tr>
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
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} step="0.01" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input type="number" value={form.reorder_level} onChange={e => setForm({ ...form, reorder_level: e.target.value })} step="0.01" min="0" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
