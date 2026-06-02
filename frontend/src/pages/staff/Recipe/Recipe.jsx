import React, { useState, useEffect } from 'react'
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
  const [modalRows, setModalRows] = useState([])
  const [products, setProducts] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [categories, setCategories] = useState({})
  const [batchEdit, setBatchEdit] = useState(null)
  const [batchRows, setBatchRows] = useState([])
  const [batchSaving, setBatchSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/recipes`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/products`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/sizes`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/categories`, { headers }).then(r => r.json()),
    ])
      .then(([recJson, prodJson, ingJson, sizeJson, catJson]) => {
        const sizeMap = {}
        ;(sizeJson.data ?? sizeJson ?? []).forEach(s => { sizeMap[s.id] = s })
        setSizes(sizeMap)
        const catMap = {}
        ;(catJson.data ?? catJson ?? []).forEach(c => { catMap[c.id] = c })
        setCategories(catMap)
        setRecipes(recJson.data ?? recJson ?? [])
        setProducts(prodJson.data ?? prodJson ?? [])
        setIngredients(ingJson.data ?? ingJson ?? [])
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const grouped = recipes.reduce((acc, r) => {
    const catId = r.product?.category_id ?? 'uncategorized'
    if (selectedCategory !== 'All' && String(catId) !== String(selectedCategory)) return acc
    if (searchQuery && !r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return acc
    if (!acc[catId]) acc[catId] = { category: categories[catId] ?? null, products: {} }
    const pid = r.product_id
    if (!acc[catId].products[pid]) acc[catId].products[pid] = { product: r.product, sizes: {} }
    const sid = r.size_id
    if (!acc[catId].products[pid].sizes[sid]) acc[catId].products[pid].sizes[sid] = { size: r.size, ingredients: [] }
    acc[catId].products[pid].sizes[sid].ingredients.push(r)
    return acc
  }, {})

  const openCreate = (productId, sizeId) => {
    setEditing(null)
    setPreselected({ product_id: productId, size_id: sizeId })
    setForm({ product_id: productId || '', size_id: sizeId || '', ingredient_id: '', quantity: '' })
    setModalRows([{ key: Date.now(), ingredient_id: '', quantity: '', _remove: false }])
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditing(r)
    setPreselected(null)
    setForm({ product_id: r.product_id, size_id: r.size_id, ingredient_id: r.ingredient_id, quantity: r.quantity })
    setShowModal(true)
  }

  const addModalRow = () => {
    setModalRows([...modalRows, { key: Date.now(), ingredient_id: '', quantity: '', _remove: false }])
  }

  const updateModalRow = (key, field, value) => {
    setModalRows(modalRows.map(r => r.key === key ? { ...r, [field]: value } : r))
  }

  const toggleModalRowRemove = (key) => {
    setModalRows(modalRows.map(r => r.key === key ? { ...r, _remove: !r._remove } : r))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      const exists = recipes.some(r =>
        r.id !== editing.id &&
        r.product_id == form.product_id &&
        r.size_id == form.size_id &&
        r.ingredient_id == form.ingredient_id
      )
      if (exists) {
        const name = ingredients.find(i => i.id == form.ingredient_id)?.name || form.ingredient_id
        alert(`Ingredient already in recipe: ${name}`)
        return
      }
      const res = await fetch(`${API_URL}/recipes/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(Object.values(d.errors ?? d).flat().join(', ')) }
      setShowModal(false)
      fetchData()
      return
    }
    const active = modalRows.filter(r => !r._remove && r.ingredient_id && r.quantity)
    if (active.length === 0) { alert('Add at least one ingredient.'); return }
    const existingIngs = recipes
      .filter(r => r.product_id == form.product_id && r.size_id == form.size_id)
      .map(r => r.ingredient_id)
    const dupes = active.filter(r => existingIngs.includes(Number(r.ingredient_id)))
    if (dupes.length > 0) {
      const names = dupes.map(r => ingredients.find(i => i.id == r.ingredient_id)?.name || r.ingredient_id).join(', ')
      alert(`Ingredient already in recipe: ${names}`)
      return
    }
    const sameRow = active.filter((r, i, a) => a.findIndex(x => x.ingredient_id == r.ingredient_id) !== i)
    if (sameRow.length > 0) {
      alert('Duplicate ingredient in rows.')
      return
    }
    try {
      for (const row of active) {
        const res = await fetch(`${API_URL}/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({
            product_id: form.product_id,
            size_id: form.size_id,
            ingredient_id: row.ingredient_id,
            quantity: row.quantity,
          }),
        })
        if (!res.ok) throw new Error('Failed to save')
      }
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

  const openBatchEdit = async (productId, sizeId) => {
    setBatchEdit({ productId, sizeId })
    try {
      const res = await fetch(`${API_URL}/recipes?product_id=${productId}&size_id=${sizeId}`, { headers })
      const json = await res.json()
      const data = json.data ?? json ?? []
      setBatchRows(data.length > 0
        ? data.map(r => ({ key: r.id, ingredient_id: r.ingredient_id, quantity: r.quantity, _remove: false }))
        : [{ key: Date.now(), ingredient_id: '', quantity: '', _remove: false }]
      )
    } catch { setBatchRows([{ key: Date.now(), ingredient_id: '', quantity: '', _remove: false }]) }
  }

  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    const active = batchRows.filter(r => !r._remove)
    if (active.length === 0) { alert('At least one ingredient is required.'); return }
    setBatchSaving(true)
    try {
      const res = await fetch(`${API_URL}/recipes/batch-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          product_id: batchEdit.productId,
          size_id: batchEdit.sizeId,
          recipes: active.map(r => ({ ingredient_id: r.ingredient_id, quantity: r.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setBatchEdit(null)
      fetchData()
    } catch (err) { alert(err.message) } finally { setBatchSaving(false) }
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
            <button onClick={() => openCreate(null, null)} className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">Add New Recipe</button>
          </div>

          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button onClick={() => setSelectedCategory('All')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
              {Object.values(categories).map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search recipes..." className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 w-48" />
              <button onClick={() => setSearchQuery(searchQuery)} className="bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">Search</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(grouped).length === 0 && (
              <div className="text-center text-gray-500 py-8 col-span-full">No recipes found.</div>
            )}
            {Object.entries(grouped).map(([catId, catGroup]) => (
              <React.Fragment key={catId}>
                <h2 className="col-span-full text-xl font-bold text-gray-700 mb-2 px-1 border-l-4 border-teal-700 pl-3">
                  {catGroup.category?.name ?? 'Uncategorized'}
                </h2>
                {Object.entries(catGroup.products).map(([pid, prod]) => {
                  const numSizes = Object.keys(prod.sizes).length
                  const minH = numSizes >= 4 ? '24rem' : numSizes >= 3 ? '18rem' : numSizes >= 2 ? '12rem' : '8rem'
                  return (
                  <div key={pid} className="bg-white rounded-xl shadow-sm overflow-hidden border border-teal-300 flex flex-col"
                    style={{ minHeight: minH }}>
                    <div className="px-6 py-4 bg-teal-100 border-b border-teal-200 flex items-center gap-3 shrink-0">
                      {prod.product?.image && (
                        <img src={prod.product.image} alt={prod.product.name} className="w-16 h-16 rounded-lg object-cover border border-teal-200" />
                      )}
                      <h3 className="font-semibold text-teal-800 bg-white rounded-lg px-3 py-1.5 border border-teal-200 shadow-sm flex-1">{prod.product?.name ?? `Product #${pid}`}</h3>
                      <button onClick={() => openCreate(pid, null)} className="text-teal-700 hover:underline text-xs font-medium">+ Add Ingredient</button>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                      {Object.entries(prod.sizes).map(([sid, sz]) => (
                        <div key={sid} className="border border-teal-300 rounded-lg shadow-sm overflow-hidden">
                          <div className="px-6 py-3 bg-teal-100 border-b border-teal-200 flex justify-between items-center text-sm font-medium text-teal-800">
                            <span className="bg-white rounded-md px-3 py-1 border border-teal-200 shadow-sm">{sz.size?.name ?? `Size #${sid}`}</span>
                            <div className="flex gap-3">
                              <button onClick={() => openBatchEdit(pid, sid)} className="text-amber-600 hover:underline text-xs">Edit All</button>
                              <button onClick={() => openCreate(pid, sid)} className="text-teal-700 hover:underline text-xs">+ Add Ingredient</button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                                  <th className="px-6 py-3">Ingredient</th>
                                  <th className="px-6 py-3">Quantity</th>
                                  <th className="px-6 py-3 text-right">$/Unit</th>
                                  <th className="px-6 py-3 text-right">Line Cost</th>
                                  <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sz.ingredients.map((r) => {
                                  const unitCost = Number(r.ingredient?.cost_per_unit || 0)
                                  const lineCost = unitCost * Number(r.quantity)
                                  return (
                                  <tr key={r.id} className="border-t border-gray-100 hover:bg-teal-50/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-800">{r.ingredient?.name}</td>
                                    <td className="px-6 py-4 text-gray-800">{Number(r.quantity).toFixed(2)} {r.ingredient?.unit}</td>
                                    <td className="px-6 py-4 text-gray-800 text-right">{unitCost > 0 ? '$' + unitCost.toFixed(2) : '—'}</td>
                                    <td className="px-6 py-4 text-gray-800 text-right font-medium">{lineCost > 0 ? '$' + lineCost.toFixed(2) : '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-md transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(r.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Remove</button>
                                      </div>
                                    </td>
                                  </tr>
                                )})}
                              </tbody>
                              <tfoot>
                                <tr className="border-t border-gray-200 bg-gray-50">
                                  <td className="px-6 py-3 font-semibold text-gray-800" colSpan={3}>Total Cost</td>
                                  <td className="px-6 py-3 text-right font-bold text-teal-700">
                                    ${sz.ingredients.reduce((sum, r) => sum + (Number(r.ingredient?.cost_per_unit || 0) * Number(r.quantity)), 0).toFixed(2)}
                                   </td>
                                  <td></td>
                                 </tr>
                              </tfoot>
                             </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )})}
              </React.Fragment>
            ))}
          </div>
        </main>
      </div>

      {batchEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full mx-4 p-6" style={{ maxWidth: '40rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Batch Edit Recipe</h2>
              <button onClick={() => setBatchEdit(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleBatchSubmit}>
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="px-2 py-2">Ingredient</th>
                    <th className="px-2 py-2">Quantity</th>
                    <th className="px-2 py-2 w-16">Remove</th>
                   </tr>
                </thead>
                <tbody>
                  {batchRows.map((row) => (
                    <tr key={row.key} className={`border-b ${row._remove ? 'opacity-50 bg-gray-50' : ''}`}>
                      <td className="px-2 py-2">
                        <select value={row.ingredient_id} onChange={e => {
                          const val = e.target.value
                          setBatchRows(prev => prev.map(r => r.key === row.key ? { ...r, ingredient_id: val } : r))
                        }} disabled={row._remove} required className="w-full border rounded px-2 py-1 text-sm">
                          <option value="">Select ingredient</option>
                          {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                        </select>
                       </td>
                      <td className="px-2 py-2">
                        <input type="number" value={row.quantity} onChange={e => {
                          const val = e.target.value
                          setBatchRows(prev => prev.map(r => r.key === row.key ? { ...r, quantity: val } : r))
                        }} step="0.01" min="0.01" disabled={row._remove} required className="w-full border rounded px-2 py-1 text-sm" />
                       </td>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" checked={row._remove} onChange={() =>
                          setBatchRows(prev => prev.map(r => r.key === row.key ? { ...r, _remove: !r._remove } : r))
                        } />
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={() => setBatchRows([...batchRows, { key: Date.now(), ingredient_id: '', quantity: '', _remove: false }])}
                className="text-teal-700 hover:underline text-sm mb-4">+ Add Ingredient</button>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setBatchEdit(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={batchSaving} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {batchSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full mx-4 p-6" style={{ maxWidth: editing ? '24rem' : '40rem' }}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Ingredient' : 'Add Ingredients'}</h2>
            <form onSubmit={handleSubmit}>
              {!editing && (
                <>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select value={form.size_id} onChange={e => setForm({ ...form, size_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                        <option value="">Select size</option>
                        {Object.values(sizes).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <table className="w-full mb-3">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="px-2 py-2">Ingredient</th>
                        <th className="px-2 py-2 w-32">Quantity</th>
                        <th className="px-2 py-2 w-12">Remove</th>
                       </tr>
                    </thead>
                    <tbody>
                      {modalRows.map((row) => (
                        <tr key={row.key} className={`border-b ${row._remove ? 'opacity-50 bg-gray-50' : ''}`}>
                          <td className="px-2 py-2">
                            <select value={row.ingredient_id} onChange={e => updateModalRow(row.key, 'ingredient_id', e.target.value)} disabled={row._remove} required className="w-full border rounded px-2 py-1 text-sm">
                              <option value="">Select ingredient</option>
                              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                            </select>
                           </td>
                          <td className="px-2 py-2">
                            <input type="number" value={row.quantity} onChange={e => updateModalRow(row.key, 'quantity', e.target.value)} step="0.01" min="0.01" disabled={row._remove} required className="w-full border rounded px-2 py-1 text-sm" />
                           </td>
                          <td className="px-2 py-2 text-center">
                            <input type="checkbox" checked={row._remove} onChange={() => toggleModalRowRemove(row.key)} />
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" onClick={addModalRow} className="text-teal-700 hover:underline text-sm mb-4">+ Add Row</button>
                </>
              )}

              {editing && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                    <select value={form.ingredient_id} onChange={e => setForm({ ...form, ingredient_id: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                      <option value="">Select ingredient</option>
                      {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} step="0.01" min="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}