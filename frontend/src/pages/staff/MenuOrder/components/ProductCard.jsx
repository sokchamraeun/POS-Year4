import { calcFinalPrice } from '../../../../utils/promotion.js'

const API_URL = import.meta.env.VITE_API_URL

export default function ProductCard({ product, opt, onSetOpt, onAddToCart }) {
  const size = product.sizes?.find((s) => s.name === opt.size)
  const basePrice = size ? Number(size.pivot?.price ?? 0) : 0
  let addonPrice = 0
  if (opt.addOn) {
    const a = product.addons?.find((a) => a.name === opt.addOn)
    if (a) {
      const sp = a.size_prices?.find((sp) => sp.size_id === size?.id)
      addonPrice = sp ? Number(sp.price) : (Number(a.price) || 0)
    }
  }
  const price = basePrice + addonPrice
  const finalPrice = calcFinalPrice(price, product.promotion)
  const hasDiscount = finalPrice < price

  return (
    <div className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col bg-cover bg-center border border-blue-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=60')" }}>
      <div className="bg-white/90 backdrop-blur-sm flex flex-col flex-1">
      <div className="p-3 pb-0 relative">
        {product.promotion && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
              {product.promotion.type === 'percentage' && `${parseFloat(product.promotion.value)}% OFF`}
              {product.promotion.type === 'fixed_amount' && `$${product.promotion.value} OFF`}
              {product.promotion.type === 'buy_x_get_y' && `Buy ${product.promotion.buy_qty} Get ${product.promotion.free_qty}`}
              {product.promotion.type === 'combo' && 'COMBO'}
            </span>
          </div>
        )}
        {product.image ? (
          <img
            src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        ) : (
          <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 md:text-xs text-[10px]">
            No Image
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="md:text-base text-sm font-semibold text-gray-800">{product.name}</h3>
          <div className="text-right">
            {hasDiscount && <span className="md:text-base text-sm line-through text-red-500 mr-1">${price.toFixed(2)}</span>}
            <span className="md:text-base text-sm font-bold text-blue-600">${finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <select
          value={opt.size}
          onChange={(e) => onSetOpt(product.id, 'size', e.target.value)}
          className="w-full md:text-xs text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {product.sizes?.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} (${Number(s.pivot?.price ?? 0).toFixed(2)})
            </option>
          ))}
        </select>

        <div className="flex gap-1.5 mb-1.5 lg:flex-col lg:gap-1">
          <select
            value={opt.ice}
            onChange={(e) => onSetOpt(product.id, 'ice', e.target.value)}
            className="flex-1 md:text-xs text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {product.ice_levels?.map((l) => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
          <select
            value={opt.sugar}
            onChange={(e) => onSetOpt(product.id, 'sugar', e.target.value)}
            className="flex-1 md:text-xs text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {product.sugar_levels?.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <select
          value={opt.addOn}
          onChange={(e) => onSetOpt(product.id, 'addOn', e.target.value)}
          className="w-full md:text-xs text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Add On</option>
          {product.addons?.map((a) => {
            const sp = a.size_prices?.find((sp) => sp.size_id === size?.id)
            const ap = sp ? Number(sp.price) : (Number(a.price) || 0)
            return (
              <option key={a.id} value={a.name}>
                {a.name} (+${ap.toFixed(2)})
              </option>
            )
          })}
        </select>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-auto w-full bg-blue-600 text-white md:text-xs text-[11px] font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add to Order
        </button>
      </div>
      </div>
    </div>
  )
}
