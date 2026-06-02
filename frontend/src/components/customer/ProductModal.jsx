import { useEffect } from 'react'

const STORAGE_URL = import.meta.env.VITE_API_URL

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

  // Calculate Buy X Get Y promotion details
  let freeItems = 0
  let paidItems = qty
  let promotionMessage = ''
  let isBogo = false

  if (product.promotion?.type === 'buy_x_get_y') {
    isBogo = true
    const buyQty = product.promotion.buy_qty || 1
    const freeQty = product.promotion.free_qty || 1
    const totalSets = Math.floor(qty / (buyQty + freeQty))
    const remainder = qty % (buyQty + freeQty)
    freeItems = totalSets * freeQty
    paidItems = qty - freeItems
    promotionMessage = `Buy ${buyQty} Get ${freeQty} Free! (${freeItems} free item${freeItems !== 1 ? 's' : ''})`
  }

  const totalPrice = finalPrice * paidItems

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300" 
      onClick={onClose}
    >
      <div 
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] transform transition-all duration-300 animate-slide-up sm:animate-fade-in"
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

        {/* Close Button */}
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
                <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                  {product.promotion?.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                  {product.promotion?.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                  {product.promotion?.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                  {product.promotion?.type === 'combo' && 'COMBO'}
                  {product.promotion?.type === 'combo_discount' && `${product.promotion.value}% OFF COMBO`}
                </div>
                {!isBogo && (
                  <div className="bg-black/50 backdrop-blur-md text-white/80 text-xs line-through font-medium px-3 py-1 rounded-full">
                    ${price.toFixed(2)}
                  </div>
                )}
              </>
            )}
            {isBogo ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex flex-col items-center">
                <span className="text-xs line-through text-white/70">${price.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm">$</span>
                  <span>{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-xl px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                <span className="text-sm">$</span>
                <span>{finalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-6 pt-2">
          {/* Header & Quantity */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 line-clamp-2">{product.name}</h2>
              {product.description && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">{product.description}</p>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-1 bg-teal-50 border border-teal-200 rounded-2xl p-1 shadow-inner shrink-0">
              <button 
                onClick={() => onQtyChange(Math.max(1, qty - 1))} 
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-semibold text-teal-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
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
                className="w-8 sm:w-10 text-center text-base font-semibold bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-slate-800" 
              />
              <button 
                onClick={() => onQtyChange(qty + 1)} 
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-semibold text-teal-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* BOGO Promotion Message */}
          {isBogo && freeItems > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6m0 7h7.5M12 12h7.5M12 8l-3.5 3.5M12 8l3.5 3.5" />
                </svg>
                {promotionMessage}
              </p>
              <p className="text-xs text-green-600 mt-1">
                You pay for {paidItems} item{paidItems !== 1 ? 's' : ''}, get {freeItems} free!
              </p>
            </div>
          )}

          {/* Options Section - ALL IN ONE BOX */}
          <div className="border-2 border-teal-200 rounded-xl p-4 bg-teal-50/30">
            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Select Size
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSizeChange(s.name)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedSize === s.name 
                          ? 'bg-teal-600 text-white shadow-md' 
                          : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                      }`}
                    >
                      {s.name}
                      <span className={`block text-[10px] mt-0.5 ${selectedSize === s.name ? 'text-teal-100' : 'text-teal-600'}`}>
                        +${Number(s.pivot?.price ?? 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-teal-200 my-4"></div>

            {/* Ice Level & Sugar Level Side by Side */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Ice Level */}
              {product.ice_levels?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    Ice Level
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.ice_levels.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => onIceChange(i.name)}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedIce === i.name 
                            ? 'bg-teal-600 text-white shadow-sm' 
                            : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                        }`}
                      >
                        {i.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Level */}
              {product.sugar_levels?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    Sugar Level
                  </p>
                  <div className="flex flex-col gap-2">
                    {product.sugar_levels.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSugarChange(s.name)}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedSugar === s.name 
                            ? 'bg-teal-600 text-white shadow-sm' 
                            : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-teal-200 my-4"></div>

            {/* Add-ons */}
            {product.addons?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Add-ons
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onAddOnChange('')}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${
                      selectedAddOn === '' 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                    }`}
                  >
                    No Add-on
                  </button>
                  {product.addons.map((a) => {
                    const size = product.sizes?.find(s => s.name === selectedSize)
                    const sp = a.size_prices?.find((sp) => sp.size_id === size?.id)
                    const ap = sp ? Number(sp.price) : (Number(a.price) || 0)
                    return (
                      <button
                        key={a.id}
                        onClick={() => onAddOnChange(a.name)}
                        className={`rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 ${
                          selectedAddOn === a.name 
                            ? 'bg-teal-600 text-white shadow-sm' 
                            : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                        }`}
                      >
                        {a.name} (+${ap.toFixed(2)})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stock Message */}
          {stockMsg && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-red-100 text-red-600 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {stockMsg}
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={onAddToCart} 
            className="w-full mt-5 relative overflow-hidden group bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-teal-200 transition-all duration-200 hover:shadow-xl active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart - 
              {isBogo && freeItems > 0 ? (
                <span className="flex items-center gap-1">
                  <span className="line-through text-white/50 text-xs">${(finalPrice * qty).toFixed(2)}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {freeItems} free
                  </span>
                </span>
              ) : (
                <span>${(finalPrice * qty).toFixed(2)}</span>
              )}
            </span>
          </button>

          {/* BOGO Summary Footer */}
          {isBogo && freeItems > 0 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-green-600 font-medium">
                🎉 You get {freeItems} free item{freeItems !== 1 ? 's' : ''} with this purchase!
              </p>
            </div>
          )}
        </div>

        {/* Drag Handle for Mobile */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-12 h-1 bg-teal-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}