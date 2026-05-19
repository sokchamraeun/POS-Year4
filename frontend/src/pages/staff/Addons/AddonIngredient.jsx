import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function AddonIngredient() {
  const [addons, setAddons] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [preselectedAddonId, setPreselectedAddonId] = useState(null)
  const [form, setForm] = useState({ addon_id: '', ingredient_id: '', quantity: '' })
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchData = (p) => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/addon-ingredients?page=${p}`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
    ])
      .then(([addonJson, ingJson]) => {
        setAddons(addonJson.data ?? [])
        setPage(addonJson.current_page ?? 1)
        setLastPage(addonJson.last_page ?? 1)
        setTotal(addonJson.total ?? 0)
        setFrom(addonJson.from ?? 0)
        setTo(addonJson.to ?? 0)
        setIngredients(ingJson.data ?? ingJson ?? [])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchData(1) }, [])

  const openCreate = (addonId) => {
    setEditing(null)
    setPreselectedAddonId(addonId)
    setForm({ addon_id: addonId || '', ingredient_id: '', quantity: '' })
    setShowModal(true)
  }

  const openEdit = (ai) => {
    setEditing(ai)
    setPreselectedAddonId(null)
    setForm({ addon_id: ai.addon_id, ingredient_id: ai.ingredient_id, quantity: ai.quantity })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editing ? `${API_URL}/addon-ingredients/${editing.id}` : `${API_URL}/addon-ingredients`
    const method = editing ? 'PUT' : 'POST'
    try {
      const body = editing ? { quantity: form.quantity } : form
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchData(page)
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this ingredient from addon?')) return
    try {
      await fetch(`${API_URL}/addon-ingredients/${id}`, { method: 'DELETE', headers })
      fetchData(page)
    } catch {}
  }

  const pageNumbers = () => {
    const pages = []
    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) pages.push(i)
    }
    return pages.reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
      acc.push(p)
      return acc
    }, [])
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Addon Ingredients</h1>
            <button onClick={() => openCreate(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add New Ingredient</button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              {addons.map((addon) => (
                <div key={addon.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">{addon.name} <span className="text-gray-500 font-normal">(${Number(addon.price).toFixed(2)})</span></h2>
                    <button onClick={() => openCreate(addon.id)} className="text-blue-600 hover:underline text-xs font-medium">+ Add Ingredient</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                          <th className="px-6 py-3">Ingredient</th>
                          <th className="px-6 py-3">Quantity</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addon.ingredients?.length ? addon.ingredients.map((ing) => (
                          <tr key={ing.pivot.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-gray-800">{ing.name}</td>
                            <td className="px-6 py-4 text-gray-800">{Number(ing.pivot.quantity).toFixed(2)} {ing.unit}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openEdit({ id: ing.pivot.id, addon_id: addon.id, ingredient_id: ing.id, quantity: ing.pivot.quantity })} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</button>
                                <button onClick={() => handleDelete(ing.pivot.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Remove</button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="px-6 py-6 text-center text-gray-500">No ingredients assigned.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {addons.length === 0 && (
                <div className="text-center text-gray-500 py-8">No addons found.</div>
              )}
            </div>
          )}

          {lastPage > 1 && !loading && !error && (
            <div className="bg-white rounded-xl shadow-sm px-6 py-4 mt-6 flex items-center justify-between">
              <span className="text-xs text-gray-500">Showing {from}–{to} of {total}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => fetchData(page - 1)} disabled={page <= 1} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Prev</button>
                {pageNumbers().map((item, i) =>
                  item === '...' ? (
                    <span key={`e${i}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                  ) : (
                    <button key={item} onClick={() => fetchData(item)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${item === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{item}</button>
                  )
                )}
                <button onClick={() => fetchData(page + 1)} disabled={page >= lastPage} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page >= lastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Next</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Addon</label>
                  <select value={form.addon_id} onChange={e => setForm({ ...form, addon_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select addon</option>
                    {addons.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              {!editing && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                  <select value={form.ingredient_id} onChange={e => setForm({ ...form, ingredient_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select ingredient</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} step="0.01" min="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
