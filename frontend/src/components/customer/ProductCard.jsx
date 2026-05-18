import { useState } from 'react'

export default function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.name || '')
  const [selectedSugar, setSelectedSugar] = useState(product.sugar_levels?.[0]?.name || '')
  const [selectedIce, setSelectedIce] = useState(product.ice_levels?.[0]?.name || '')
  const [selectedAddOn, setSelectedAddOn] = useState('')
  const [qty, setQty] = useState(1)

  function getBasePrice(sizeName) {
    const size = product.sizes?.find((s) => s.name === sizeName)
    return size ? Number(size.pivot?.price ?? 0) : 0
  }

  function getAddOnPrice(addOnName) {
    if (!addOnName) return 0
    const a = product.addons?.find((a) => a.name === addOnName)
    return a ? Number(a.price) : 0
  }

  const price = getBasePrice(selectedSize) + getAddOnPrice(selectedAddOn)

  const handleAddToCart = () => {
    const item = {
      ...product,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      addOn: selectedAddOn,
      unitPrice: getBasePrice(selectedSize) + getAddOnPrice(selectedAddOn),
      qty,
    }
    onAddToCart?.(item)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="p-3 pb-0">
        {product.image ? (
          <img
            src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        ) : (
          <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">{product.name}</h3>
          <span className="text-sm font-bold text-blue-600">${price.toFixed(2)}</span>
        </div>

        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {product.sizes?.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} (${Number(s.pivot?.price ?? 0).toFixed(2)})
            </option>
          ))}
        </select>

        <div className="flex gap-1.5 mb-1.5">
          <select
            value={selectedIce}
            onChange={(e) => setSelectedIce(e.target.value)}
            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {product.ice_levels?.map((l) => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
          <select
            value={selectedSugar}
            onChange={(e) => setSelectedSugar(e.target.value)}
            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {product.sugar_levels?.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <select
          value={selectedAddOn}
          onChange={(e) => setSelectedAddOn(e.target.value)}
          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Add On</option>
          {product.addons?.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name} (+${Number(a.price).toFixed(2)})
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="text-sm font-medium text-gray-800 w-5 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
