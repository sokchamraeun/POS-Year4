// src/pages/staff/dashboard/components/TopProducts.jsx

export default function TopProducts({ topProducts = [] }) {
  const total = topProducts.reduce((sum, product) => {
    return sum + Number(product.qty ?? 0)
  }, 0)

  if (topProducts.length === 0) {
    return (
      <div className="flex flex-1 flex-col rounded-3xl border-2 border-cyan-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Best selling items will show here.
          </p>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/30 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-200 bg-white shadow-sm">
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
    <div className="flex flex-1 flex-col rounded-3xl border-2 border-cyan-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Best selling items today.
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-800 px-4 py-3 text-right text-white shadow-sm">
          <p className="text-xs font-medium text-cyan-100">Total Sold</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="space-y-3">
        {topProducts.map((product, index) => {
          const qty = Number(product.qty ?? 0)
          const percent = total > 0 ? Math.round((qty / total) * 100) : 0

          return (
            <div
              key={product.id ?? product.name ?? index}
              className="group rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-cyan-400 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-800 text-sm font-bold text-white shadow-sm">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">
                      {product.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {percent}% of total sales
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900">{qty}</p>
                  <p className="text-xs font-medium text-slate-500">sold</p>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-cyan-50">
                <div
                  className="h-full rounded-full bg-cyan-800 transition-all duration-700"
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