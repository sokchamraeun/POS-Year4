import { useState, useEffect, useCallback } from 'react'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

function getHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    Accept: 'application/json',
  }
}

const periods = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
]

function getDateRange(period) {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'daily':
      start.setDate(start.getDate() - 1)
      break
    case 'weekly':
      start.setDate(start.getDate() - 7)
      break
    case 'monthly':
      start.setMonth(start.getMonth() - 1)
      break
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1)
      break
    default:
      break
  }

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  }
}

function currency(n) {
  return '$' + Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString()
}

function getCurrentUserName() {
  try {
    const raw = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : null
    return user?.name || user?.username || user?.email || 'Unknown User'
  } catch {
    return 'Unknown User'
  }
}

export default function PrinterReport() {
  const [period, setPeriod] = useState('daily')
  const [dates, setDates] = useState(getDateRange('daily'))
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saleUser, setSaleUser] = useState('all')
  const [saleUsers, setSaleUsers] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/reports/sale-users`, {
      headers: getHeaders(),
    })
      .then(res => res.ok ? res.json() : [])
      .then(setSaleUsers)
      .catch(() => {})
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const params = {
      from: dates.from,
      to: dates.to,
    }
    if (saleUser !== 'all') params.sale_user = saleUser

    const qs = new URLSearchParams(params).toString()

    const endpoints = [
      'sales',
      'products',
      'inventory',
      'purchases',
      'profit',
      'customers',
      'payments',
      'staff',
    ]

    try {
      const results = await Promise.all(
        endpoints.map(async key => {
          const res = await fetch(`${API_URL}/reports/${key}?${qs}`, {
            headers: getHeaders(),
          })

          return {
            key,
            data: res.ok ? await res.json() : { error: 'Failed' },
          }
        })
      )

      const obj = {}
      results.forEach(r => {
        obj[r.key] = r.data
      })

      setData(obj)
    } catch {
      setData({})
    } finally {
      setLoading(false)
    }
  }, [dates, saleUser])

  function changePeriod(p) {
    setPeriod(p)
    setDates(getDateRange(p))
  }

  function handlePrint() {
    window.print()
  }

  const {
    sales,
    products,
    inventory,
    purchases,
    profit,
    customers,
    payments,
    staff,
  } = data

  return (
    <div className="space-y-6">
      <div className="no-print rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Printer Report</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose report period and print full POS report.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5">
              {periods.map(p => (
                <button
                  key={p.key}
                  onClick={() => changePeriod(p.key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    period === p.key
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <select
              value={saleUser}
              onChange={e => setSaleUser(e.target.value)}
              className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-all hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            >
              <option value="all">All Sale Users</option>

              {saleUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader page={false} text="Loading report..." />
      ) : (
        <div id="print-area" className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm print:rounded-2xl print:shadow-none">
            <div className="h-2 bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-500" />

            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-800 text-2xl text-white">
                  ☕
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-gray-950">
                    The Birdnest Cafe
                  </h1>
                  <p className="text-base font-bold text-gray-800">
                    POS Cafe Report
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {dates.from} — {dates.to} ({period})
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-left sm:text-right">
                <p className="text-xs text-gray-500">
                  Generated: {new Date().toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-700">
                  Sale by: {saleUser === 'all' ? 'All Users' : (saleUsers.find(u => u.id === Number(saleUser))?.name || 'Selected User')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Generated by: {getCurrentUserName()}
                </p>
              </div>
            </div>
          </div>

          <Section title={`Sales Overview${saleUser !== 'all' ? ` — ${saleUsers.find(u => u.id === Number(saleUser))?.name || 'Selected'}` : ''}`}>
            <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <SummaryCard label="Total Sales" value={currency(sales?.total_sales)} />
              <SummaryCard label="Orders" value={sales?.total_orders ?? 0} />
              <SummaryCard label="Avg Order" value={currency(sales?.avg_order_value)} />
              <SummaryCard label="Paid Orders" value={sales?.paid_orders ?? 0} />
            </div>

            {sales?.daily?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.daily.map(d => (
                      <tr key={d.date} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-gray-700">{d.date}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{d.orders}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {currency(d.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No sales data.</EmptyText>
            )}
          </Section>

          {staff?.staff?.length > 0 && (
            <Section title="Sales by Staff">
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Staff</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                      <th className="px-4 py-3 text-right">Refunds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.staff.map(s => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{s.orders_count}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{currency(s.revenue)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{currency(s.total_discount)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{s.refund_orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            </Section>
          )}

          <Section title="Product Sales">
            {products?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {p.product?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {p.size?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {p.total_qty}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {currency(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No product sales data.</EmptyText>
            )}
          </Section>

          <Section title="Inventory Status">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Total Ingredients"
                value={inventory?.total_ingredients ?? 0}
              />
              <SummaryCard
                label="Low Stock"
                value={inventory?.low_stock_count ?? 0}
                valueClass="text-red-600"
              />
              <SummaryCard
                label="In Stock"
                value={
                  (inventory?.total_ingredients ?? 0) -
                  (inventory?.low_stock_count ?? 0)
                }
                valueClass="text-green-700"
              />
            </div>

            {inventory?.low_stock?.length > 0 && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="mb-2 text-sm font-bold text-red-800">
                  Low Stock Alerts
                </p>

                <div className="grid gap-2">
                  {inventory.low_stock.map(ing => (
                    <div
                      key={ing.id}
                      className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-medium text-red-700"
                    >
                      {ing.name} — {Number(ing.stock_quantity).toFixed(2)} {ing.unit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inventory?.ingredients?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Ingredient</th>
                      <th className="px-4 py-3 text-right">Stock</th>
                      <th className="px-4 py-3 text-right">Reorder</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventory.ingredients.map(ing => (
                      <tr key={ing.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {ing.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {Number(ing.stock_quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {Number(ing.reorder_level).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{ing.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No inventory data.</EmptyText>
            )}
          </Section>

          <Section title="Purchase History">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryCard
                label="Total Purchases"
                value={purchases?.summary?.total_transactions ?? 0}
              />
              <SummaryCard
                label="Total Quantity"
                value={Number(purchases?.summary?.total_quantity || 0).toFixed(2)}
              />
            </div>

            {purchases?.transactions?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Ingredient</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {purchases.transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {tx.ingredient?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-700">
                          +{Number(tx.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No purchase data.</EmptyText>
            )}
          </Section>

          <Section title="Profit Overview">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                label="Revenue"
                value={currency(profit?.revenue)}
                valueClass="text-green-700"
              />
              <SummaryCard label="Cost of Ingredients" value="N/A" valueClass="text-gray-400" />
              <SummaryCard label="Net Profit" value="N/A" valueClass="text-gray-400" />
            </div>

            {profit?.monthly?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>

                  <tbody>
                    {profit.monthly.map(m => (
                      <tr key={m.month} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{m.month}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {currency(m.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No profit data.</EmptyText>
            )}
          </Section>

          <Section title="Customer Summary">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryCard
                label="Total Customers"
                value={customers?.total_customers ?? 0}
              />
              <SummaryCard
                label="New Customers"
                value={customers?.new_customers ?? 0}
              />
            </div>

            {customers?.customers?.length > 0 ? (
              <TableBox>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-800 text-left text-white">
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                      <th className="px-4 py-3 text-right">Spent</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.customers.slice(0, 10).map(c => (
                      <tr key={c.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {c.name || 'Guest'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {c.orders_count}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {currency(c.total_spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableBox>
            ) : (
              <EmptyText>No customer data.</EmptyText>
            )}
          </Section>

          <Section title="Payment Summary">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-bold text-gray-800">By Method</p>

                {payments?.by_method?.length > 0 ? (
                  <div className="space-y-2">
                    {payments.by_method.map(pm => (
                      <div
                        key={pm.payment_method}
                        className="flex justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <span className="capitalize text-gray-700">
                          {pm.payment_method || 'Unknown'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {currency(pm.revenue)} ({pm.count} orders)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyText>No payment method data.</EmptyText>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-bold text-gray-800">By Status</p>

                {payments?.by_status?.length > 0 ? (
                  <div className="space-y-2">
                    {payments.by_status.map(st => (
                      <div
                        key={st.payment_status}
                        className="flex justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        <span className="capitalize text-gray-700">
                          {st.payment_status || 'Unknown'}
                        </span>
                        <span className="font-bold text-gray-900">
                          {st.count} orders
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyText>No payment status data.</EmptyText>
                )}
              </div>
            </div>
          </Section>
        </div>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
            font-size: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          #print-area {
            margin: 0;
            padding: 0;
          }

          .print-break-inside {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="print-break-inside overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm print:rounded-2xl print:border-gray-300 print:shadow-none">
      <div className="flex items-center justify-between gap-3 rounded-t-3xl border-b border-gray-200 bg-gray-50 px-6 py-4 print:rounded-t-2xl">
        <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
        <div className="h-2 w-2 rounded-full bg-emerald-700" />
      </div>

      <div className="p-6">{children}</div>
    </section>
  )
}

function SummaryCard({ label, value, valueClass = 'text-gray-950' }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50/70 p-4 text-center shadow-sm print:shadow-none">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className={`mt-2 text-lg font-extrabold ${valueClass}`}>
        {value}
      </p>
    </div>
  )
}

function TableBox({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {children}
    </div>
  )
}

function EmptyText({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm font-medium text-gray-400">
      {children}
    </div>
  )
}