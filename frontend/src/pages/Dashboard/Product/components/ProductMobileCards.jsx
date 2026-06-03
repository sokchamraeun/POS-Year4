import { categoryColors } from '../constants/productConstants.js'

export default function ProductMobileCards({ products, onView, onEdit, onDelete, noProducts }) {
  return (
    <div className="lg:hidden p-6 grid gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              {product.image ? (
                <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-16 h-16 rounded-xl object-contain shadow-sm ring-1 ring-slate-200 bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">N/A</div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-base">{product.name}</div>
              <div className="text-xs text-slate-400 font-medium mb-2">#{product.id}</div>
              <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[product.category?.name] ?? categoryColors.Default}`}>
                {product.category?.name ?? '-'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sizes</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <span key={size.id} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                    {size.name} <span className="text-teal-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                  </span>
                ))}
              </div>
            </div>

            {product.addons?.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Addons</div>
                <div className="flex flex-wrap gap-2">
                  {product.addons.map((addon) => (
                    <span key={addon.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg">{addon.name}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {product.sugar_levels?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sugar</div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sugar_levels.map((level) => (
                      <span key={level.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{level.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.ice_levels?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ice</div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ice_levels.map((level) => (
                      <span key={level.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{level.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.status ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-teal-500' : 'bg-slate-400'}`}></div>
              {product.status ? 'Active' : 'Inactive'}
            </span>
            <div className="flex gap-2">
              <button onClick={() => onView(product)} className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all border border-teal-200">View</button>
              <button onClick={() => onEdit(product)} className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all border border-amber-200">Edit</button>
              <button onClick={() => onDelete(product)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200">Delete</button>
            </div>
          </div>
        </div>
      ))}
      {noProducts && (
        <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-900 font-bold text-lg">No products found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  )
}
