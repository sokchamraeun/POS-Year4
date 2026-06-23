// src/pages/staff/dashboard/components/ProductManagement.jsx
import { useState } from 'react'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

export default function ProductManagement({ products = [] }) {
  const productList = Array.isArray(products) ? products : []
  const [modalFilter, setModalFilter] = useState(null)

  const activeProducts = productList.filter((product) => product.status)
  const inactiveProducts = productList.filter((product) => !product.status)
  const lowStockProducts = productList.filter((product) => {
    const stock = Number(
      product.stock ??
      product.quantity ??
      product.qty ??
      0
    )
    return stock <= 5
  })

  const activeCount = activeProducts.length
  const inactiveCount = inactiveProducts.length
  const lowStockCount = lowStockProducts.length

  let modalTitle = ''
  let modalProducts = []
  if (modalFilter === 'active') {
    modalTitle = 'Active Products'
    modalProducts = activeProducts
  } else if (modalFilter === 'inactive') {
    modalTitle = 'Inactive Products'
    modalProducts = inactiveProducts
  } else if (modalFilter === 'lowStock') {
    modalTitle = 'Low Stock Products'
    modalProducts = lowStockProducts
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Product Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Stock status and product availability.
            </p>
          </div>

          <div className="rounded-2xl bg-teal-700 px-5 py-3 text-right text-white shadow-sm">
            <p className="text-xs font-medium text-teal-100">
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
            bg="bg-teal-50"
            border="border-teal-300"
            text="text-teal-800"
            onClick={() => setModalFilter('active')}
          />

          <SummaryBox
            label="Inactive"
            value={inactiveCount}
            bg="bg-slate-50"
            border="border-slate-300"
            text="text-slate-700"
            onClick={() => setModalFilter('inactive')}
          />

          <SummaryBox
            label="Low Stock"
            value={lowStockCount}
            bg="bg-red-50"
            border="border-red-300"
            text="text-red-700"
            animate={lowStockCount > 0}
            onClick={() => setModalFilter('lowStock')}
          />
        </div>
      </div>

      {modalFilter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setModalFilter(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{modalTitle}</h3>
                <p className="text-sm text-slate-500">{modalProducts.length} product{modalProducts.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setModalFilter(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {modalProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-slate-400">No products found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modalProducts.map((product, index) => {
                    const stock = Number(
                      product.stock ?? product.quantity ?? product.qty ?? 0
                    )
                    return (
                      <div
                        key={product.id ?? product.name ?? index}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-teal-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image.startsWith('http') ? product.image : STORAGE_URL + '/' + product.image}
                              alt={product.name}
                              className="h-10 w-10 shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-slate-200 bg-white"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-700">
                              {index + 1}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-400">Stock: {stock}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.status
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setModalFilter(null)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SummaryBox({
  label,
  value,
  bg,
  border,
  text,
  onClick,
  animate,
}) {
  return (
    <div
      onClick={onClick}
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
        cursor-pointer
        ${animate ? 'animate-pulse' : ''}
      `}
    >
      <p className={`text-3xl font-bold ${text}`}>
        {value}
      </p>

      <p className={`mt-2 text-sm font-semibold ${text} inline-flex items-center justify-center gap-1.5`}>
        {animate && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        )}
        {label}
      </p>
    </div>
  )
}
