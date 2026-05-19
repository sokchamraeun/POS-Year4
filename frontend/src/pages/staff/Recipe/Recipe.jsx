import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Recipe() {
  const [recipes, setRecipes] = useState([])
  const [sizes, setSizes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [preselected, setPreselected] = useState(null)
  const [form, setForm] = useState({ product_id: '', ingredient_id: '', quantity: '' })
  const [products, setProducts] = useState([])
  const [ingredients, setIngredients] = useState([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/recipes`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/products`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/sizes`, { headers }).then(r => r.json()),
    ])
      .then(([recJson, prodJson, ingJson, sizeJson]) => {
        const sizeMap = {}
        ;(sizeJson.data ?? sizeJson ?? []).forEach(s => { sizeMap[s.id] = s })
        setSizes(sizeMap)
        setRecipes(recJson.data ?? recJson ?? [])
        setProducts(prodJson.data ?? prodJson ?? [])
        setIngredients(ingJson.data ?? ingJson ?? [])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const grouped = recipes.reduce((acc, r) => {
    const pid = r.product_id
    if (!acc[pid]) acc[pid] = { product: r.product, sizes: {} }
    const sid = r.size_id
    if (!acc[pid].sizes[sid]) acc[pid].sizes[sid] = { size: r.size, ingredients: [] }
    acc[pid].sizes[sid].ingredients.push(r)
    return acc
  }, {})

  const openCreate = (productId, sizeId) => {
    setEditing(null)
    setPreselected({ product_id: productId, size_id: sizeId })
    setForm({ product_id: productId || '', size_id: sizeId || '', ingredient_id: '', quantity: '' })
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditing(r)
    setPreselected(null)
    setForm({ product_id: r.product_id, size_id: r.size_id, ingredient_id: r.ingredient_id, quantity: r.quantity })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = editing ? `${API_URL}/recipes/${editing.id}` : `${API_URL}/recipes`
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(editing ? { ...form } : form),
      })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchData()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this ingredient from recipe?')) return
    try {
      await fetch(`${API_URL}/recipes/${id}`, { method: 'DELETE', headers })
      fetchData()
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col"><Topbar /><main className="flex-1 flex items-center justify-center text-gray-500">Loading...</main></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Recipes</h1>
            <button onClick={() => openCreate(null, null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add New Recipe</button>
          </div>

          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}

          <div className="space-y-6">
            {Object.entries(grouped).map(([pid, prod]) => (
              <div key={pid} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">{prod.product?.name ?? `Product #${pid}`}</h2>
                  <button onClick={() => openCreate(pid, null)} className="text-blue-600 hover:underline text-xs font-medium">+ Add Ingredient</button>
                </div>
                {Object.entries(prod.sizes).map(([sid, sz]) => (
                  <div key={sid} className="border-t">
                    <div className="px-6 py-3 bg-gray-50 flex justify-between items-center text-sm font-medium text-gray-700">
                      <span>{sz.size?.name ?? `Size #${sid}`}</span>
                      <div className="flex gap-3">
                        <Link to={`/staff/recipe/batch-edit/${pid}/${sid}`} className="text-yellow-600 hover:underline text-xs">Edit All</Link>
                        <button onClick={() => openCreate(pid, sid)} className="text-blue-600 hover:underline text-xs">+ Add Ingredient</button>
                      </div>
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
                          {sz.ingredients.map((r) => (
                            <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-gray-800">{r.ingredient?.name}</td>
                              <td className="px-6 py-4 text-gray-800">{Number(r.quantity).toFixed(2)} {r.ingredient?.unit}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</button>
                                  <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Remove</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <div className="text-center text-gray-500 py-8">No recipes found.</div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {!editing && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select value={form.size_id} onChange={e => setForm({ ...form, size_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select size</option>
                    {Object.values(sizes).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
