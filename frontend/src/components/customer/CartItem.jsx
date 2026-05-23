import { useCart } from '../../context/CartContext.jsx'

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex items-start justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
          {item.image ? (
            <img
              src={`${item.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.size}{item.sugar ? `, ${item.sugar}` : ''}{item.ice ? `, ${item.ice}` : ''}
            {item.addOn ? `, +${item.addOn}` : ''}
          </p>
          <p className="text-xs text-gray-500 mt-1">${item.unitPrice.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <button
          onClick={() => removeItem(item.key)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQty(item.key, item.qty - 1)}
            className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 w-6 text-center">{item.qty}</span>
          <button
            onClick={() => updateQty(item.key, item.qty + 1)}
            className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <span className="text-xs font-bold text-gray-800">${(item.unitPrice * item.qty).toFixed(2)}</span>
      </div>
    </div>
  )
}
