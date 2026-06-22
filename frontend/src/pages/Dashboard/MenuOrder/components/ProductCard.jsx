import { useState } from 'react'
import {
  calcFinalPrice,
  resolvePromotionForSize,
  getPromotionShort,
} from '../../../../utils/promotion.js'
import { X, Plus, Minus, Gift } from 'lucide-react'

export default function ProductCard({
  product,
  opt = {},
  onSetOpt,
  onAddToCart,
}) {
  const [showModal, setShowModal] = useState(false)

  const [selectedSize, setSelectedSize] = useState(
    opt.size || product.sizes?.[0]?.name || ''
  )
  const [selectedIce, setSelectedIce] = useState(
    opt.ice || product.ice_levels?.[0]?.name || ''
  )
  const [selectedSugar, setSelectedSugar] = useState(
    opt.sugar || product.sugar_levels?.[0]?.name || ''
  )
  const [iceNote, setIceNote] = useState(opt.iceNote || '')
  const [sugarNote, setSugarNote] = useState(opt.sugarNote || '')
  const [selectedAddOn, setSelectedAddOn] = useState(opt.addOn || '')
  const [quantity, setQuantity] = useState(1)

  const selectedIceObj = product.ice_levels?.find((i) => i.name === selectedIce)
  const selectedSugarObj = product.sugar_levels?.find((s) => s.name === selectedSugar)

  const selectedStyle =
    'border-[#c47a2c] bg-[#c47a2c] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c47a2c]/30'

  const normalStyle =
    'border-[#e1c1a0] bg-white text-[#6b3b1d] hover:border-[#c47a2c] hover:bg-[#fffaf3] focus-visible:outline-none focus-visible:border-[#c47a2c] focus-visible:bg-[#fff4e6] focus-visible:ring-2 focus-visible:ring-[#c47a2c]/20'

  const size = product.sizes?.find((s) => s.name === selectedSize)
  const basePrice = size ? Number(size.pivot?.price ?? 0) : 0

  let addonPrice = 0
  if (selectedAddOn) {
    const addon = product.addons?.find((a) => a.name === selectedAddOn)

    if (addon) {
      const sizePrice = addon.size_prices?.find(
        (sp) => sp.size_id === size?.id
      )

      addonPrice = sizePrice
        ? Number(sizePrice.price)
        : Number(addon.price || 0)
    }
  }

  const resolvedPromotion = resolvePromotionForSize(product.promotion, size?.id)

  const isBuyGet =
    resolvedPromotion && resolvedPromotion.type === 'buy_x_get_y'

  // Original unit price = selected size + selected add-on
  const originalUnitPrice = basePrice + addonPrice

  // Discount only selected size price, not add-on price
  const discountedBasePrice = isBuyGet
    ? basePrice
    : calcFinalPrice(basePrice, resolvedPromotion)

  // Final unit price = discounted size + add-on
  const finalUnitPrice = isBuyGet
    ? originalUnitPrice
    : discountedBasePrice + addonPrice

  const hasDiscount = discountedBasePrice < basePrice

  let freeItems = 0
  let paidItems = quantity
  let promotionMessage = ''

  if (isBuyGet) {
    const buyQty = Number(resolvedPromotion.buy_qty || 1)
    const freeQty = Number(resolvedPromotion.free_qty || 1)

    const setSize = buyQty + freeQty
    const totalSets = Math.floor(quantity / setSize)

    freeItems = totalSets * freeQty
    paidItems = quantity - freeItems

    promotionMessage = `Buy ${buyQty} Get ${freeQty} Free`
  }

  const totalPrice = finalUnitPrice * paidItems

  const imageSrc = product.image
    ? `${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`
    : null

  const promotionLabel = resolvedPromotion
    ? getPromotionShort(resolvedPromotion)
    : ''

  const handleAddToCart = () => {
    onSetOpt?.(product.id, 'size', selectedSize)
    onSetOpt?.(product.id, 'ice', selectedIce)
    onSetOpt?.(product.id, 'sugar', selectedSugar)
    onSetOpt?.(product.id, 'addOn', selectedAddOn)

    onAddToCart({
      ...product,
      quantity,
      freeItems,
      paidItems,
      selectedSize,
      selectedIce,
      selectedSugar,
      selectedIceNote: selectedIceObj?.requires_input ? iceNote.trim() : '',
      selectedSugarNote: selectedSugarObj?.requires_input ? sugarNote.trim() : '',
      selectedAddOn,
      originalUnitPrice,
      finalUnitPrice,
      totalPrice,
    })

    setShowModal(false)
    setQuantity(1)
  }

  const incrementQty = () => setQuantity((prev) => prev + 1)

  const decrementQty = () =>
    setQuantity((prev) => {
      if (prev <= 1) return 1
      return prev - 1
    })

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10)

    if (!Number.isNaN(value) && value >= 1) {
      setQuantity(value)
      return
    }

    if (e.target.value === '') {
      setQuantity(1)
    }
  }

  return (
    <>
      {/* Product Card */}
      <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#d7ad83] bg-[#fffaf3] transition-all duration-300 hover:-translate-y-1 hover:border-[#8a5a33]">
        {/* Promotion Label */}
        {resolvedPromotion && (
          <div className="absolute left-3 top-3 z-20">
            <div className="flex items-center gap-1.5 rounded-full border border-red-700 bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white">
              <Gift className="h-3.5 w-3.5" />
              {promotionLabel}
            </div>
          </div>
        )}

        {/* Image */}
        <div
          onClick={() => setShowModal(true)}
          className="relative cursor-pointer p-3 pb-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#ead2b8] bg-[#fff4e6] p-3">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="aspect-square w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-[#c99a68] bg-[#fffaf3] text-xs font-bold text-[#8a5a33]">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-sm font-black text-[#4b2a18] md:text-base">
                {product.name}
              </h3>

              {selectedSize && (
                <p className="mt-1 text-[11px] font-semibold text-[#8a5a33]">
                  Size: {selectedSize}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {hasDiscount && (
                <div className="text-xs font-bold text-red-500 line-through">
                  ${originalUnitPrice.toFixed(2)}
                </div>
              )}

              <div className="text-base font-black text-[#8a5a33] md:text-lg">
                ${finalUnitPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c47a2c] bg-[#c47a2c] px-4 py-2.5 text-sm font-black text-white transition-all duration-300 hover:border-[#a86425] hover:bg-[#a86425] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-3"
          onClick={() => setShowModal(false)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-[#d7ad83] bg-[#fffaf3]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-[#ead2b8] bg-[#fff4e6] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="h-16 w-16 rounded-3xl border border-[#d7ad83] bg-white object-cover p-1"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7ad83] bg-white text-[10px] font-bold text-[#8a5a33]">
                      No img
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="line-clamp-1 text-xl font-black text-[#4b2a18]">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-xs font-bold text-[#8a5a33]">
                      Customize your drink
                    </p>

                    {resolvedPromotion && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-red-600 bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                        <Gift className="h-3 w-3" />
                        {promotionLabel}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-[#d7ad83] bg-white p-2 text-[#6b3b1d] transition hover:border-red-500 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-3xl border border-[#ead2b8] bg-white p-4">
                {/* Size */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-black text-[#6b3b1d]">
                    Select Size
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes?.map((s) => {
                      const sizePrice = Number(s.pivot?.price ?? 0)
                      const sizePromo = resolvePromotionForSize(
                        product.promotion,
                        s.id
                      )

                      const sizeIsBuyGet =
                        sizePromo && sizePromo.type === 'buy_x_get_y'

                      const sizeFinal = sizeIsBuyGet
                        ? sizePrice
                        : calcFinalPrice(sizePrice, sizePromo)

                      const sizeHasDiscount = sizeFinal < sizePrice
                      const isSelected = selectedSize === s.name

                      let sizePromoText = ''
                      if (sizePromo) {
                        if (sizePromo.type === 'percentage') {
                          sizePromoText = `-${parseFloat(sizePromo.value)}%`
                        } else if (sizePromo.type === 'fixed_amount') {
                          sizePromoText = 'SALE'
                        } else {
                          sizePromoText = 'FREE'
                        }
                      }

                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSize(s.name)}
                          className={`relative rounded-2xl border px-2 py-3 text-center text-xs font-black transition-all ${
                            isSelected ? selectedStyle : normalStyle
                          }`}
                        >
                          {sizePromo && (
                            <span
                              className={`absolute rounded-full border border-red-700 bg-red-600 font-black text-white ${
                                isSelected
                                  ? '-right-2 -top-3 px-2.5 py-1 text-[10px]'
                                  : '-right-1.5 -top-2 px-1.5 py-0.5 text-[8px]'
                              }`}
                            >
                              {sizePromoText}
                            </span>
                          )}

                          <span className="block">{s.name}</span>

                          {sizeHasDiscount ? (
                            <span className="mt-1 block leading-tight">
                              <span
                                className={`text-[10px] line-through ${
                                  isSelected ? 'text-white/80' : 'text-red-400'
                                }`}
                              >
                                ${sizePrice.toFixed(2)}
                              </span>

                              <span
                                className={`ml-1 text-[11px] font-black ${
                                  isSelected ? 'text-white' : 'text-[#8a5a33]'
                                }`}
                              >
                                ${sizeFinal.toFixed(2)}
                              </span>
                            </span>
                          ) : (
                            <span
                              className={`mt-1 block text-[11px] ${
                                isSelected ? 'text-white' : 'text-[#8a5a33]'
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

                <div className="my-4 border-t border-[#ead2b8]" />

                {/* Ice + Sugar */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs font-black text-[#6b3b1d]">
                      Ice Level
                    </label>

                    <div className="flex flex-col gap-1.5">
                      {product.ice_levels?.map((ice) => (
                        <button
                          key={ice.id}
                          onClick={() => {
                            setSelectedIce(ice.name)
                            if (!ice.requires_input) setIceNote('')
                          }}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            selectedIce === ice.name
                              ? selectedStyle
                              : normalStyle
                          }`}
                        >
                          {ice.name}
                        </button>
                      ))}
                    </div>

                    {selectedIceObj?.requires_input && (
                      <input
                        type="text"
                        value={iceNote}
                        onChange={(e) => setIceNote(e.target.value)}
                        placeholder="Specify ice amount"
                        className="mt-2 w-full rounded-xl border border-[#d7ad83] bg-white px-3 py-2 text-xs font-bold text-[#4b2a18] outline-none focus:border-[#c47a2c] focus:ring-2 focus:ring-[#c47a2c]/15"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black text-[#6b3b1d]">
                      Sugar Level
                    </label>

                    <div className="flex flex-col gap-1.5">
                      {product.sugar_levels?.map((sugar) => (
                        <button
                          key={sugar.id}
                          onClick={() => {
                            setSelectedSugar(sugar.name)
                            if (!sugar.requires_input) setSugarNote('')
                          }}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            selectedSugar === sugar.name
                              ? selectedStyle
                              : normalStyle
                          }`}
                        >
                          {sugar.name}
                        </button>
                      ))}
                    </div>

                    {selectedSugarObj?.requires_input && (
                      <input
                        type="text"
                        value={sugarNote}
                        onChange={(e) => setSugarNote(e.target.value)}
                        placeholder="Specify sugar amount"
                        className="mt-2 w-full rounded-xl border border-[#d7ad83] bg-white px-3 py-2 text-xs font-bold text-[#4b2a18] outline-none focus:border-[#c47a2c] focus:ring-2 focus:ring-[#c47a2c]/15"
                      />
                    )}
                  </div>
                </div>

                {/* Addons */}
                {product.addons?.length > 0 && (
                  <>
                    <div className="my-4 border-t border-[#ead2b8]" />

                    <div>
                      <label className="mb-2 block text-sm font-black text-[#6b3b1d]">
                        Add-ons
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedAddOn('')}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            selectedAddOn === ''
                              ? selectedStyle
                              : normalStyle
                          }`}
                        >
                          No Add On
                        </button>

                        {product.addons.map((addon) => {
                          const sizePrice = addon.size_prices?.find(
                            (sp) => sp.size_id === size?.id
                          )

                          const addonAmount = sizePrice
                            ? Number(sizePrice.price)
                            : Number(addon.price || 0)

                          return (
                            <button
                              key={addon.id}
                              onClick={() => setSelectedAddOn(addon.name)}
                              className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                                selectedAddOn === addon.name
                                  ? selectedStyle
                                  : normalStyle
                              }`}
                            >
                              {addon.name} +${addonAmount.toFixed(2)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quantity */}
              <div className="mt-5 rounded-3xl border border-[#ead2b8] bg-white p-4">
                <label className="mb-3 block text-sm font-black text-[#6b3b1d]">
                  Quantity
                </label>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={decrementQty}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1c1a0] bg-[#fffaf3] text-[#6b3b1d] transition hover:border-[#c47a2c] hover:bg-[#fff4e6]"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="h-11 w-24 rounded-2xl border border-[#d7ad83] bg-white text-center text-lg font-black text-[#4b2a18] outline-none transition focus:border-[#c47a2c] focus:ring-2 focus:ring-[#c47a2c]/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />

                  <button
                    onClick={incrementQty}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c47a2c] bg-[#fff4e6] text-[#6b3b1d] transition hover:border-[#a86425] hover:bg-[#fffaf3]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {isBuyGet && freeItems > 0 && (
                  <div className="mt-4 rounded-2xl border border-red-500 bg-red-50 px-3 py-3">
                    <p className="flex items-center justify-center gap-2 text-xs font-black text-red-600">
                      <Gift className="h-4 w-4" />
                      {promotionMessage} — {freeItems} free item
                      {freeItems !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#ead2b8] bg-[#fff4e6] p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#6b3b1d]">
                      Unit Price
                    </span>

                    {resolvedPromotion && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-600 bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                        <Gift className="h-2.5 w-2.5" />
                        Promotion: {promotionLabel}
                      </span>
                    )}
                  </div>

                  {isBuyGet && (
                    <p className="mt-1 text-[11px] font-bold text-red-600">
                      {promotionMessage}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  {hasDiscount && (
                    <span className="mr-2 text-sm font-bold text-red-500 line-through">
                      ${originalUnitPrice.toFixed(2)}
                    </span>
                  )}

                  <span className="text-lg font-black text-[#8a5a33]">
                    ${finalUnitPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {isBuyGet && freeItems > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-red-500 bg-red-50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 font-black text-red-600">
                    <Gift className="h-4 w-4" />
                    Promotion
                  </span>

                  <span className="font-black text-[#4b2a18]">
                    {paidItems} paid + {freeItems} free
                  </span>
                </div>
              )}

              <div className="mb-4 flex items-center justify-between border-t border-[#d7ad83] pt-3">
                <span className="text-lg font-black text-[#4b2a18]">
                  Total Amount
                </span>

                <span className="text-2xl font-black text-[#8a5a33]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#c47a2c] bg-[#c47a2c] py-3.5 text-sm font-black text-white transition-all duration-300 hover:border-[#a86425] hover:bg-[#a86425] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Add to Order ({quantity} item{quantity !== 1 ? 's' : ''})
                {freeItems > 0 && ` + ${freeItems} free`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}