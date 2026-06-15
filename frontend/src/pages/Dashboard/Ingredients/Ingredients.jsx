import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

function getStatus(ingredient) {
  const qty = Number(ingredient.stock_quantity)
  const reorder = Number(ingredient.reorder_level)
  if (qty <= 0) return 'Out of Stock'
  if (qty <= reorder) return 'Low Stock'
  return 'In Stock'
}

const statusStyles = {
  'In Stock': 'text-amber-700 bg-amber-100 border border-amber-200',
  'Low Stock': 'text-amber-700 bg-amber-100 border border-amber-200',
  'Out of Stock': 'text-red-700 bg-red-100 border border-red-200',
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState([
    { label: 'Total Ingredients', value: '0', change: '-' },
    { label: 'Total Stock Value', value: '$0.00', change: '-' },
    { label: 'Low Stock Items', value: '0', change: '-' },
    { label: 'Out of Stock', value: '0', change: '-' },
  ])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', unit: '', stock_quantity: '', reorder_level: '', cost_per_unit: '' })
  const [search, setSearch] = useState('')
  const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockIngredient, setStockIngredient] = useState(null)
  const [stockForm, setStockForm] = useState({ quantity: '', note: '' })

  const fetchIngredients = () => {
    setLoading(true)
    fetch(`${API_URL}/ingredients`, { headers: authHeaders })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json() })
      .then(json => {
        const data = json.data ?? json
        setIngredients(data)
        const total = data.length
        const value = data.reduce((s, i) => s + Number(i.stock_quantity ?? 0) * Number(i.cost_per_unit ?? 0), 0)
        const low = data.filter((i) => Number(i.stock_quantity) > 0 && Number(i.stock_quantity) <= Number(i.reorder_level)).length
        const out = data.filter((i) => Number(i.stock_quantity) <= 0).length
        setStats([
          { label: 'Total Ingredients', value: String(total), change: `${data.filter((i) => Number(i.stock_quantity) > Number(i.reorder_level)).length} well stocked` },
          { label: 'Total Stock Value', value: `$${value.toFixed(2)}`, change: `$${(value / (total || 1)).toFixed(2)} avg` },
          { label: 'Low Stock Items', value: String(low), change: `${((low / (total || 1)) * 100).toFixed(0)}% of total` },
          { label: 'Out of Stock', value: String(out), change: out > 0 ? 'Needs restock' : 'All good' },
        ])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchIngredients() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', unit: '', stock_quantity: '', reorder_level: '', cost_per_unit: '' }); setShowModal(true) }

  const openEdit = (i) => { setEditing(i); setForm({ name: i.name, unit: i.unit, stock_quantity: i.stock_quantity, reorder_level: i.reorder_level, cost_per_unit: i.cost_per_unit ?? '' }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/ingredients/${editing.id}` : `${API_URL}/ingredients`
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
      await fetch(`${API_URL}/ingredients/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchIngredients()
    } catch {}
  }

  const openStockIn = (ing) => {
    setStockIngredient(ing)
    setStockForm({ quantity: '', note: '' })
    setShowStockModal(true)
  }

  const handleStockIn = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/inventory-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ingredient_id: stockIngredient.id,
          type: 'purchase',
          quantity: stockForm.quantity,
          note: stockForm.note,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed')
      }
      setShowStockModal(false)
      setStockIngredient(null)
      fetchIngredients()
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-900 to-amber-800 bg-clip-text text-transparent">
                Ingredients
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your inventory and stock levels</p>
            </div>
            <button 
              onClick={openCreate} 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900 to-amber-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-amber-800 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Ingredient
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, idx) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-md border-b-4 border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-2xl text-sm font-medium bg-white border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? <Loader page={false} text="Loading ingredients..." /> : error ? (
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
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Unit</th>
                      <th className="px-6 py-4">Stock Quantity</th>
                      <th className="px-6 py-4">Reorder Level</th>
                      <th className="px-6 py-4 text-right">Cost/Unit</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredients.map((i) => (
                      <tr key={i.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200">
                        <td className="px-6 py-4 font-semibold text-amber-600">{i.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{i.name}</td>
                        <td className="px-6 py-4 text-slate-600">{i.unit}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{Number(i.stock_quantity).toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-600">{Number(i.reorder_level).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">{i.cost_per_unit ? '$' + Number(i.cost_per_unit).toFixed(2) : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[getStatus(i)]}`}>
                            {getStatus(i)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openStockIn(i)} 
                              className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-200 border border-emerald-200"
                            >
                              Stock In
                            </button>
                            <button 
                              onClick={() => openEdit(i)} 
                              className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all duration-200 border border-amber-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(i.id)} 
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredIngredients.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="text-slate-400">
                            <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="font-medium">No ingredients found</p>
                            <p className="text-sm mt-1">Click "Add Ingredient" to create one</p>
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

      {/* Add/Edit Modal - Improved UI */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-amber-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-semibold text-lg">{editing ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
              <p className="text-amber-100 text-xs mt-1">{editing ? 'Update ingredient details' : 'Create a new ingredient'}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ingredient Name</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., Coffee Beans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit of Measurement</label>
                  <input 
                    type="text" 
                    value={form.unit} 
                    onChange={e => setForm({ ...form, unit: e.target.value })} 
                    required 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., kg, g, L, ml"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
                    <input 
                      type="number" 
                      value={form.stock_quantity} 
                      onChange={e => setForm({ ...form, stock_quantity: e.target.value })} 
                      step="0.01" 
                      min="0" 
                      required 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Reorder Level</label>
                    <input 
                      type="number" 
                      value={form.reorder_level} 
                      onChange={e => setForm({ ...form, reorder_level: e.target.value })} 
                      step="0.01" 
                      min="0" 
                      required 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Per Unit ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={form.cost_per_unit} 
                      onChange={e => setForm({ ...form, cost_per_unit: e.target.value })} 
                      step="0.01" 
                      min="0" 
                      className="w-full border border-slate-200 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-xl text-sm font-medium hover:from-amber-800 hover:to-amber-700 transition-all shadow-md flex items-center gap-2"
                >
                  {editing ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {showStockModal && stockIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStockModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-emerald-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-semibold text-lg">Stock In</h2>
              <p className="text-emerald-100 text-xs mt-1">Add quantity to inventory</p>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 rounded-xl p-4 mb-4 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-800">{stockIngredient.name}</p>
                <p className="text-xs text-emerald-600 mt-1">Current Stock: {Number(stockIngredient.stock_quantity).toFixed(2)} {stockIngredient.unit}</p>
              </div>
              <form onSubmit={handleStockIn}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity to Add</label>
                  <input 
                    type="number" 
                    value={stockForm.quantity} 
                    onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} 
                    step="0.01" 
                    min="0.01" 
                    required 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Note (optional)</label>
                  <input 
                    type="text" 
                    value={stockForm.note} 
                    onChange={e => setStockForm({ ...stockForm, note: e.target.value })} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Supplier name, invoice #, etc."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => { setShowStockModal(false); setStockIngredient(null) }} 
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-emerald-800 hover:to-emerald-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Stock In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}