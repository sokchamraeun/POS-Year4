import { useEffect } from 'react'
import { calcFinalPrice, resolvePromotionForSize } from '../../utils/promotion.js'

const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ?? import.meta.env.VITE_API_URL ?? ''

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
  submitLabel = 'Add to Cart',
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

  const imgSrc = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${STORAGE_URL}/${product.image}`
    : 'https://placehold.co/600x600?text=No+Image'

  const selectedSizeObj = product.sizes?.find((s) => s.name === selectedSize)
  const promo = resolvePromotionForSize(product.promotion, selectedSizeObj?.id)

  let freeItems = 0
  let paidItems = qty
  let promotionMessage = ''
  let isBogo = false

  if (promo?.type === 'buy_x_get_y') {
    isBogo = true

    const buyQty = promo.buy_qty || 1
    const freeQty = promo.free_qty || 1
    const totalSets = Math.floor(qty / (buyQty + freeQty))

    freeItems = totalSets * freeQty
    paidItems = qty - freeItems
    promotionMessage = `Buy ${buyQty} Get ${freeQty} Free! (${freeItems} free item${
      freeItems !== 1 ? 's' : ''
    })`
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
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-[#3d2817]/70 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-[#3d2817]/90 active:scale-95 transition-all duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#3d2817]/70 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-[#3d2817]/90 active:scale-95 transition-all duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
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
          <div className="absolute top-4 right-16 flex flex-col items-end gap-2">
            {hasDiscount && (
              <>
                {/* Bigger Red Promotion Label */}
                <div className="bg-red-600 text-white text-sm sm:text-base font-extrabold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm uppercase tracking-wide border-2 border-white">
                  {promo?.type === 'percentage' &&
                    `${parseFloat(promo.value)}% OFF`}
                  {promo?.type === 'fixed_amount' && `$${promo.value} OFF`}
                  {promo?.type === 'buy_x_get_y' &&
                    `Buy ${promo.buy_qty} Get ${promo.free_qty}`}
                  {promo?.type === 'combo' && 'COMBO'}
                  {promo?.type === 'combo_discount' &&
                    `${promo.value}% OFF COMBO`}
                </div>

                {!isBogo && (
                  <div className="bg-[#3d2817]/70 backdrop-blur-md text-white/80 text-xs line-through font-medium px-3 py-1 rounded-full">
                    ${price.toFixed(2)}
                  </div>
                )}
              </>
            )}

            {isBogo ? (
              <div className="bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold text-xl px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex flex-col items-center">
                <span className="text-xs line-through text-white/70">
                  ${price.toFixed(2)}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-sm">$</span>
                  <span>{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#3d2817] to-[#5b3a29] text-white font-bold text-xl px-5 py-2.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1">
                <span className="text-sm">$</span>
                <span>{finalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/85 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-6 pt-2">
          {/* Header + Quantity */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#3d2817] mb-1 line-clamp-2">
                {product.name}
              </h2>

              {product.description && (
                <p className="text-xs sm:text-sm text-[#8a715c] leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-900/15 rounded-2xl p-1 shadow-inner shrink-0">
              <button
                onClick={() => onQtyChange(Math.max(1, qty - 1))}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-bold text-[#5b3a29] hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
              >
                -
              </button>

              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v)) onQtyChange(Math.max(1, v))
                }}
                className="w-8 sm:w-10 text-center text-base font-bold bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-[#3d2817]"
              />

              <button
                onClick={() => onQtyChange(qty + 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-bold text-[#5b3a29] hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* BOGO Promotion Message */}
          {isBogo && freeItems > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6m0 7h7.5M12 12h7.5M12 8l-3.5 3.5M12 8l3.5 3.5"
                  />
                </svg>
                {promotionMessage}
              </p>

              <p className="text-xs text-green-600 mt-1">
                You pay for {paidItems} item{paidItems !== 1 ? 's' : ''}, get{' '}
                {freeItems} free!
              </p>
            </div>
          )}

          {/* Options Box */}
          <div className="border-2 border-amber-900/15 rounded-2xl p-4 bg-amber-50/40">
            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-bold text-[#5b3a29] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-700 rounded-full"></span>
                  Select Size
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((s) => {
                    const sizePrice = Number(s.pivot?.price ?? 0)
                    const sizePromo = resolvePromotionForSize(
                      product.promotion,
                      s.id
                    )
                    const sizeFinal =
                      sizePromo?.type === 'buy_x_get_y'
                        ? sizePrice
                        : calcFinalPrice(sizePrice, sizePromo)

                    const sizeHasDiscount = sizeFinal < sizePrice
                    const isSelected = selectedSize === s.name

                    return (
                      <button
                        key={s.id}
                        onClick={() => onSizeChange(s.name)}
                        className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#5b3a29] to-amber-700 text-white shadow-md'
                            : 'bg-white text-[#3d2817] hover:bg-amber-100 border border-amber-900/15'
                        }`}
                      >
                        {sizeHasDiscount && (
                          <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-lg border-2 border-white z-10">
                            {sizePromo.type === 'percentage'
                              ? `-${parseFloat(sizePromo.value)}%`
                              : 'SALE'}
                          </span>
                        )}

                        {s.name}

                        {sizeHasDiscount ? (
                          <span className="block text-[10px] mt-0.5 leading-tight">
                            <span
                              className={`line-through ${
                                isSelected
                                  ? 'text-amber-100/70'
                                  : 'text-[#8a715c]'
                              }`}
                            >
                              ${sizePrice.toFixed(2)}
                            </span>

                            <span
                              className={`ml-1 font-bold ${
                                isSelected ? 'text-white' : 'text-red-600'
                              }`}
                            >
                              ${sizeFinal.toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span
                            className={`block text-[10px] mt-0.5 ${
                              isSelected ? 'text-amber-100' : 'text-amber-700'
                            }`}
                          >
                            ${sizePrice.toFixed(2)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-amber-900/15 my-4"></div>

            {/* Ice + Sugar */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              {product.ice_levels?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#5b3a29] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-700 rounded-full"></span>
                    Ice Level
                  </p>

                  <div className="flex flex-col gap-2">
                    {product.ice_levels.map((i) => (
                      <button
                        key={i.id}
                        onClick={() => onIceChange(i.name)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                          selectedIce === i.name
                            ? 'bg-gradient-to-r from-[#5b3a29] to-amber-700 text-white shadow-sm'
                            : 'bg-white text-[#3d2817] hover:bg-amber-100 border border-amber-900/15'
                        }`}
                      >
                        {i.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sugar_levels?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#5b3a29] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-700 rounded-full"></span>
                    Sugar Level
                  </p>

                  <div className="flex flex-col gap-2">
                    {product.sugar_levels.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSugarChange(s.name)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                          selectedSugar === s.name
                            ? 'bg-gradient-to-r from-[#5b3a29] to-amber-700 text-white shadow-sm'
                            : 'bg-white text-[#3d2817] hover:bg-amber-100 border border-amber-900/15'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-amber-900/15 my-4"></div>

            {/* Add-ons */}
            {product.addons?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#5b3a29] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-700 rounded-full"></span>
                  Add-ons
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onAddOnChange('')}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      selectedAddOn === ''
                        ? 'bg-gradient-to-r from-[#5b3a29] to-amber-700 text-white shadow-sm'
                        : 'bg-white text-[#3d2817] hover:bg-amber-100 border border-amber-900/15'
                    }`}
                  >
                    No Add-on
                  </button>

                  {product.addons.map((a) => {
                    const size = product.sizes?.find(
                      (s) => s.name === selectedSize
                    )
                    const sp = a.size_prices?.find(
                      (sp) => sp.size_id === size?.id
                    )
                    const ap = sp ? Number(sp.price) : Number(a.price) || 0

                    return (
                      <button
                        key={a.id}
                        onClick={() => onAddOnChange(a.name)}
                        className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                          selectedAddOn === a.name
                            ? 'bg-gradient-to-r from-[#5b3a29] to-amber-700 text-white shadow-sm'
                            : 'bg-white text-[#3d2817] hover:bg-amber-100 border border-amber-900/15'
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
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {stockMsg}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="w-full mt-5 relative overflow-hidden group bg-gradient-to-r from-[#5b3a29] to-amber-700 hover:from-[#3d2817] hover:to-[#5b3a29] text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-amber-900/20 transition-all duration-200 hover:shadow-xl active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              {submitLabel} -

              {isBogo && freeItems > 0 ? (
                <span className="flex items-center gap-1">
                  <span className="line-through text-white/50 text-xs">
                    ${(finalPrice * qty).toFixed(2)}
                  </span>

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
                🎉 You get {freeItems} free item
                {freeItems !== 1 ? 's' : ''} with this purchase!
              </p>
            </div>
          )}
        </div>

        {/* Drag Handle for Mobile */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-12 h-1 bg-amber-900/20 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}