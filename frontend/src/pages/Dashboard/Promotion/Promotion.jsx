import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Calendar, Tag, Package, Clock, Zap, Gift, Coffee, Percent, DollarSign } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/promotions'
const PRODUCTS_URL = import.meta.env.VITE_API_URL + '/products'
const CATEGORIES_URL = import.meta.env.VITE_API_URL + '/categories'

const types = [
  { value: 'percentage', label: 'Percentage', icon: Percent, color: 'purple' },
  { value: 'fixed_amount', label: 'Fixed Amount', icon: DollarSign, color: 'green' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y', icon: Gift, color: 'orange' },
  { value: 'combo', label: 'Combo', icon: Coffee, color: 'amber' },
  { value: 'combo_discount', label: 'Combo Discount', icon: Zap, color: 'indigo' },
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
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
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
    setForm({ name: '', description: '', type: 'percentage', value: '', buy_qty: '', free_qty: '', start_date: '', end_date: '', active: true, product_ids: [], combo_discount_type: 'percentage', combo_apply_to: 'each', combo_groups: [] })
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
      description: item.description ?? '',
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
    if (submitting) return
    setSubmitting(true)
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'
    const isCombo = form.type === 'combo' || form.type === 'combo_discount'
    const body = {
      name: form.name,
      description: form.description || null,
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
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const msg = data?.errors
          ? Object.values(data.errors).flat().join('\n')
          : data?.message || 'Failed to save'
        throw new Error(msg)
      }
      setShowModal(false)
      fetchItems()
    } catch (err) { alert(err.message) } finally { setSubmitting(false) }
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
  const isCombo = form.type === 'combo' || form.type === 'combo_discount'

  const getStatusBadge = (item) => {
    const now = new Date()
    const start = new Date(item.start_date)
    const end = new Date(item.end_date)
    const isExpired = end < now
    const isUpcoming = start > now
    const isActive = item.active && !isExpired && !isUpcoming

    if (isActive) return { text: 'Active', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700' }
    if (isExpired) return { text: 'Expired', color: 'red', bg: 'bg-red-50', border: 'border-red-200', textColor: 'text-red-700' }
    if (isUpcoming) return { text: 'Upcoming', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700' }
    return { text: 'Inactive', color: 'gray', bg: 'bg-orange-50', border: 'border-gray-200', textColor: 'text-gray-500' }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header with Title and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-amber-800 bg-clip-text text-transparent">
                Promotions
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage discounts, combos, and special offers</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-900 to-amber-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-amber-950 hover:to-amber-900 transition-all duration-200 shadow-lg shadow-amber-200 hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Promotion
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 overflow-hidden">
            {loading ? <Loader page={false} text="Loading promotions..." /> : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 mb-2">⚠️ {error}</div>
                <button onClick={fetchItems} className="text-amber-600 hover:underline text-sm">Try again</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-50 to-amber-100 border-b-2 border-amber-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-amber-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const status = getStatusBadge(item)
                      const typeIcon = types.find(t => t.value === item.type)?.icon || Tag
                      const TypeIcon = typeIcon
                      
                      return (
                        <tr key={item.id} className="border-b border-amber-100 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-800">{item.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <TypeIcon className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-xs font-medium text-gray-700">{typeLabel(item.type)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-800">
                              {item.type === 'percentage' && `${item.value}%`}
                              {item.type === 'fixed_amount' && `$${parseFloat(item.value).toFixed(2)}`}
                              {item.type === 'buy_x_get_y' && `Buy ${item.buy_qty} Get ${item.free_qty}`}
                              {item.type === 'combo' && item.value && `$${parseFloat(item.value).toFixed(2)}`}
                              {item.type === 'combo_discount' && `${item.value}% off`}
                            </span>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-sm text-gray-700">{item.products_count ?? 0}</span>
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span>{formatDate(item.start_date).split(',')[0]}</span>
                              <Clock className="w-3 h-3 text-amber-400 ml-1" />
                              <span>{formatDate(item.end_date).split(',')[0]}</span>
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(item)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${status.bg} ${status.border} ${status.textColor} hover:shadow-sm`}
                            >
                              {status.text}
                            </button>
                           </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">{item.created_by_user?.name ?? item.created_by?.name ?? '—'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-2 text-amber-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                           </td>
                         </tr>
                      )
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center">
                          <div className="text-gray-400">
                            <div className="text-5xl mb-3">🎉</div>
                            <p className="text-sm">No promotions found</p>
                            <button
                              onClick={openCreate}
                              className="mt-3 text-amber-600 hover:text-amber-700 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Create your first promotion
                            </button>
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border-2 border-amber-200"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-6 py-4 flex justify-between items-center sticky top-0">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {editing ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Summer Sale, Happy Hour, Weekend Special"
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g., Buy 3 drinks and get 1 free every weekend"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    >
                      {types.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {needsValue && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {form.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount ($)'}
                      </label>
                      <div className="relative">
                        {form.type === 'percentage' ? (
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        ) : (
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.value}
                          onChange={e => setForm({ ...form, value: e.target.value })}
                          required
                          className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {isBuyXGetY && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Buy Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={form.buy_qty}
                          onChange={e => setForm({ ...form, buy_qty: e.target.value })}
                          required
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Free Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={form.free_qty}
                          onChange={e => setForm({ ...form, free_qty: e.target.value })}
                          required
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.start_date}
                      onChange={e => setForm({ ...form, start_date: e.target.value })}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.end_date}
                      onChange={e => setForm({ ...form, end_date: e.target.value })}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                {isCombo && (
                  <div className="border-t-2 border-amber-200 pt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Combo Groups</label>
                    {form.combo_groups.map((group, gi) => (
                      <div key={gi} className="border-2 border-amber-200 bg-amber-50/30 rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            placeholder="Group label (e.g., Coffee, Pastry, Sandwich)"
                            value={group.label}
                            onChange={e => updateGroup(gi, 'label', e.target.value)}
                            className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeGroup(gi)}
                            className="ml-3 text-red-500 text-sm hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Categories</span>
                            <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 mt-1 space-y-1 bg-white">
                              {allCategories.map((cat) => (
                                <label key={cat.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-teal-50 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={group.categories.includes(cat.id)}
                                    onChange={() => toggleGroupCategory(gi, cat.id)}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span>{cat.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Products</span>
                            <div className="max-h-32 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 mt-1 space-y-1 bg-white">
                              {allProducts.map((p) => (
                                <label key={p.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-teal-50 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={group.products.includes(p.id)}
                                    onChange={() => toggleGroupProduct(gi, p.id)}
                                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span>{p.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addGroup}
                      className="text-sm text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Group
                    </button>
                  </div>
                )}

                <div className="border-t-2 border-amber-200 pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apply to Products</label>
                  <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 space-y-1 bg-orange-50">
                    {allProducts.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={form.product_ids.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{p.name}</span>
                      </label>
                    ))}
                    {form.product_ids.length > 0 && (
                      <div className="text-xs text-amber-600 font-medium mt-2 pt-2 border-t border-gray-200">
                        {form.product_ids.length} product(s) selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border-2 border-amber-200">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Active (immediately available for use)
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t-2 border-amber-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-xl text-sm font-medium hover:from-amber-950 hover:to-amber-900 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving…' : editing ? 'Update Promotion' : 'Create Promotion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}