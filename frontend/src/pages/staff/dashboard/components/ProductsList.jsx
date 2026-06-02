// src/pages/staff/dashboard/components/ProductsList.jsx

export default function ProductsList({ products = [] }) {
  const productList = Array.isArray(products) ? products : []

  const activeCount = productList.filter((product) => product.status).length
  const inactiveCount = productList.length - activeCount

  const lowStockCount = productList.filter((product) => {
    const stock = Number(
      product.stock ??
      product.quantity ??
      product.qty ??
      0
    )

    return stock <= 5
  }).length

  return (
    <div className="flex flex-1 flex-col rounded-3xl border-2 border-cyan-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Product Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Stock status and product availability.
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-800 px-5 py-3 text-right text-white shadow-sm">
          <p className="text-xs font-medium text-cyan-100">
            Products
          </p>

          <p className="text-3xl font-bold">
            {productList.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryBox
          label="Active"
          value={activeCount}
          bg="bg-cyan-50"
          border="border-cyan-300"
          text="text-cyan-800"
        />

        <SummaryBox
          label="Inactive"
          value={inactiveCount}
          bg="bg-slate-50"
          border="border-slate-300"
          text="text-slate-700"
        />

        <SummaryBox
          label="Low Stock"
          value={lowStockCount}
          bg="bg-teal-50"
          border="border-teal-300"
          text="text-teal-800"
        />
      </div>
    </div>
  )
}

function SummaryBox({
  label,
  value,
  bg,
  border,
  text,
}) {
  return (
    <div
      className={`
        ${bg}
        ${border}
        rounded-2xl
        border-2
        p-5
        text-center
        transition-all
        duration-300
        hover:shadow-md
        hover:scale-[1.02]
      `}
    >
      <p className={`text-3xl font-bold ${text}`}>
        {value}
      </p>

      <p className={`mt-2 text-sm font-semibold ${text}`}>
        {label}
      </p>
    </div>
  )
}