// src/pages/staff/dashboard/components/TopProducts.jsx

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

export default function TopProducts({ topProducts = [] }) {
  const total = topProducts.reduce((sum, product) => {
    return sum + Number(product.qty ?? 0)
  }, 0)

  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Best selling items will show here.
          </p>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/30 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <span className="text-xl">☕</span>
          </div>

          <p className="font-semibold text-slate-700">No product data yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Make sales to see your top products.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Best selling items today.
          </p>
        </div>

        <div className="rounded-2xl bg-teal-700 px-4 py-3 text-right text-white shadow-sm">
          <p className="text-xs font-medium text-teal-100">Total Sold</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {topProducts.slice(0, 10).map((product, index) => {
          const qty = Number(product.qty ?? 0)
          const percent = total > 0 ? Math.round((qty / total) * 100) : 0

          const imgSrc = product.image?.startsWith('http')
            ? product.image
            : STORAGE_URL + '/' + (product.image ?? '')

          return (
            <div
              key={product.id ?? product.name ?? index}
              className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:border-teal-500 hover:shadow-md"
            >
              <div className="relative mb-2">
                {product.image ? (
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="h-14 w-14 rounded-xl object-contain shadow-sm ring-1 ring-slate-200 bg-white"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700 ring-1 ring-slate-200">
                    {index + 1}
                  </div>
                )}
                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white shadow-sm">
                  {index + 1}
                </div>
              </div>

              <p className="w-full truncate text-center text-sm font-semibold text-slate-800 mb-1">
                {product.name}
              </p>

              <p className="text-xs text-slate-500 mb-2">
                {percent}% of total sales
              </p>

              <p className="text-lg font-bold text-slate-900">{qty}</p>
              <p className="text-xs font-medium text-slate-500 mb-2">sold</p>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}