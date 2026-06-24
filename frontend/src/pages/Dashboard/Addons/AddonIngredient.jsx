import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle, Package } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function AddonIngredient() {
  const [addons, setAddons] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ addon_id: '', ingredient_id: '', quantity: '' })

  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchData = () => {
    setLoading(true)

    Promise.all([
      fetch(`${API_URL}/addon-ingredients`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
    ])
      .then(([addonJson, ingJson]) => {
        setAddons(addonJson.data ?? addonJson)
        setIngredients(ingJson.data ?? ingJson)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = (addonId = '') => {
    setEditing(null)
    setForm({ addon_id: addonId, ingredient_id: '', quantity: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      addon_id: item.addon_id,
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const url = editing
      ? `${API_URL}/addon-ingredients/${editing.id}`
      : `${API_URL}/addon-ingredients`

    const method = editing ? 'PUT' : 'POST'

    const body = editing
      ? { quantity: form.quantity }
      : form

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed')

      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this ingredient?')) return

    await fetch(`${API_URL}/addon-ingredients/${id}`, {
      method: 'DELETE',
      headers,
    })

    fetchData()
  }

  const addonCount = addons.length
  const activeAddons = addons.filter(a => a.ingredients?.length).length
  const totalRecords = addons.reduce((sum, a) => sum + (a.ingredients?.length || 0), 0)

  const filteredAddons = addons.filter(a =>
    !searchQuery || a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Addon Ingredients</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage addon composition</p>
            </div>
            <button
              onClick={() => openCreate()}
              className="bg-gradient-to-r from-teal-900 to-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-800 hover:to-teal-700 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              + Add Ingredient
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Records',    value: totalRecords, icon: ClipboardList, line: 'bg-blue-500',    box: 'border-blue-500 bg-blue-500 shadow-blue-500/20' },
              { label: 'With Ingredients', value: activeAddons, icon: CheckCircle,   line: 'bg-emerald-500', box: 'border-emerald-500 bg-emerald-500 shadow-emerald-500/20' },
              { label: 'All Addons',       value: addonCount,   icon: Package,       line: 'bg-slate-400',   box: 'border-slate-400 bg-slate-400 shadow-slate-400/20' },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                  <div className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${s.line}`} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                      <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">{s.value}</p>
                    </div>
                    <div className={`flex h-10 min-w-10 items-center justify-center rounded-xl border shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${s.box}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              )
            })}
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

          {/* CONTENT GRID (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {loading ? <Loader page={false} text="Loading..." /> : error ? (
              <div className="col-span-2 text-center py-10 text-red-500">{error}</div>
            ) : filteredAddons.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-slate-400">No addons found</div>
            ) : (
              filteredAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white rounded-xl border border-teal-300 shadow-sm overflow-hidden flex flex-col"
                >

                  {/* ADDON HEADER */}
                  <div className="flex items-center justify-between px-5 py-4 bg-teal-50 border-b border-teal-200 shrink-0">
                    <div>
                      <h2 className="font-semibold text-teal-800">{addon.name}</h2>
                      <p className="text-xs text-teal-600">${Number(addon.price).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => openCreate(addon.id)}
                      className="text-xs font-medium text-teal-700 hover:underline"
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  {/* TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-teal-800 text-white">
                        <tr className="text-left font-black">
                          <th className="px-5 py-3">Ingredient</th>
                          <th className="px-5 py-3">Qty</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addon.ingredients?.length ? (
                          addon.ingredients.map((ing) => (
                            <tr key={ing.pivot.id} className="border-t border-gray-100 hover:bg-teal-50/30 transition-colors">
                              <td className="px-5 py-3.5 text-gray-800 font-medium">{ing.name}</td>
                              <td className="px-5 py-3.5 text-gray-600">{Number(ing.pivot.quantity).toFixed(2)} {ing.unit}</td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEdit({ id: ing.pivot.id, addon_id: addon.id, ingredient_id: ing.id, quantity: ing.pivot.quantity })}
                                    className="px-2.5 py-1.5 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(ing.pivot.id)}
                                    className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">No ingredients</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              ))
            )}

          </div>

        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full mx-4" style={{ maxWidth: editing ? '24rem' : '40rem' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Ingredient' : 'Add Ingredient'}</h2>
              <form onSubmit={handleSubmit}>
                {!editing && (
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Addon</label>
                      <select
                        value={form.addon_id}
                        onChange={(e) => setForm({ ...form, addon_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                      >
                        <option value="">Select Addon</option>
                        {addons.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                      <select
                        value={form.ingredient_id}
                        onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                      >
                        <option value="">Select Ingredient</option>
                        {ingredients.map((i) => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">
                    Save
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
