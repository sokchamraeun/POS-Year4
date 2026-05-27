import { useState, useEffect, useRef } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../../utils/cropImage.js'

const API_URL = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

export default function EditModalProduct({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', category_id: '', description: '', status: true,
    image: null, imagePreview: '',
    sizes: [], prices: {}, addons: [], sugar_levels: [], ice_levels: [],
  })
  const [categories, setCategories] = useState([])
  const [allSizes, setAllSizes] = useState([])
  const [allAddons, setAllAddons] = useState([])
  const [allSugarLevels, setAllSugarLevels] = useState([])
  const [allIceLevels, setAllIceLevels] = useState([])
  const [saving, setSaving] = useState(false)

  const [cropOpen, setCropOpen] = useState(false)
  const [cropImage, setCropImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [outputWidth, setOutputWidth] = useState('')
  const [outputHeight, setOutputHeight] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!product) return
    Promise.all([
      fetch(`${API_URL}/products/${product.id}`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/categories`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/sizes`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/addons`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/sugar-levels`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ice-levels`, { headers }).then(r => r.json()),
    ]).then(([p, cats, szs, ads, sugars, ices]) => {
      setForm({
        name: p.name,
        category_id: p.category_id,
        description: p.description ?? '',
        status: p.status,
        image: null,
        imagePreview: p.image
          ? `${p.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${p.image}`
          : '',
        sizes: p.sizes?.map(s => s.id) ?? [],
        prices: Object.fromEntries((p.sizes ?? []).map(s => [s.id, s.pivot?.price ?? 0])),
        addons: p.addons?.map(a => a.id) ?? [],
        sugar_levels: p.sugar_levels?.map(s => s.id) ?? [],
        ice_levels: p.ice_levels?.map(s => s.id) ?? [],
      })
      setCategories(cats.data ?? cats)
      setAllSizes(szs.data ?? szs)
      setAllAddons(ads.data ?? ads)
      setAllSugarLevels(sugars.data ?? sugars)
      setAllIceLevels(ices.data ?? ices)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setOutputWidth('')
      setOutputHeight('')
      setCropImage(null)
      setCropOpen(false)
    })
  }, [product])

  if (!product) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSizeToggle(sizeId) {
    setForm(prev => {
      const exists = prev.sizes.includes(sizeId)
      return { ...prev, sizes: exists ? prev.sizes.filter(s => s !== sizeId) : [...prev.sizes, sizeId] }
    })
  }

  function handlePriceChange(sizeId, value) {
    setForm(prev => ({ ...prev, prices: { ...prev.prices, [sizeId]: value } }))
  }

  function handleArrayToggle(field, valueId) {
    setForm(prev => {
      const exists = prev[field].includes(valueId)
      return { ...prev, [field]: exists ? prev[field].filter(v => v !== valueId) : [...prev[field], valueId] }
    })
  }

  function onFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => { setCropImage(reader.result); setCropOpen(true) }
    }
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
        const previewUrl = URL.createObjectURL(file)
        setForm(prev => ({ ...prev, image: file, imagePreview: previewUrl }))
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

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
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
    form.addons.forEach(aid => fd.append('addons[]', aid))
    form.sugar_levels.forEach(sid => fd.append('sugar_levels[]', sid))
    form.ice_levels.forEach(iid => fd.append('ice_levels[]', iid))
    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || JSON.stringify(errData.errors ?? errData) || 'Failed to update product')
      }
      onSaved?.()
      onClose?.()
    } catch (err) {
      alert(err.message)
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {form.imagePreview && (
                  <div className="mb-2"><img src={form.imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" /></div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.status} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes &amp; Prices</label>
                <div className="space-y-2">
                  {allSizes.map(size => (
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
                  {allAddons.map(addon => (
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
                  {allSugarLevels.map(level => (
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
                  {allIceLevels.map(level => (
                    <label key={level.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.ice_levels.includes(level.id)} onChange={() => handleArrayToggle('ice_levels', level.id)} className="rounded" />
                      <span className="text-sm">{level.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Update Product'}
                </button>
                <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
                  <input type="number" min={1} value={outputWidth} onChange={(e) => setOutputWidth(e.target.value)} placeholder="Width" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-gray-500">×</span>
                  <input type="number" min={1} value={outputHeight} onChange={(e) => setOutputHeight(e.target.value)} placeholder="Height" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-400">px</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCropCancel} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleCropSave} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
