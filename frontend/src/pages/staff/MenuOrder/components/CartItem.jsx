export default function CartItem({ item, onUpdateQty }) {
  return (
    <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
        <p className="text-xs text-gray-400">
          {item.size}, {item.sugar}, {item.ice}
          {item.addOn ? `, +${item.addOn}` : ''}
        </p>
        <p className="text-xs text-gray-500">${item.unitPrice.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQty(item.key, item.qty - 1)}
            className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
          >-</button>
          <span className="text-sm font-medium text-gray-800 w-5 text-center">{item.qty}</span>
          <button
            onClick={() => onUpdateQty(item.key, item.qty + 1)}
            className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
          >+</button>
        </div>
        <span className="text-xs font-semibold text-gray-700">${(item.unitPrice * item.qty).toFixed(2)}</span>
      </div>
    </div>
  )
}
