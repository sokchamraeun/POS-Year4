import { useCart } from '../../context/CartContext.jsx'
import { calcFinalPrice, getPromotionShort } from '../../utils/promotion.js'

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart()
  const promo = item.promotion
  const hasPromotion = !!promo
  const isValuePromo = hasPromotion && !['combo', 'combo_discount'].includes(promo.type)
  const finalUnit = isValuePromo ? calcFinalPrice(item.unitPrice, promo, 1) : item.unitPrice
  const hasDiscount = finalUnit < item.unitPrice

  return (
    <div className="relative overflow-hidden border border-gray-200 rounded-xl p-3 bg-white">
      {/* Diagonal promotion ribbon */}
      {hasPromotion && (
        <span className="absolute -left-9 top-3 w-28 -rotate-45 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[7px] font-extrabold leading-none uppercase tracking-wide text-center py-1 z-10 pointer-events-none">
          {getPromotionShort(promo)}
        </span>
      )}

      {/* Name + remove */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold text-gray-800 ${hasPromotion ? 'pl-6' : ''}`}>{item.name}</p>
        <button
          onClick={() => removeItem(item.key)}
          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
          aria-label="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Option pills */}
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {item.size && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.size}</span>}
        {item.sugar && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.sugar}</span>}
        {item.ice && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.ice}</span>}
        {item.addOn && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">+{item.addOn}</span>}
      </div>

      {/* Price + quantity */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          {hasDiscount ? (
            <>
              <span className="text-[11px] text-gray-400 line-through">${item.unitPrice.toFixed(2)}</span>
              <span className="text-sm font-bold text-blue-600 ml-1">${finalUnit.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-800">${item.unitPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => updateQty(item.key, item.qty - 1)}
              className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-white rounded-md transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-800">{item.qty}</span>
            <button
              onClick={() => updateQty(item.key, item.qty + 1)}
              className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-white rounded-md transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Line total */}
      <div className="flex items-center justify-end mt-1.5">
        <span className="text-xs font-bold text-gray-800">${(finalUnit * item.qty).toFixed(2)}</span>
      </div>
    </div>
  )
}
