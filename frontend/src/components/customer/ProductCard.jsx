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
  const finalPrice = calcFinalPrice(price, product.promotion)
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
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col w-full">
      
      {/* IMAGE */}
      <div className="relative p-3">
        {product.image ? (
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer" onClick={() => setShowModal(true)}>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}

            {product.promotion && (
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
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
              className={`w-full aspect-square object-cover transition duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
            <span className="absolute top-2 right-2 bg-blue-600/80 text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm">
              ${finalPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="absolute top-2 right-2 mt-8 mr-0.5 text-sm text-red-400 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        ) : (
          <div className="relative w-full aspect-square bg-gray-200 rounded-2xl cursor-pointer" onClick={() => setShowModal(true)}>
            {product.promotion && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                  {product.promotion.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                  {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                  {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                  {product.promotion.type === 'combo' && 'COMBO'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-3 pb-3 flex flex-col flex-1">

        {/* NAME */}
        <div className="mb-2">
          <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-1">
            {product.description}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={`mx-auto mb-2 w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition bg-blue-600 hover:bg-blue-700 active:scale-95`}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* STOCK */}
        {stockMsg && (
          <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2 mb-2">
            {stockMsg}
          </div>
        )}
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