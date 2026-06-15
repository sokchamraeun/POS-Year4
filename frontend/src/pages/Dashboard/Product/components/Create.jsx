import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../../../components/staff/Sidebar.jsx'
import Topbar from '../../../../components/staff/Topbar.jsx'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../../../utils/cropImage.js'
import Loader from '../../../../components/shared/Loader.jsx'

const API = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

export default function CreateProduct() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [sizes, setSizes] = useState([])
  const [addons, setAddons] = useState([])
  const [sugarLevels, setSugarLevels] = useState([])
  const [iceLevels, setIceLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [outputWidth, setOutputWidth] = useState('')
  const [outputHeight, setOutputHeight] = useState('')

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    status: true,
    image: null,
    sizes: [],
    prices: {},
    addons: [],
    sugar_levels: [],
    ice_levels: [],
  })

  useEffect(() => {
    Promise.all([
      fetch(`${API}/categories`, { headers: authHeaders }).then((r) => r.json()),
      fetch(`${API}/sizes`, { headers: authHeaders }).then((r) => r.json()),
      fetch(`${API}/addons`, { headers: authHeaders }).then((r) => r.json()),
      fetch(`${API}/sugar-levels`, { headers: authHeaders }).then((r) => r.json()),
      fetch(`${API}/ice-levels`, { headers: authHeaders }).then((r) => r.json()),
    ])
      .then(([cats, szs, ads, sugars, ices]) => {
        setCategories(cats.data ?? cats)
        setSizes(szs.data ?? szs)
        setAddons(ads.data ?? ads)
        setSugarLevels(sugars.data ?? sugars)
        setIceLevels(ices.data ?? ices)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox' && name === 'status') {
      setForm((prev) => ({ ...prev, status: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSizeToggle = (id) => {
    setForm((prev) => {
      const exists = prev.sizes.includes(id)
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== id) : [...prev.sizes, id],
      }
    })
  }

  const handlePriceChange = (id, value) => {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [id]: value } }))
  }

  const handleArrayToggle = (field, id) => {
    setForm((prev) => {
      const exists = prev[field].includes(id)
      return {
        ...prev,
        [field]: exists ? prev[field].filter((v) => v !== id) : [...prev[field], id],
      }
    })
  }

  function onCropComplete(croppedArea, croppedAreaPixels) {
    setCroppedAreaPixels(croppedAreaPixels)
    if (!outputWidth && !outputHeight) {
      setOutputWidth(String(Math.round(croppedAreaPixels.width)))
      setOutputHeight(String(Math.round(croppedAreaPixels.height)))
    }
  }

  async function handleCropSave() {
    if (croppedAreaPixels) {
      try {
        const w = parseInt(outputWidth) || croppedAreaPixels.width
        const h = parseInt(outputHeight) || croppedAreaPixels.height
        const blob = await getCroppedImg(cropImage, croppedAreaPixels, { zoom, outputWidth: w, outputHeight: h })
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
        setForm(prev => ({ ...prev, image: file }))
      } catch (error) {
        console.error('Error creating cropped image:', error)
      }
      setCropOpen(false)
      setCropImage(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setOutputWidth('')
      setOutputHeight('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleCropCancel() {
    setCropOpen(false)
    setCropImage(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setOutputWidth('')
    setOutputHeight('')
    if (fileInputRef.current) fileInputRef.current.value = ''
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
    form.sizes.forEach((id, i) => {
      fd.append(`sizes[${i}][id]`, id)
      fd.append(`sizes[${i}][price]`, form.prices[id] ?? 0)
    })
    form.addons.forEach((id) => fd.append('addons[]', id))
    form.sugar_levels.forEach((id) => fd.append('sugar_levels[]', id))
    form.ice_levels.forEach((id) => fd.append('ice_levels[]', id))

    try {
      const res = await fetch(`${API}/products`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || JSON.stringify(errData.errors ?? errData) || 'Failed to create product')
      }
      navigate('/staff/products?created=' + Date.now())
    } catch (err) {
      alert(err.message)
      setSaving(false)
    }
  }

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <a href="/staff/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">&larr; Back to Products</a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
            <h1 className="text-xl font-bold text-gray-800 mb-6">Add New Product</h1>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {form.image && (
                  <div className="mb-2"><img src={URL.createObjectURL(form.image)} alt="Preview" className="w-20 h-20 rounded-lg object-cover" /></div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.readAsDataURL(file)
                    reader.onload = () => { setCropImage(reader.result); setCropOpen(true) }
                  }
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
                      <input type="number" placeholder="Price" step="0.01" min="0" value={form.prices[size.id] ?? ''} onChange={(e) => handlePriceChange(size.id, e.target.value)} className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Product'}
              </button>

              {cropOpen && cropImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
                  <div className="bg-white rounded-lg w-full max-w-2xl m-4">
                    <div className="p-4 border-b"><h3 className="text-lg font-semibold">Crop Image</h3></div>
                    <div className="relative h-96">
                      <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                    </div>
                    <div className="p-4 border-t">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Output Size</label>
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} value={outputWidth} onChange={(e) => setOutputWidth(e.target.value)} placeholder="Width" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          <span className="text-gray-500">×</span>
                          <input type="number" min={1} value={outputHeight} onChange={(e) => setOutputHeight(e.target.value)} placeholder="Height" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          <span className="text-xs text-gray-400">px</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handleCropCancel} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-orange-50">Cancel</button>
                        <button onClick={handleCropSave} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Apply</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
