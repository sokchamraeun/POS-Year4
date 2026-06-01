import { useState } from 'react'
import { calcFinalPrice } from '../../utils/promotion.js'
import ProductModal from './ProductModal.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0]?.name || ''
  )
  const [selectedSugar, setSelectedSugar] = useState(
    product.sugar_levels?.[0]?.name || ''
  )
  const [selectedIce, setSelectedIce] = useState(
    product.ice_levels?.[0]?.name || ''
  )
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

  const price =
    getBasePrice(selectedSize) + getAddOnPrice(selectedAddOn)
  const finalPrice = product.promotion?.type === 'buy_x_get_y' ? price : calcFinalPrice(price, product.promotion)
  const hasDiscount = finalPrice < price

  async function handleAddToCart(quantity = 1) {
    setStockMsg('')

    const size = product.sizes?.find((s) => s.name === selectedSize)
    const addon = product.addons?.find((a) => a.name === selectedAddOn)

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

    const item = {
      ...product,
      promotion: product.promotion,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      addOn: selectedAddOn,
      unitPrice: price,
      qty: quantity,
    }

    onAddToCart?.(item)

    setIsAdded(true)

    setTimeout(() => {
      setIsAdded(false)
    }, 1200)
  }

  return (
    <>
      <div className="group bg-white rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col w-full overflow-hidden">
        
        {/* IMAGE */}
        <div className="relative p-2.5 sm:p-3 pb-1">
          {product.image ? (
            <div 
              className="relative overflow-hidden rounded-2xl bg-slate-50 cursor-pointer aspect-square" 
              onClick={() => setShowModal(true)}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-slate-100 animate-pulse"></div>
              )}

              {product.promotion && (
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                  <span className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 select-none tracking-wider uppercase">
                    <span className="animate-pulse">🔥</span>
                    {product.promotion.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                    {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                    {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                    {product.promotion.type === 'combo' && 'COMBO'}
                  </span>
                </div>
              )}

              <img
                onLoad={() => setImageLoaded(true)}
                src={`${
                  product.image.startsWith('http')
                    ? ''
                    : import.meta.env.VITE_STORAGE_URL + '/'
                }${product.image}`}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-105`}
              />
            </div>
          ) : (
            <div 
              className="relative w-full aspect-square bg-slate-100 rounded-2xl cursor-pointer flex items-center justify-center" 
              onClick={() => setShowModal(true)}
            >
              {product.promotion && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 select-none tracking-wider uppercase">
                    <span className="animate-pulse">🔥</span>
                    {product.promotion.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                    {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                    {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                    {product.promotion.type === 'combo' && 'COMBO'}
                  </span>
                </div>
              )}
              <div className="text-slate-300 flex flex-col items-center justify-center gap-1.5 select-none">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide uppercase">No Photo</span>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="px-3 pb-3 pt-1.5 flex flex-col flex-1">

          {/* NAME & DESCRIPTION */}
          <div className="mb-2 flex-1 cursor-pointer" onClick={() => setShowModal(true)}>
            <h3 className="font-bold text-sm sm:text-base text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
              {product.name}
            </h3>

            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed min-h-8 sm:min-h-10">
              {product.description || 'Delicately crafted beverage made from selected premium ingredients.'}
            </p>
          </div>

          {/* STOCK ERROR DISPLAY */}
          {stockMsg && (
            <div className="bg-red-50 text-red-600 text-[10px] sm:text-xs rounded-xl p-2 mb-2 flex items-center gap-1 border border-red-100">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium line-clamp-1">{stockMsg}</span>
            </div>
          )}

          {/* PRICING & ACTION */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 mt-auto">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through leading-none mb-0.5">
                  ${price.toFixed(2)}
                </span>
              )}
              <span className="text-sm sm:text-lg font-extrabold bg-linear-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent leading-none">
                ${finalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 shadow-md ${
                isAdded
                  ? 'bg-emerald-500 text-white scale-105 shadow-emerald-100'
                  : 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-100 hover:shadow-lg'
              }`}
            >
              {isAdded ? (
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
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
        qty={qty}
        price={price}
        finalPrice={finalPrice}
        hasDiscount={hasDiscount}
        stockMsg={stockMsg}
        onSizeChange={setSelectedSize}
        onSugarChange={setSelectedSugar}
        onIceChange={setSelectedIce}
        onAddOnChange={setSelectedAddOn}
        onQtyChange={setQty}
        onAddToCart={() => { handleAddToCart(qty); setShowModal(false) }}
      />
    </>
  )
}