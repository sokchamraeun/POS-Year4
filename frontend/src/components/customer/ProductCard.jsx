import { useState } from 'react'
import { Gift } from 'lucide-react'
import { calcFinalPrice, getPromotionShort, resolvePromotionForSize } from '../../utils/promotion.js'
import ProductModal from './ProductModal.jsx'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

export default function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.name || '')
  const [selectedSugar, setSelectedSugar] = useState(product.sugar_levels?.[0]?.name || '')
  const [selectedIce, setSelectedIce] = useState(product.ice_levels?.[0]?.name || '')
  const [sugarNote, setSugarNote] = useState('')
  const [iceNote, setIceNote] = useState('')
  const [selectedAddOn, setSelectedAddOn] = useState('')
  const [qty, setQty] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [stockMsg, setStockMsg] = useState('')
  const [showModal, setShowModal] = useState(false)

  function getBasePrice(sizeName) {
    const size = product.sizes?.find((s) => s.name === sizeName)
    return size ? Number(size.pivot?.price ?? 0) : 0
  }

  function getAddOnPrice(addOnName) {
    if (!addOnName) return 0
    const addon = product.addons?.find((a) => a.name === addOnName)
    return addon ? Number(addon.price) : 0
  }

  function getImageUrl(image) {
    if (!image) return ''
    return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
  }

  const selectedSizeObj = product.sizes?.find((s) => s.name === selectedSize)
  const resolvedPromotion = resolvePromotionForSize(product.promotion, selectedSizeObj?.id)

  const price = getBasePrice(selectedSize) + getAddOnPrice(selectedAddOn)

  const finalPrice =
    resolvedPromotion?.type === 'buy_x_get_y'
      ? price
      : calcFinalPrice(price, resolvedPromotion)

  const hasDiscount = finalPrice < price

  async function handleAddToCart(quantity = 1) {
    setStockMsg('')

    const size = product.sizes?.find((s) => s.name === selectedSize)
    const addon = product.addons?.find((a) => a.name === selectedAddOn)
    const iceObj = product.ice_levels?.find((i) => i.name === selectedIce)
    const sugarObj = product.sugar_levels?.find((s) => s.name === selectedSugar)

    try {
      const res = await fetch(`${API_URL}/orders/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              product_id: product.id,
              size_id: size?.id || null,
              qty: quantity,
              addon_id: addon?.id || null,
            },
          ],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStockMsg(data?.message || 'Stock error')
        return
      }

      if (!data.available) {
        setStockMsg('Out of stock')
        return
      }
    } catch (err) {
      setStockMsg(err.message)
      return
    }

    onAddToCart?.({
      ...product,
      promotion: resolvedPromotion,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      sugarNote: sugarObj?.requires_input ? sugarNote.trim() : '',
      iceNote: iceObj?.requires_input ? iceNote.trim() : '',
      addOn: selectedAddOn,
      unitPrice: price,
      qty: quantity,
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1200)
  }

  const promotionLabel = resolvedPromotion ? getPromotionShort(resolvedPromotion) : ''

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-amber-900/10 shadow-sm hover:shadow-[0_10px_35px_rgba(92,58,33,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col w-full overflow-hidden">
        {/* Top coffee accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5b3a29] via-amber-500 to-[#3d2817] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image */}
        <div className="relative p-2.5 pb-1.5">
          <div
            className="relative overflow-hidden rounded-xl bg-amber-50 aspect-square cursor-pointer border border-amber-900/5"
            onClick={() => setShowModal(true)}
          >
            {/* Skeleton */}
            {!imageLoaded && product.image && (
              <div className="absolute inset-0 bg-amber-100/60 animate-pulse" />
            )}

            {/* Promo badge */}
            {resolvedPromotion && (
              <div className="absolute left-3 top-3 z-20">
                <div className="flex items-center gap-1.5 rounded-full border border-red-700 bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                  <Gift className="h-3.5 w-3.5" />
                  {promotionLabel}
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d2817]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-3">
              <span className="text-white text-[10px] font-semibold tracking-widest uppercase bg-[#3d2817]/35 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                View Details
              </span>
            </div>

            {product.image ? (
              <img
                onLoad={() => setImageLoaded(true)}
                src={getImageUrl(product.image)}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-amber-900/25 select-none">
                <svg className="w-9 h-9 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <span className="text-[10px] font-medium tracking-wide uppercase">
                  No Photo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-3 pb-3 pt-1 flex flex-col flex-1">
          {/* Name & description */}
          <div className="mb-2 flex-1 cursor-pointer" onClick={() => setShowModal(true)}>
            <h3 className="font-bold text-sm sm:text-[15px] text-[#3d2817] line-clamp-1 group-hover:text-[#5b3a29] transition-colors duration-200">
              {product.name}
            </h3>

            <p className="text-[11px] text-[#8a715c] mt-0.5 line-clamp-2 leading-relaxed min-h-8">
              {product.description || 'Delicately crafted beverage made from selected premium ingredients.'}
            </p>
          </div>

          {/* Stock error */}
          {stockMsg && (
            <div className="bg-red-50 text-red-500 text-[10px] rounded-lg px-2.5 py-1.5 mb-2 flex items-center gap-1.5 border border-red-100">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span className="font-medium line-clamp-1">
                {stockMsg}
              </span>
            </div>
          )}

          {/* Price & action */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-900/10 mt-auto">
            <div className="flex flex-col leading-none">
              {hasDiscount && (
                <span className="text-[10px] text-[#8a715c] line-through mb-0.5">
                  ${price.toFixed(2)}
                </span>
              )}

              <span className="text-base font-extrabold bg-gradient-to-r from-[#3d2817] via-[#5b3a29] to-amber-700 bg-clip-text text-transparent">
                ${finalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 shadow-md ${
                isAdded
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-gradient-to-br from-[#5b3a29] to-amber-700 text-white shadow-amber-200 hover:shadow-[0_4px_16px_rgba(92,58,33,0.4)] hover:scale-110'
              }`}
            >
              {isAdded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        show={showModal}
        onClose={() => setShowModal(false)}
        selectedSize={selectedSize}
        selectedSugar={selectedSugar}
        selectedIce={selectedIce}
        selectedAddOn={selectedAddOn}
        sugarNote={sugarNote}
        iceNote={iceNote}
        qty={qty}
        price={price}
        finalPrice={finalPrice}
        hasDiscount={hasDiscount}
        stockMsg={stockMsg}
        onSizeChange={setSelectedSize}
        onSugarChange={setSelectedSugar}
        onIceChange={setSelectedIce}
        onAddOnChange={setSelectedAddOn}
        onSugarNoteChange={setSugarNote}
        onIceNoteChange={setIceNote}
        onQtyChange={setQty}
        onAddToCart={() => {
          handleAddToCart(qty)
          setShowModal(false)
        }}
      />
    </>
  )
}