import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, X, Eye } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/categories'
const PRODUCTS_API = import.meta.env.VITE_API_URL + '/products'
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

function getImageUrl(image) {
  if (!image) return null
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function Category() {
  const [categories, setCategories] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', image: null })
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewCategory, setViewCategory] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)

  const fetchCategories = () => {
    setLoading(true)
    Promise.all([
      fetch(API_URL, { headers: authHeaders }).then(r => r.json()),
      fetch(API_URL, { headers: authHeaders }).then(r => r.json()),
    ])
      .then(([cats]) => {
        setCategories(cats.data ?? cats)
        setAllCategories(cats.data ?? cats)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', image: null })
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, image: null })
    setImagePreview(getImageUrl(c.image))
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editing ? `${API_URL}/${editing.id}` : API_URL
    const method = editing ? 'PUT' : 'POST'

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      if (form.image) {
        fd.append('image', form.image)
      }
      if (editing) {
        fd.append('_method', 'PUT')
      }

      const res = await fetch(url, {
        method: editing ? 'POST' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Failed to save')
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Category have product and cannot be deleted')
      }
      fetchCategories()
    } catch (err) {
      alert(err.message)
    }
  }

  const openView = (c) => {
    setViewCategory(null)
    setShowViewModal(true)
    setViewLoading(true)
    fetch(`${API_URL}/${c.id}`, { headers: authHeaders })
      .then(r => r.json())
      .then(cat => {
        setViewCategory(cat.data ?? cat)
        setViewLoading(false)
      })
      .catch(() => setViewLoading(false))
  }

  const handleChangeCategory = async (productId, categoryId) => {
    setSavingId(productId)
    try {
      const res = await fetch(`${PRODUCTS_API}/${productId}/category`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ category_id: categoryId || null }),
      })
      if (!res.ok) throw new Error('Failed to update')

      const cat = await fetch(`${API_URL}/${viewCategory.id}`, { headers: authHeaders }).then(r => r.json())
      setViewCategory(cat.data ?? cat)
      fetchCategories()
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const products = viewCategory?.products ?? []

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-900 to-teal-800 bg-clip-text text-transparent">
                Categories
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your product categories</p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-900 to-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-teal-950 hover:to-teal-900 transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            {loading ? <Loader page={false} text="Loading categories..." /> : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-teal-600 font-semibold bg-teal-50/50 border-b border-teal-100">
                      <th className="px-6 py-4">#ID</th>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Products</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c, index) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getImageUrl(c.image) ? (
                            <img
                              src={getImageUrl(c.image)}
                              alt={c.name}
                              className="h-10 w-10 rounded-lg border border-slate-200 bg-white object-contain"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[9px] font-bold text-slate-400">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {c.products_count ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openView(c)}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-105"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="text-slate-400">
                            <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium">No categories found</p>
                            <p className="text-sm mt-1">Click "Add Category" to create one</p>
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-teal-200"
            >
              <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  {editing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editing ? 'Edit Category' : 'Add New Category'}
                </h2>
                <p className="text-teal-100 text-xs mt-1">
                  {editing ? 'Update category details' : 'Create a new product category'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Coffee, Pastry, Smoothie"
                    required
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-1">Enter a unique category name</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category Image</label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 transition hover:border-teal-400 hover:bg-teal-50">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setForm({ ...form, image: file })
                            setImagePreview(URL.createObjectURL(file))
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, image: null })
                          setImagePreview(null)
                        }}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-xl border border-slate-200 bg-white object-contain"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Optional. Upload a category image (max 2MB)</p>
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-xl text-sm font-medium hover:from-teal-950 hover:to-teal-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-teal-200"
            >
              <div className="bg-gradient-to-r from-teal-900 to-teal-800 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {viewLoading ? '...' : viewCategory?.name}
                  </h2>
                  <p className="text-teal-100 text-xs mt-1">
                    {viewLoading ? '' : `${products.length} product(s) in this category`}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[65vh] overflow-y-auto">
                {viewLoading ? (
                  <Loader page={false} text="Loading products..." />
                ) : products.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="font-medium">No products in this category</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-teal-600 font-semibold bg-teal-50/50 border-b border-teal-100">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Current</th>
                          <th className="px-4 py-3">Change Category</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                                {product.category?.name ?? 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={product.category_id ?? ''}
                                onChange={e => handleChangeCategory(product.id, e.target.value)}
                                disabled={savingId === product.id}
                                className="border border-teal-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 w-full"
                              >
                                <option value="">Uncategorized</option>
                                {allCategories
                                  .filter(c => c.id !== viewCategory?.id)
                                  .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {product.category_id && (
                                  <button
                                    onClick={() => handleChangeCategory(product.id, '')}
                                    disabled={savingId === product.id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 bg-white rounded-lg hover:bg-teal-50 transition disabled:opacity-50"
                                  >
                                    <X className="w-3 h-3" />
                                    Unlink
                                  </button>
                                )}
                                {savingId === product.id && (
                                  <svg className="animate-spin h-4 w-4 text-teal-600" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
