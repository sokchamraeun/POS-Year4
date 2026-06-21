import { calcDiscount, getPromotionLabel } from '../../../../utils/promotion.js'

export default function CartItem({ item, products, onUpdateQty }) {
  const cur = products?.find((p) => p.id === item.id)
  const prom = cur?.promotion
  const hasPromotion = !!prom

  return (
    <div className="flex items-start justify-between gap-2 p-2.5 border border-amber-200 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        {hasPromotion && prom.type !== 'combo_discount' && prom.type !== 'combo' && (
          <p className="text-xs text-green-600 font-medium mt-0.5">{getPromotionLabel(prom)}</p>
        )}
        <p className="text-xs text-gray-400">
          {item.size}, {item.sugarNote || item.sugar}, {item.iceNote || item.ice}
          {item.addOn ? `, +${item.addOn}` : ''}
        </p>
        <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQty(item.key, item.qty - 1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
          >-</button>
          <span className="text-base font-medium text-gray-800 w-6 text-center">{item.qty}</span>
          <button
            onClick={() => onUpdateQty(item.key, item.qty + 1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
          >+</button>
        </div>
        <span className="text-sm font-semibold text-gray-700">${(item.unitPrice * item.qty).toFixed(2)}</span>
      </div>
    </div>
  )
}
