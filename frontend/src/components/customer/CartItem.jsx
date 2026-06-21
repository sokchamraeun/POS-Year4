import { useState } from 'react'
import { useCart } from '../../context/CartContext.jsx'
import { calcFinalPrice, getPromotionShort, resolvePromotionForSize } from '../../utils/promotion.js'
import ProductModal from './ProductModal.jsx'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

function getImageUrl(image) {
  if (!image) return ''
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function CartItem({ item }) {
  const { updateQty, removeItem, updateItem } = useCart()
  const [editing, setEditing] = useState(false)

  // Edit-modal selections
  const [editSize, setEditSize] = useState('')
  const [editSugar, setEditSugar] = useState('')
  const [editIce, setEditIce] = useState('')
  const [editSugarNote, setEditSugarNote] = useState('')
  const [editIceNote, setEditIceNote] = useState('')
  const [editAddOn, setEditAddOn] = useState('')
  const [editQty, setEditQty] = useState(1)

  const promo = item.promotion
  const hasPromotion = !!promo
  const isValuePromo = hasPromotion && !['combo', 'combo_discount'].includes(promo.type)
  const finalUnit = isValuePromo ? calcFinalPrice(item.unitPrice, promo, 1) : item.unitPrice
  const hasDiscount = finalUnit < item.unitPrice
  const imageUrl = getImageUrl(item.image)

  const hasOptions =
    item.sizes?.length > 0 ||
    item.sugar_levels?.length > 0 ||
    item.ice_levels?.length > 0 ||
    item.addons?.length > 0

  function openEdit() {
    setEditSize(item.size || item.sizes?.[0]?.name || '')
    setEditSugar(item.sugar || item.sugar_levels?.[0]?.name || '')
    setEditIce(item.ice || item.ice_levels?.[0]?.name || '')
    setEditSugarNote(item.sugarNote || '')
    setEditIceNote(item.iceNote || '')
    setEditAddOn(item.addOn || '')
    setEditQty(item.qty || 1)
    setEditing(true)
  }

  // Pricing for the edit modal (mirrors BestSellers/ProductModal pricing)
  const editBasePrice = (sizeName) => {
    const s = item.sizes?.find((x) => x.name === sizeName)
    return s ? Number(s.pivot?.price ?? 0) : 0
  }
  const editAddOnPrice = (addOnName) => {
    if (!addOnName) return 0
    const addon = item.addons?.find((a) => a.name === addOnName)
    if (!addon) return 0
    const size = item.sizes?.find((s) => s.name === editSize)
    const sp = addon.size_prices?.find((x) => x.size_id === size?.id)
    return sp ? Number(sp.price) : Number(addon.price) || 0
  }

  const editSizeObj = item.sizes?.find((s) => s.name === editSize)
  const editPromotion = item.promotion
    ? resolvePromotionForSize(item.promotion, editSizeObj?.id)
    : item.promotion
  const editPrice = editBasePrice(editSize) + editAddOnPrice(editAddOn)
  const editFinalPrice =
    editPromotion?.type === 'buy_x_get_y'
      ? editPrice
      : calcFinalPrice(editPrice, editPromotion)
  const editHasDiscount = editPromotion
    ? editFinalPrice < editPrice || editPromotion.type === 'buy_x_get_y'
    : false

  const editIceObj = item.ice_levels?.find((i) => i.name === editIce)
  const editSugarObj = item.sugar_levels?.find((s) => s.name === editSugar)

  function handleSaveEdit() {
    updateItem(item.key, {
      size: editSize,
      sugar: editSugar,
      ice: editIce,
      sugarNote: editSugarObj?.requires_input ? editSugarNote.trim() : '',
      iceNote: editIceObj?.requires_input ? editIceNote.trim() : '',
      addOn: editAddOn,
      unitPrice: editPrice,
      promotion: editPromotion,
      qty: editQty,
    })
    setEditing(false)
  }

  return (
    <div className="relative flex gap-3 rounded-2xl border border-orange-100 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f1e7db]">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">☕</div>
        )}

        {/* Diagonal promotion ribbon */}
        {hasPromotion && (
          <span className="absolute -left-9 top-2.5 w-28 -rotate-45 bg-gradient-to-r from-red-600 to-rose-500 py-1 text-center text-[7px] font-extrabold uppercase leading-none tracking-wide text-white shadow-sm">
            {getPromotionShort(promo)}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Name + actions */}
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-black text-[#3d2817]">{item.name}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {hasOptions && (
              <button
                onClick={openEdit}
                className="text-[#8a715c] transition-colors hover:text-amber-600"
                aria-label="Edit options"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => removeItem(item.key)}
              className="text-[#c9b29a] transition-colors hover:text-red-500"
              aria-label="Remove item"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Option pills */}
        <div className="mt-1 flex flex-wrap gap-1">
          {item.size && <span className="rounded-md bg-[#f8f4ee] px-1.5 py-0.5 text-[10px] font-semibold text-[#8a715c]">{item.size}</span>}
          {item.sugar && <span className="rounded-md bg-[#f8f4ee] px-1.5 py-0.5 text-[10px] font-semibold text-[#8a715c]">{item.sugarNote || item.sugar}</span>}
          {item.ice && <span className="rounded-md bg-[#f8f4ee] px-1.5 py-0.5 text-[10px] font-semibold text-[#8a715c]">{item.iceNote || item.ice}</span>}
          {item.addOn && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">+{item.addOn}</span>}
        </div>

        {/* Price + quantity */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount ? (
              <>
                <span className="text-[11px] text-[#c9b29a] line-through">${item.unitPrice.toFixed(2)}</span>
                <span className="text-sm font-black text-orange-600">${finalUnit.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-black text-[#3d2817]">${item.unitPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-orange-100 bg-[#f8f4ee] p-0.5">
            <button
              onClick={() => updateQty(item.key, item.qty - 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#8a715c] transition-colors hover:bg-white hover:text-[#3d2817] active:scale-95"
              aria-label="Decrease quantity"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-5 text-center text-sm font-black text-[#3d2817]">{item.qty}</span>
            <button
              onClick={() => updateQty(item.key, item.qty + 1)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3d2817] text-white transition-colors hover:bg-[#2a1b10] active:scale-95"
              aria-label="Increase quantity"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <ProductModal
          product={item}
          show={editing}
          onClose={() => setEditing(false)}
          selectedSize={editSize}
          selectedSugar={editSugar}
          selectedIce={editIce}
          selectedAddOn={editAddOn}
          sugarNote={editSugarNote}
          iceNote={editIceNote}
          qty={editQty}
          price={editPrice}
          finalPrice={editFinalPrice}
          hasDiscount={editHasDiscount}
          stockMsg=""
          onSizeChange={setEditSize}
          onSugarChange={setEditSugar}
          onIceChange={setEditIce}
          onAddOnChange={setEditAddOn}
          onSugarNoteChange={setEditSugarNote}
          onIceNoteChange={setEditIceNote}
          onQtyChange={setEditQty}
          onAddToCart={handleSaveEdit}
          submitLabel="Update Item"
        />
      )}
    </div>
  )
}
