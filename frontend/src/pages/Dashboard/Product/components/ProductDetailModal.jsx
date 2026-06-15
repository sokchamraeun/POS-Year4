import { categoryColors } from '../constants/productConstants.js'

export default function ProductDetailModal({ product, onClose, onEdit }) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 px-8 py-5 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-white text-xl font-bold tracking-tight">Product Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              {product.image ? (
                <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-28 h-28 rounded-2xl object-contain shadow-lg ring-1 ring-slate-200 bg-white" />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-orange-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 font-medium">N/A</div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{product.name}</h3>
              <p className="text-sm text-slate-400 font-mono mt-1 font-medium">#{product.id}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[product.category?.name] ?? categoryColors.Default}`}>
                  {product.category?.name ?? '-'}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.status ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-orange-50 text-slate-600 border-slate-200'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  {product.status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {product.description && product.description.trim() !== '' ? (
            <div className="bg-gradient-to-r from-amber-50 to-emerald-50 rounded-xl p-5 border border-amber-200">
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </div>
              <p className="text-slate-700 leading-relaxed font-medium text-sm">{product.description}</p>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-xl p-5 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Description
              </div>
              <p className="text-slate-400 italic text-sm">No description available for this product.</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Sizes & Pricing</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {product.sizes?.length ? product.sizes.map((size) => (
                <div key={size.id} className="bg-orange-50 rounded-xl p-3 text-center border border-slate-200 hover:border-amber-300 hover:bg-teal-50/30 transition-all">
                  <div className="font-semibold text-slate-800 text-sm">{size.name}</div>
                  <div className="text-amber-600 font-bold text-lg mt-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</div>
                </div>
              )) : <p className="text-slate-400 col-span-full text-center py-2 font-medium text-sm">No sizes available</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {product.addons?.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2.5">Addons</div>
                <div className="flex flex-wrap gap-2">
                  {product.addons.map((addon) => (
                    <span key={addon.id} className="bg-white text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{addon.name}</span>
                  ))}
                </div>
              </div>
            )}
            {product.sugar_levels?.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2.5">Sugar Levels</div>
                <div className="flex flex-wrap gap-2">
                  {product.sugar_levels.map((level) => (
                    <span key={level.id} className="bg-white text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                  ))}
                </div>
              </div>
            )}
            {product.ice_levels?.length > 0 && (
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2.5">Ice Levels</div>
                <div className="flex flex-wrap gap-2">
                  {product.ice_levels.map((level) => (
                    <span key={level.id} className="bg-white text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-orange-50 border-t border-slate-200 px-8 py-5 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-all duration-200 shadow-sm">Close</button>
          <button onClick={() => { const p = product; onClose(); onEdit(p) }} className="w-full sm:w-auto bg-gradient-to-r from-amber-900 to-amber-800 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-300">Edit Product</button>
        </div>
      </div>
    </div>
  )
}
