import { categoryColors } from '../constants/productConstants.js'

export default function ProductTable({ products, onView, onEdit, onDelete, onToggleFeatured, noProducts }) {
  return (
    <div className="overflow-x-auto hidden lg:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Sizes</th>
            <th className="px-6 py-4">Addons</th>
            <th className="px-6 py-4">Sugar</th>
            <th className="px-6 py-4">Ice</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Top Seller</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="group border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {product.image ? (
                      <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-12 h-12 rounded-xl object-contain shadow-sm ring-1 ring-slate-200 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0 bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 text-xs shadow-sm font-medium">N/A</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{product.name}</div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">#{product.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[product.category?.name] ?? categoryColors.Default}`}>
                  {product.category?.name ?? '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <span key={size.id} className="inline-flex items-center gap-1 bg-white text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm font-medium">
                      <span>{size.name}</span>
                      <span className="text-teal-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                    </span>
                  ))}
                  {(!product.sizes || product.sizes.length === 0) && <span className="text-slate-300 font-medium">—</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {product.addons?.map((addon) => (
                    <span key={addon.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-1 rounded-lg font-semibold">{addon.name}</span>
                  ))}
                  {(!product.addons || product.addons.length === 0) && <span className="text-slate-300 font-medium">—</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {product.sugar_levels?.map((level) => (
                    <span key={level.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-1 rounded-lg font-semibold">{level.name}</span>
                  ))}
                  {(!product.sugar_levels || product.sugar_levels.length === 0) && <span className="text-slate-300 font-medium">—</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {product.ice_levels?.map((level) => (
                    <span key={level.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-1 rounded-lg font-semibold">{level.name}</span>
                  ))}
                  {(!product.ice_levels || product.ice_levels.length === 0) && <span className="text-slate-300 font-medium">—</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.status ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`}></div>
                  {product.status ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                  onClick={() => onToggleFeatured(product)}
                  title={product.is_featured ? 'Remove from best sellers' : 'Mark as best seller'}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 ${product.is_featured ? 'bg-teal-50 border-teal-300 text-teal-500' : 'bg-white border-slate-200 text-slate-300 hover:text-teal-400 hover:border-teal-200'}`}
                >
                  <svg className="w-5 h-5" fill={product.is_featured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onView(product)} className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all duration-200 border border-teal-200">View</button>
                  <button onClick={() => onEdit(product)} className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all duration-200 border border-teal-200">Edit</button>
                  <button onClick={() => onDelete(product)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200">Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {noProducts && (
            <tr>
              <td colSpan={9} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-slate-500 font-medium">No products found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your search</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
