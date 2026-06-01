import { useState, useEffect, useRef } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../../utils/cropImage.js'

const API_URL = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

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
        headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : {},
        body: fd,
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || errData.error || 'Failed to update product')
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
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-200/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
                <p className="text-xs text-gray-400">Update details and options</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-73px)]">
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 space-y-6">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {form.imagePreview ? (
                      <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Image
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors placeholder:text-gray-300"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    name="category_id" value={form.category_id} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    name="description" value={form.description} onChange={handleChange} rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors resize-none placeholder:text-gray-300"
                    placeholder="Describe this product"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                  <p className="text-xs text-gray-400 mt-0.5">{form.status ? 'Visible to customers' : 'Hidden from customers'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, status: !prev.status }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${form.status ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.status ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Sizes & Prices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sizes &amp; Prices</label>
                <div className="space-y-2">
                  {allSizes.map(size => {
                    const isActive = form.sizes.includes(size.id)
                    return (
                      <div key={size.id} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${isActive ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100 bg-white'}`}>
                        <button
                          type="button"
                          onClick={() => handleSizeToggle(size.id)}
                          className={`w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}
                        >
                          {isActive && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm flex-1 ${isActive ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{size.name}</span>
                        <input
                          type="number" placeholder="0.00" step="0.01" min="0"
                          value={form.prices[size.id] ?? ''} onChange={(e) => handlePriceChange(size.id, e.target.value)}
                          className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Addons */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Add-ons</label>
                <div className="flex flex-wrap gap-2">
                  {allAddons.map(addon => {
                    const isActive = form.addons.includes(addon.id)
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleArrayToggle('addons', addon.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${isActive
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        {addon.name}
                        <span className={`text-xs ${isActive ? 'text-amber-100' : 'text-gray-400'}`}>${Number(addon.price).toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sugar & Ice Levels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sugar */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Sugar Levels</label>
                  <div className="flex flex-wrap gap-2">
                    {allSugarLevels.map(level => {
                      const isActive = form.sugar_levels.includes(level.id)
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleArrayToggle('sugar_levels', level.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${isActive
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                          {level.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Ice */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ice Levels</label>
                  <div className="flex flex-wrap gap-2">
                    {allIceLevels.map(level => {
                      const isActive = form.ice_levels.includes(level.id)
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleArrayToggle('ice_levels', level.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${isActive
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                          {level.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Saving...
                    </>
                  ) : 'Update Product'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {cropOpen && cropImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4 overflow-hidden border border-gray-200/60">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Crop Image</h3>
            </div>
            <div className="relative h-96 bg-gray-100">
              <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Zoom</label>
                  <span className="text-xs text-gray-400">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min={1} max={3} step={0.01} value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Size</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} value={outputWidth} onChange={(e) => setOutputWidth(e.target.value)} placeholder="Width" className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors" />
                  <span className="text-gray-400 text-sm">×</span>
                  <input type="number" min={1} value={outputHeight} onChange={(e) => setOutputHeight(e.target.value)} placeholder="Height" className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors" />
                  <span className="text-xs text-gray-400">px</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={handleCropCancel} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleCropSave} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors">Apply Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
