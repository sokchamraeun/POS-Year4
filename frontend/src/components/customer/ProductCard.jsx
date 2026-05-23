import { useState } from 'react'

export default function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.name || '')
  const [selectedSugar, setSelectedSugar] = useState(product.sugar_levels?.[0]?.name || '')
  const [selectedIce, setSelectedIce] = useState(product.ice_levels?.[0]?.name || '')
  const [selectedAddOn, setSelectedAddOn] = useState('')
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

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
    
    // Animation feedback
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1000)
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-400 flex flex-col transform hover:-translate-y-1"
    >
      {/* Badge for popular items (optional) */}
      {product.isPopular && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Popular
        </div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-4 pb-0">
          {product.image ? (
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 rounded-xl animate-pulse"></div>
              )}
              <img
                onLoad={() => setImageLoaded(true)}
                src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
                alt={product.name}
                className={`w-full aspect-square object-cover rounded-xl shadow-md transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } group-hover:scale-105 transition-transform duration-400`}
              />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800 line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
            )}
          </div>
          <div className="ml-2 transition-all duration-200 transform hover:scale-105">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Size Selector */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Size</label>
          <div className="flex gap-2">
            {product.sizes?.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSize(s.name)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                  selectedSize === s.name
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {s.name}
                <span className="block text-[10px] opacity-75">
                  ${Number(s.pivot?.price ?? 0).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ice & Sugar Levels */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Ice Level</label>
            <select
              value={selectedIce}
              onChange={(e) => setSelectedIce(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
            >
              {product.ice_levels?.map((l) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Sugar Level</label>
            <select
              value={selectedSugar}
              onChange={(e) => setSelectedSugar(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
            >
              {product.sugar_levels?.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Add-ons</label>
          <select
            value={selectedAddOn}
            onChange={(e) => setSelectedAddOn(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 cursor-pointer"
          >
            <option value="">No Add-ons</option>
            {product.addons?.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} (+${Number(a.price).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-lg bg-white text-gray-600 text-sm flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800 w-6 text-center transition-all duration-200">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 rounded-lg bg-white text-gray-600 text-sm flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              isAdded 
                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {isAdded ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Add this CSS to your global styles or component */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25%); }
        }
        .animate-bounce {
          animation: bounce 0.5s infinite;
        }
      `}</style>
    </div>
  )
}