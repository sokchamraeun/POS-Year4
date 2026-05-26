import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useCustomerAuth()

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

  async function handleAddToCart() {
    if (!isLoggedIn) {
      navigate('/customer/login')
      return
    }

    setStockMsg('')

    const size = product.sizes?.find(
      (s) => s.name === selectedSize
    )

    const addon = product.addons?.find(
      (a) => a.name === selectedAddOn
    )

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
              size_id: size?.id,
              qty,
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
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      addOn: selectedAddOn,
      unitPrice: price,
      qty,
    }

    onAddToCart?.(item)

    setIsAdded(true)

    setTimeout(() => {
      setIsAdded(false)
    }, 1200)
  }

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col w-full">
      
      {/* IMAGE */}
      <div className="relative p-3">
        {product.image ? (
          <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
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
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-3 pb-3 flex flex-col flex-1">

        {/* NAME + PRICE */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1">
              {product.name}
            </h3>

            <p className="text-xs text-gray-500 line-clamp-1">
              {product.description}
            </p>
          </div>

          <span className="text-blue-600 font-bold text-sm sm:text-lg">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* SIZE */}
        <div className="mb-2">
          <p className="text-xs font-semibold mb-1 text-gray-600">
            Size
          </p>

          <div className="flex gap-1">
            {product.sizes?.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSize(s.name)}
                className={`flex-1 rounded-lg py-1.5 text-xs transition ${
                  selectedSize === s.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* SELECTS */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select
            value={selectedIce}
            onChange={(e) => setSelectedIce(e.target.value)}
            className="bg-gray-100 rounded-lg px-2 py-2 text-xs"
          >
            {product.ice_levels?.map((i) => (
              <option key={i.id} value={i.name}>
                {i.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSugar}
            onChange={(e) => setSelectedSugar(e.target.value)}
            className="bg-gray-100 rounded-lg px-2 py-2 text-xs"
          >
            {product.sugar_levels?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* ADDON */}
        <div className="mb-2">
          <select
            value={selectedAddOn}
            onChange={(e) => setSelectedAddOn(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-2 py-2 text-xs"
          >
            <option value="">No Add-on</option>

            {product.addons?.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} (+${Number(a.price).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* STOCK */}
        {stockMsg && (
          <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2 mb-2">
            {stockMsg}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center gap-2 mt-auto">

          {/* QTY */}
          <div className="flex items-center bg-gray-100 rounded-xl">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 flex items-center justify-center"
            >
              -
            </button>

            <span className="w-8 text-center text-sm">
              {qty}
            </span>

            <button
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 flex items-center justify-center"
            >
              +
            </button>
          </div>

          {/* BTN */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold text-white transition ${
              isAdded
                ? 'bg-green-500'
                : 'bg-blue-600 active:scale-95'
            }`}
          >
            {isAdded ? 'Added ✓' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}