import { useState } from 'react'
import { calcFinalPrice } from '../../../../utils/promotion.js'
import { X, Plus, Minus, Gift } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

export default function ProductCard({ product, opt, onSetOpt, onAddToCart }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState(opt.size || product.sizes?.[0]?.name || '')
  const [selectedIce, setSelectedIce] = useState(opt.ice || product.ice_levels?.[0]?.name || '')
  const [selectedSugar, setSelectedSugar] = useState(opt.sugar || product.sugar_levels?.[0]?.name || '')
  const [selectedAddOn, setSelectedAddOn] = useState(opt.addOn || '')
  const [quantity, setQuantity] = useState(1)

  const size = product.sizes?.find((s) => s.name === selectedSize)
  const basePrice = size ? Number(size.pivot?.price ?? 0) : 0
  let addonPrice = 0
  if (selectedAddOn) {
    const a = product.addons?.find((a) => a.name === selectedAddOn)
    if (a) {
      const sp = a.size_prices?.find((sp) => sp.size_id === size?.id)
      addonPrice = sp ? Number(sp.price) : (Number(a.price) || 0)
    }
  }
  const price = basePrice + addonPrice
  const finalPrice = product.promotion?.type === 'buy_x_get_y' ? price : calcFinalPrice(price, product.promotion)
  const hasDiscount = finalPrice < price
  
  // Calculate Buy X Get Y promotion details
  let freeItems = 0
  let paidItems = quantity
  let promotionMessage = ''
  
  if (product.promotion?.type === 'buy_x_get_y') {
    const buyQty = product.promotion.buy_qty || 1
    const freeQty = product.promotion.free_qty || 1
    const totalSets = Math.floor(quantity / (buyQty + freeQty))
    const remainder = quantity % (buyQty + freeQty)
    freeItems = totalSets * freeQty
    paidItems = quantity - freeItems
    promotionMessage = `Buy ${buyQty} Get ${freeQty} Free! (${freeItems} free item${freeItems !== 1 ? 's' : ''})`
  }
  
  const totalPrice = finalPrice * paidItems

  const handleAddToCart = () => {
    // First update all options in parent state
    onSetOpt(product.id, 'size', selectedSize)
    onSetOpt(product.id, 'ice', selectedIce)
    onSetOpt(product.id, 'sugar', selectedSugar)
    onSetOpt(product.id, 'addOn', selectedAddOn)
    
    // Create a new product object with the CURRENT selections
    const productWithOptions = {
      ...product,
      quantity: quantity,
      freeItems: freeItems,
      // Explicitly set the selected options
      selectedSize: selectedSize,
      selectedIce: selectedIce,
      selectedSugar: selectedSugar,
      selectedAddOn: selectedAddOn
    }
    
    onAddToCart(productWithOptions)
    setShowModal(false)
    setQuantity(1)
  }

  const incrementQty = () => setQuantity(prev => prev + 1)
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(1)
    }
  }

  return (
    <>
      <div className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=60')" }}>
        <div className="bg-white/90 backdrop-blur-sm flex flex-col flex-1">
          <div className="p-3 pb-0 relative cursor-pointer" onClick={() => setShowModal(true)}>
            {product.promotion && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  {product.promotion.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
                  {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                  {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                  {product.promotion.type === 'combo' && 'COMBO'}
                  {product.promotion.type === 'combo_discount' && `${product.promotion.value}% OFF COMBO`}
                </span>
              </div>
            )}
            {product.image ? (
              <img
                src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
                alt={product.name}
                className="w-full aspect-square object-contain rounded-lg transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-400 md:text-xs text-[10px]">
                No Image
              </div>
            )}
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="md:text-base text-sm font-semibold text-gray-800">{product.name}</h3>
              <div className="text-right">
                {hasDiscount && <span className="md:text-base text-sm line-through text-red-400 mr-1">${price.toFixed(2)}</span>}
                <span className="md:text-base text-sm font-bold text-amber-600">${finalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-auto w-8 h-8 rounded-full bg-gradient-to-r from-amber-900 to-amber-800 text-white flex items-center justify-center hover:from-amber-950 hover:to-amber-900 transition-all duration-300 shadow-md hover:shadow-lg mx-auto"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl shadow-amber-500/20 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-amber-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {product.image ? (
                  <img
                    src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white/20 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs">
                    No img
                  </div>
                )}
                <div>
                  <h2 className="text-white font-semibold text-lg">{product.name}</h2>
                  {product.promotion && (
                    <p className="text-xs text-white/80 mt-0.5">
                      {product.promotion.type === 'percentage' && `${product.promotion.value}% OFF`}
                      {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
                      {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - ALL OPTIONS IN ONE BOX */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50/30">
                {/* Size Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Select Size
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes?.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSize(s.name)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          selectedSize === s.name
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                        }`}
                      >
                        {s.name}
                        <span className="block text-xs mt-0.5">
                          ${Number(s.pivot?.price ?? 0).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-amber-200 my-4"></div>

                {/* Ice Level & Sugar Level */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Ice Level */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      Ice Level
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {product.ice_levels?.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setSelectedIce(l.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            selectedIce === l.name
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                          }`}
                        >
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sugar Level */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      Sugar Level
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {product.sugar_levels?.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSugar(s.name)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            selectedSugar === s.name
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-amber-200 my-4"></div>

                {/* Add-ons */}
                {product.addons?.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Add-ons
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedAddOn('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          selectedAddOn === ''
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                        }`}
                      >
                        No Add On
                      </button>
                      {product.addons?.map((a) => {
                        const sp = a.size_prices?.find((sp) => sp.size_id === size?.id)
                        const ap = sp ? Number(sp.price) : (Number(a.price) || 0)
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelectedAddOn(a.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              selectedAddOn === a.name
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
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

              {/* Quantity Selector - Number Input */}
              <div className="mt-5 pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Quantity
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={decrementQty}
                    className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-amber-100 hover:text-teal-700 transition-all border border-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-20 h-10 text-center text-lg font-bold text-gray-800 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={incrementQty}
                    className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Buy X Get Y Promotion Message */}
                {product.promotion?.type === 'buy_x_get_y' && freeItems > 0 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-medium flex items-center justify-center gap-1">
                      <Gift className="w-3 h-3" />
                      {promotionMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-amber-100 bg-amber-50/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Unit Price</span>
                <div className="text-right">
                  {hasDiscount && (
                    <span className="text-sm line-through text-gray-400 mr-2">${price.toFixed(2)}</span>
                  )}
                  <span className="text-lg font-bold text-amber-600">${finalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {product.promotion?.type === 'buy_x_get_y' && freeItems > 0 && (
                <div className="flex items-center justify-between mb-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg border border-green-200">
                  <span className="text-gray-700 font-medium flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-green-600" />
                    Items Summary
                  </span>
                  <div className="text-right">
                    <span className="text-green-700 font-semibold">{paidItems} paid</span>
                    <span className="text-gray-400 mx-1">+</span>
                    <span className="text-green-600 font-semibold">{freeItems} free</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4 pt-2 border-t border-amber-200">
                <span className="text-gray-800 font-semibold text-lg">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-amber-900 to-amber-800 text-white py-3 rounded-xl font-semibold hover:from-amber-950 hover:to-amber-900 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Order ({quantity} item{quantity !== 1 ? 's' : ''})
                {freeItems > 0 && ` (${freeItems} free)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}