import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API = 'https://pos-year4.onrender.com/api'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [addons, setAddons] = useState([])
  const [sugarLevels, setSugarLevels] = useState([])
  const [iceLevels, setIceLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    status: true,
    image: null,
    imagePreview: '',
    sizes: [],
    prices: {},
    addons: [],
    sugar_levels: [],
    ice_levels: [],
  })

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products/${id}`).then((r) => r.json()),
      fetch(`${API}/categories`).then((r) => r.json()),
      fetch(`${API}/sizes`).then((r) => r.json()),
      fetch(`${API}/addons`).then((r) => r.json()),
      fetch(`${API}/sugar-levels`).then((r) => r.json()),
      fetch(`${API}/ice-levels`).then((r) => r.json()),
    ])
      .then(([product, cats, szs, ads, sugars, ices]) => {
        setForm({
          name: product.name,
          category_id: product.category_id,
          description: product.description ?? '',
          status: product.status,
          image: null,
          imagePreview: product.image ? `https://pos-year4.onrender.com/storage/${product.image}` : '',
          sizes: product.sizes?.map((s) => s.id) ?? [],
          prices: Object.fromEntries((product.sizes ?? []).map((s) => [s.id, s.pivot?.price ?? 0])),
          addons: product.addons?.map((a) => a.id) ?? [],
          sugar_levels: product.sugar_levels?.map((s) => s.id) ?? [],
          ice_levels: product.ice_levels?.map((s) => s.id) ?? [],
        })
        setCategories(cats.data ?? cats)
        setSizes(szs.data ?? szs)
        setAddons(ads.data ?? ads)
        setSugarLevels(sugars.data ?? sugars)
        setIceLevels(ices.data ?? ices)
        setLoading(false)
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to load product data')
        setLoading(false)
      })
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSizeToggle = (sizeId) => {
    setForm((prev) => {
      const exists = prev.sizes.includes(sizeId)
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== sizeId) : [...prev.sizes, sizeId],
      }
    })
  }

  const handlePriceChange = (sizeId, value) => {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [sizeId]: value } }))
  }

  const handleArrayToggle = (field, valueId) => {
    setForm((prev) => {
      const exists = prev[field].includes(valueId)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((v) => v !== valueId) : [...prev[field], valueId],
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('category_id', form.category_id)
    fd.append('description', form.description || '')
    fd.append('status', form.status ? '1' : '0')
    if (form.image) fd.append('image', form.image)
    form.sizes.forEach((sizeId, i) => {
      fd.append(`sizes[${i}][id]`, sizeId)
      fd.append(`sizes[${i}][price]`, form.prices[sizeId] ?? 0)
    })
    form.addons.forEach((aid) => fd.append('addons[]', aid))
    form.sugar_levels.forEach((sid) => fd.append('sugar_levels[]', sid))
    form.ice_levels.forEach((iid) => fd.append('ice_levels[]', iid))

    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || JSON.stringify(errData.errors ?? errData) || 'Failed to update product')
      }
      navigate('/staff/products?updated=' + id)
    } catch (err) {
      alert(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col"><Topbar /><main className="flex-1 p-6 flex items-center justify-center text-gray-500">Loading...</main></div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col"><Topbar /><main className="flex-1 p-6 flex items-center justify-center text-red-500">{fetchError}</main></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <a href="/staff/products" className="text-blue-600 hover:underline text-sm">&larr; Back to Products</a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
            <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {form.imagePreview && (
                  <div className="mb-2">
                    <img src={form.imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0]
                  setForm((prev) => ({
                    ...prev,
                    image: file,
                    imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview,
                  }))
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes &amp; Prices</label>
                <div className="space-y-2">
                  {sizes.map((size) => (
                    <div key={size.id} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer w-32">
                        <input type="checkbox" checked={form.sizes.includes(size.id)} onChange={() => handleSizeToggle(size.id)} className="rounded" />
                        <span className="text-sm">{size.name}</span>
                      </label>
                      <input type="number" placeholder="Price" step="0.01" min="0" value={form.prices[size.id] ?? ''} onChange={(e) => handlePriceChange(size.id, e.target.value)} className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Addons</label>
                <div className="grid grid-cols-2 gap-2">
                  {addons.map((addon) => (
                    <label key={addon.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.addons.includes(addon.id)} onChange={() => handleArrayToggle('addons', addon.id)} className="rounded" />
                      <span className="text-sm">{addon.name} (${Number(addon.price).toFixed(2)})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sugar Levels</label>
                <div className="grid grid-cols-2 gap-2">
                  {sugarLevels.map((level) => (
                    <label key={level.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.sugar_levels.includes(level.id)} onChange={() => handleArrayToggle('sugar_levels', level.id)} className="rounded" />
                      <span className="text-sm">{level.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ice Levels</label>
                <div className="grid grid-cols-2 gap-2">
                  {iceLevels.map((level) => (
                    <label key={level.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.ice_levels.includes(level.id)} onChange={() => handleArrayToggle('ice_levels', level.id)} className="rounded" />
                      <span className="text-sm">{level.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Update Product'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
