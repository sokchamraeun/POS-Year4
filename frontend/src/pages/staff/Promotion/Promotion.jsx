import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/promotions'
const PRODUCTS_URL = import.meta.env.VITE_API_URL + '/products'

const CATEGORIES_URL = import.meta.env.VITE_API_URL + '/categories'

const types = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
  { value: 'combo', label: 'Combo' },
  { value: 'combo_discount', label: 'Combo Discount' },
]

function toLocalDatetime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Promotions() {
  const [items, setItems] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'percentage',
    value: '',
    buy_qty: '',
    free_qty: '',
    start_date: '',
    end_date: '',
    active: true,
    product_ids: [],
    combo_discount_type: 'percentage',
    combo_apply_to: 'each',
    combo_groups: [],
  })

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_URL, { headers: authHeaders() })
      if (!res.ok) return
      const json = await res.json()
      const list = json.data ?? json
      setAllProducts(Array.isArray(list) ? list : [])
    } catch {}
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_URL, { headers: authHeaders() })
      if (!res.ok) return
      const json = await res.json()
      const list = json.data ?? json
      setAllCategories(Array.isArray(list) ? list : [])
    } catch {}
  }

  const fetchItems = () => {
    setLoading(true)
    fetch(API_URL, { headers: authHeaders() })
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json() })
      .then(json => { setItems(json.data ?? json); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { fetchItems(); fetchProducts(); fetchCategories() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', type: 'percentage', value: '', buy_qty: '', free_qty: '', start_date: '', end_date: '', active: true, product_ids: [], combo_discount_type: 'percentage', combo_apply_to: 'each', combo_groups: [] })
    setShowModal(true)
  }

  const openEdit = async (item) => {
    setEditing(item)
    let productIds = item.products?.map((p) => p.id) ?? []
    if (!item.products) {
      try {
        const res = await fetch(`${API_URL}/${item.id}`, { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          productIds = data.products?.map((p) => p.id) ?? []
        }
      } catch {}
    }
    setForm({
      name: item.name,
      type: item.type,
      value: item.value ?? '',
      buy_qty: item.buy_qty ?? '',
      free_qty: item.free_qty ?? '',
      start_date: toLocalDatetime(item.start_date),
      end_date: toLocalDatetime(item.end_date),
      active: item.active,
      product_ids: productIds,
      combo_discount_type: item.combo_discount_type ?? 'percentage',
      combo_apply_to: item.combo_apply_to ?? 'each',
      combo_groups: item.combo_groups ?? [],
    })
    setShowModal(true)
  }

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(id)
        ? prev.product_ids.filter((pid) => pid !== id)
        : [...prev.product_ids, id],
    }))
  }

  const addGroup = () => {
    setForm((prev) => ({
      ...prev,
      combo_groups: [...prev.combo_groups, { label: '', categories: [], products: [] }],
    }))
  }

  const removeGroup = (index) => {
    setForm((prev) => ({
      ...prev,
      combo_groups: prev.combo_groups.filter((_, i) => i !== index),
    }))
  }

  const updateGroup = (index, field, value) => {
    setForm((prev) => {
      const groups = [...prev.combo_groups]
      groups[index] = { ...groups[index], [field]: value }
      return { ...prev, combo_groups: groups }
    })
  }

  const toggleGroupCategory = (groupIndex, categoryId) => {
    setForm((prev) => {
      const groups = [...prev.combo_groups]
      const catIds = groups[groupIndex].categories
      groups[groupIndex] = {
        ...groups[groupIndex],
        categories: catIds.includes(categoryId)
          ? catIds.filter((id) => id !== categoryId)
          : [...catIds, categoryId],
      }
      return { ...prev, combo_groups: groups }
    })
  }

  const toggleGroupProduct = (groupIndex, productId) => {
    setForm((prev) => {
      const groups = [...prev.combo_groups]
      const prodIds = groups[groupIndex].products
      groups[groupIndex] = {
        ...groups[groupIndex],
        products: prodIds.includes(productId)
          ? prodIds.filter((id) => id !== productId)
          : [...prodIds, productId],
      }
      return { ...prev, combo_groups: groups }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'
    const isCombo = form.type === 'combo' || form.type === 'combo_discount'
    const body = {
      name: form.name,
      type: form.type,
      value: isCombo ? form.value : (form.type === 'percentage' || form.type === 'fixed_amount' ? form.value : null),
      buy_qty: form.type === 'buy_x_get_y' ? form.buy_qty : null,
      free_qty: form.type === 'buy_x_get_y' ? form.free_qty : null,
      start_date: form.start_date,
      end_date: form.end_date,
      active: form.active,
      product_ids: form.product_ids,
      combo_discount_type: form.type === 'combo_discount' ? form.combo_discount_type : null,
      combo_apply_to: form.type === 'combo_discount' ? form.combo_apply_to : null,
      combo_groups: isCombo ? form.combo_groups : null,
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchItems()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      fetchItems()
    } catch {}
  }

  const handleToggleActive = async (item) => {
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !item.active }),
      })
      fetchItems()
    } catch {}
  }

  const formatDate = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleString()
  }

  const typeLabel = (val) => types.find((t) => t.value === val)?.label ?? val
  const isBuyXGetY = form.type === 'buy_x_get_y'
  const needsValue = form.type === 'percentage' || form.type === 'fixed_amount'
  const isComboDiscount = form.type === 'combo_discount'
  const isCombo = form.type === 'combo' || form.type === 'combo_discount'

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Promotions</h1>
            <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Add Promotion</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading promotions...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Value</th>
                    <th className="px-6 py-3">Products</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const now = new Date()
                    const start = new Date(item.start_date)
                    const end = new Date(item.end_date)
                    const isExpired = end < now
                    const isUpcoming = start > now
                    const isActive = item.active && !isExpired && !isUpcoming

                    return (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{item.id}</td>
                        <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{typeLabel(item.type)}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {item.type === 'percentage' && `${item.value}%`}
                          {item.type === 'fixed_amount' && `$${parseFloat(item.value).toFixed(2)}`}
                          {item.type === 'buy_x_get_y' && `Buy ${item.buy_qty} Get ${item.free_qty}`}
                          {item.type === 'combo' && item.value ? `Combo $${parseFloat(item.value).toFixed(2)}` : '-'}
                          {item.type === 'combo_discount' && (
                            <>
                              {item.combo_discount_type === 'percentage' ? `${item.value}%` : item.combo_discount_type === 'fixed_price' ? `Combo $${parseFloat(item.value).toFixed(2)}` : `$${parseFloat(item.value).toFixed(2)}`}
                              {item.combo_discount_type !== 'fixed_price' && ` — ${item.combo_apply_to === 'cheapest' ? 'Cheapest' : item.combo_apply_to === 'each' ? 'Each' : 'Total'}`}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-800 font-medium">{item.products_count ?? 0}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          <div>{formatDate(item.start_date)}</div>
                          <div className="text-gray-400">to {formatDate(item.end_date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${
                              isActive
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : isExpired
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : isUpcoming
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {isActive ? 'Active' : isExpired ? 'Expired' : isUpcoming ? 'Upcoming' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(item)} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {items.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No promotions found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Promotion' : 'Add Promotion'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {needsValue && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {form.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                    </label>
                    <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}

                {isBuyXGetY && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buy Quantity</label>
                      <input type="number" min="1" value={form.buy_qty} onChange={e => setForm({ ...form, buy_qty: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Quantity</label>
                      <input type="number" min="1" value={form.free_qty} onChange={e => setForm({ ...form, free_qty: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}

                {isCombo && (
                  <>
                    {form.type === 'combo_discount' && (
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                          <select value={form.combo_discount_type} onChange={e => setForm({ ...form, combo_discount_type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="percentage">Percentage</option>
                            <option value="fixed_amount">Fixed Amount</option>
                            <option value="fixed_price">Fixed Combo Price</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {form.type === 'combo' ? 'Fixed Combo Price ($)' : form.combo_discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                          </label>
                          <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    )}
                    {form.type === 'combo' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Combo Price ($)</label>
                        <input type="number" step="0.01" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                    {form.type === 'combo_discount' && form.combo_discount_type !== 'fixed_price' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apply Discount To</label>
                        <select value={form.combo_apply_to} onChange={e => setForm({ ...form, combo_apply_to: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="cheapest">Cheapest Item</option>
                          <option value="each">Each Item</option>
                          <option value="total">Total of Items</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Combo Groups</label>
                      {form.combo_groups.map((group, gi) => (
                        <div key={gi} className="border border-gray-300 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              placeholder="Group label (e.g. Coffee)"
                              value={group.label}
                              onChange={e => updateGroup(gi, 'label', e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="button" onClick={() => removeGroup(gi)} className="ml-2 text-red-500 text-sm hover:text-red-700">Remove</button>
                          </div>
                          <div className="mb-1">
                            <span className="text-xs text-gray-500 font-medium">Categories</span>
                            <div className="max-h-24 overflow-y-auto border border-gray-200 rounded p-1 mt-1 space-y-0.5">
                              {allCategories.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-gray-50 cursor-pointer text-xs">
                                  <input
                                    type="checkbox"
                                    checked={group.categories.includes(cat.id)}
                                    onChange={() => toggleGroupCategory(gi, cat.id)}
                                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span>{cat.name}</span>
                                </label>
                              ))}
                              {allCategories.length === 0 && <p className="text-xs text-gray-400 p-1">No categories</p>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-medium">Products</span>
                            <div className="max-h-24 overflow-y-auto border border-gray-200 rounded p-1 mt-1 space-y-0.5">
                              {allProducts.map((p) => (
                                <label key={p.id} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-gray-50 cursor-pointer text-xs">
                                  <input
                                    type="checkbox"
                                    checked={group.products.includes(p.id)}
                                    onChange={() => toggleGroupProduct(gi, p.id)}
                                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span>{p.name}</span>
                                </label>
                              ))}
                              {allProducts.length === 0 && <p className="text-xs text-gray-400 p-1">No products</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={addGroup} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Group</button>
                      {form.combo_groups.length === 0 && <p className="text-xs text-gray-400 mt-1">Add at least 2 groups to define the combo</p>}
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Products</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                    {allProducts.length === 0 && (
                      <p className="text-sm text-gray-400 p-2">No products available</p>
                    )}
                    {allProducts.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.product_ids.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{p.name}</span>
                      </label>
                    ))}
                  </div>
                  {form.product_ids.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{form.product_ids.length} product(s) selected</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
