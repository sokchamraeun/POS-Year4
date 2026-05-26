const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

export default function ProductModal({
  product,
  show,
  onClose,
  selectedSize,
  selectedSugar,
  selectedIce,
  selectedAddOn,
  qty,
  price,
  stockMsg,
  onSizeChange,
  onSugarChange,
  onIceChange,
  onAddOnChange,
  onQtyChange,
  onAddToCart,
}) {
  if (!show) return null

  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : STORAGE_URL + '/' + product.image

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img src={imgSrc} alt={product.name} className="w-full aspect-square object-cover" />
          <span className="absolute top-3 right-3 bg-blue-600/80 text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm">
            ${price.toFixed(2)}
          </span>
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center text-lg hover:bg-black/60">&times;</button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
            <div className="flex items-center bg-gray-100 rounded-xl">
              <button onClick={() => onQtyChange(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center text-base">-</button>
              <input type="number" min="1" value={qty} onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) onQtyChange(Math.max(1, v)) }} className="w-8 text-center text-sm bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              <button onClick={() => onQtyChange(qty + 1)} className="w-8 h-8 flex items-center justify-center text-base">+</button>
            </div>
          </div>
          {product.description && <p className="text-sm text-gray-500 mb-4">{product.description}</p>}

          {product.sizes?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Size</p>
              <div className="flex gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSizeChange(s.name)}
                    className={`flex-1 rounded-lg py-2 text-sm transition ${selectedSize === s.name ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(product.ice_levels?.length > 0 || product.sugar_levels?.length > 0) && (
            <div className={`grid gap-3 mb-3 ${product.ice_levels?.length > 0 && product.sugar_levels?.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {product.ice_levels?.length > 0 && (
                <select value={selectedIce} onChange={(e) => onIceChange(e.target.value)} className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  {product.ice_levels.map((i) => <option key={i.id} value={i.name}>{i.name}</option>)}
                </select>
              )}
              {product.sugar_levels?.length > 0 && (
                <select value={selectedSugar} onChange={(e) => onSugarChange(e.target.value)} className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  {product.sugar_levels.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              )}
            </div>
          )}

          {product.addons?.length > 0 && (
            <div className="mb-3">
              <select value={selectedAddOn} onChange={(e) => onAddOnChange(e.target.value)} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <option value="">No Add-on</option>
                {product.addons.map((a) => <option key={a.id} value={a.name}>{a.name} (+${Number(a.price).toFixed(2)})</option>)}
              </select>
            </div>
          )}

          {stockMsg && <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2 mb-3">{stockMsg}</div>}

          <button
            onClick={onAddToCart}
            className="w-full mt-3 rounded-xl py-3 text-sm font-bold text-white bg-blue-600 active:scale-95 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
