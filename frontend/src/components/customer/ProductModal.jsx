import { useEffect } from 'react'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

export default function ProductModal({
  product,
  show,
  onClose,
  selectedSize,
  selectedSugar,
  selectedIce,
  selectedAddOn,
  qty,
  price,
  finalPrice,
  hasDiscount,
  stockMsg,
  onSizeChange,
  onSugarChange,
  onIceChange,
  onAddOnChange,
  onQtyChange,
  onAddToCart,
}) {
  useEffect(() => {
    if (show) {
      document.body.dataset.modalOpen = 'true'
      document.body.style.overflow = 'hidden'
    }
    return () => {
      delete document.body.dataset.modalOpen
      document.body.style.overflow = ''
    }
  }, [show])

  if (!show) return null

  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : STORAGE_URL + '/' + product.image

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] transform transition-all duration-300 animate-slide-up sm:animate-fade-in sm:animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all duration-200 group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Close Button (X) - Optional, can keep both or remove) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="relative group">
          <img 
            src={imgSrc} 
            alt={product.name} 
            className="w-full aspect-square object-cover" 
          />
          
          {/* Price Badge */}
          <div className="absolute top-4 right-16 flex flex-col items-end gap-1.5">
            {hasDiscount && (
              <>
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                  {product.promotion?.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                  {product.promotion?.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                  {product.promotion?.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                  {product.promotion?.type === 'combo' && 'COMBO'}
                </div>
                <div className="bg-black/50 backdrop-blur-md text-white/80 text-xs line-through font-medium px-3 py-1 rounded-full">
                  ${price.toFixed(2)}
                </div>
              </>
            )}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
              <span className="text-sm">$</span>
              <span>{finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-6 pt-2">
          {/* Header & Quantity */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 line-clamp-2">{product.name}</h2>
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{product.description}</p>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1 shadow-inner flex-shrink-0">
              <button 
                onClick={() => onQtyChange(Math.max(1, qty - 1))} 
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-semibold text-gray-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => { 
                  const v = parseInt(e.target.value); 
                  if (!isNaN(v)) onQtyChange(Math.max(1, v)) 
                }} 
                className="w-8 sm:w-10 text-center text-base font-semibold bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-gray-800" 
              />
              <button 
                onClick={() => onQtyChange(qty + 1)} 
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-semibold text-gray-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
            {/* Size Options */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span>Select Size</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSizeChange(s.name)}
                      className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSize === s.name 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 scale-105' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      {s.name}
                      <span className={`text-xs ml-1 ${selectedSize === s.name ? 'text-blue-100' : 'text-gray-500'}`}>
                        +${Number(s.pivot?.price ?? 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ice Level */}
            {product.ice_levels?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 7.5L12 12l7.5-4.5" />
                  </svg>
                  <span>Ice Level</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.ice_levels.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => onIceChange(i.name)}
                      className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedIce === i.name 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      {i.name === 'Regular' && '🧊 Regular'}
                      {i.name === 'Less Ice' && '❄️ Less Ice'}
                      {i.name === 'No Ice' && '🚫 No Ice'}
                      {i.name === 'Extra Ice' && '✨ Extra Ice'}
                      {!['Regular', 'Less Ice', 'No Ice', 'Extra Ice'].includes(i.name) && i.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugar Level */}
            {product.sugar_levels?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  <span>Sugar Level</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sugar_levels.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSugarChange(s.name)}
                      className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSugar === s.name 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      {s.name === '0%' && '🚫 0%'}
                      {s.name === '25%' && '🍬 25%'}
                      {s.name === '50%' && '🍭 50%'}
                      {s.name === '75%' && '🍫 75%'}
                      {s.name === '100%' && '🍯 100%'}
                      {!['0%', '25%', '50%', '75%', '100%'].includes(s.name) && s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {product.addons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
                  </svg>
                  <span>Add-ons</span>
                </p>
                <select 
                  value={selectedAddOn} 
                  onChange={(e) => onAddOnChange(e.target.value)} 
                  className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 cursor-pointer"
                >
                  <option value="">No Add-on</option>
                  {product.addons.map((a) => (
                    <option key={a.id} value={a.name}>
                      ➕ {a.name} (+${Number(a.price).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stock Message */}
            {stockMsg && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 text-xs font-medium rounded-xl p-3 border border-red-200 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stockMsg}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={onAddToCart} 
            className="w-full mt-5 relative overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:shadow-xl active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart - ${(finalPrice * qty).toFixed(2)}
            </span>
          </button>
        </div>

        {/* Drag Handle for Mobile */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}