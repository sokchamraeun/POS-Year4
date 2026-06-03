import { useState, useEffect, useCallback } from 'react'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
const headers = { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' }

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
    case 'daily': start.setDate(start.getDate() - 1); break
    case 'weekly': start.setDate(start.getDate() - 7); break
    case 'monthly': start.setMonth(start.getMonth() - 1); break
    case 'yearly': start.setFullYear(start.getFullYear() - 1); break
  }
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}

function currency(n) { return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export default function PrinterReport() {
  const [period, setPeriod] = useState('daily')
  const [dates, setDates] = useState(getDateRange('daily'))
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams({ from: dates.from, to: dates.to }).toString()
    const endpoints = ['sales', 'products', 'inventory', 'purchases', 'profit', 'customers', 'payments']
    try {
      const results = await Promise.all(
        endpoints.map(async (key) => {
          const res = await fetch(`${API_URL}/reports/${key}?${qs}`, { headers })
          return { key, data: res.ok ? await res.json() : { error: 'Failed' } }
        })
      )
      const obj = {}
      results.forEach(r => { obj[r.key] = r.data })
      setData(obj)
    } catch {
      setData({})
    } finally {
      setLoading(false)
    }
  }, [dates])

  useEffect(() => { fetchAll() }, [fetchAll])

  function changePeriod(p) {
    setPeriod(p)
    setDates(getDateRange(p))
  }

  function handlePrint() {
    window.print()
  }

  const { sales, products, inventory, purchases, profit, customers, payments } = data

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button key={p.key} onClick={() => changePeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >{p.label}</button>
          ))}
        </div>
        <button onClick={handlePrint}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >Print</button>
      </div>

      {loading ? <Loader page={false} text="Loading report..." /> : (
        <div id="print-area" className="space-y-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">POS Cafe Report</h2>
            <p className="text-sm text-gray-500">{dates.from} — {dates.to} ({period})</p>
          </div>

          <Section title="Sales Summary">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Sales</p>
                <p className="text-lg font-bold text-gray-900">{currency(sales?.total_sales)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Orders</p>
                <p className="text-lg font-bold text-gray-900">{sales?.total_orders ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Avg Order</p>
                <p className="text-lg font-bold text-gray-900">{currency(sales?.avg_order_value)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-bold text-gray-900">{sales?.paid_orders ?? 0}</p>
              </div>
            </div>
            {sales?.daily?.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b">
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Orders</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.daily.map(d => (
                    <tr key={d.date} className="border-b border-gray-50">
                      <td className="py-1.5">{d.date}</td>
                      <td className="py-1.5 text-right">{d.orders}</td>
                      <td className="py-1.5 text-right font-medium">{currency(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Product Sales">
            {products?.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b">
                    <th className="py-2">Product</th>
                    <th className="py-2">Size</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 font-medium">{p.product?.name || 'Unknown'}</td>
                      <td className="py-1.5 text-gray-500">{p.size?.name || '—'}</td>
                      <td className="py-1.5 text-right">{p.total_qty}</td>
                      <td className="py-1.5 text-right">{currency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-sm text-gray-400">No product sales data.</p>}
          </Section>

          <Section title="Inventory Status">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Ingredients</p>
                <p className="text-lg font-bold text-gray-900">{inventory?.total_ingredients ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Low Stock</p>
                <p className="text-lg font-bold text-red-600">{inventory?.low_stock_count ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">In Stock</p>
                <p className="text-lg font-bold text-green-600">{(inventory?.total_ingredients ?? 0) - (inventory?.low_stock_count ?? 0)}</p>
              </div>
            </div>
            {inventory?.low_stock?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-red-800 mb-1">Low Stock Alerts</p>
                {inventory.low_stock.map(ing => (
                  <p key={ing.id} className="text-xs text-red-700">{ing.name} — {Number(ing.stock_quantity).toFixed(2)} {ing.unit}</p>
                ))}
              </div>
            )}
            {inventory?.ingredients?.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b">
                    <th className="py-2">Ingredient</th>
                    <th className="py-2 text-right">Stock</th>
                    <th className="py-2 text-right">Reorder</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.ingredients.map(ing => (
                    <tr key={ing.id} className="border-b border-gray-50">
                      <td className="py-1.5">{ing.name}</td>
                      <td className="py-1.5 text-right">{Number(ing.stock_quantity).toFixed(2)}</td>
                      <td className="py-1.5 text-right">{Number(ing.reorder_level).toFixed(2)}</td>
                      <td className="py-1.5">{ing.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Purchase History">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Purchases</p>
                <p className="text-lg font-bold text-gray-900">{purchases?.summary?.total_transactions ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Quantity</p>
                <p className="text-lg font-bold text-gray-900">{Number(purchases?.summary?.total_quantity || 0).toFixed(2)}</p>
              </div>
            </div>
            {purchases?.transactions?.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b">
                    <th className="py-2">Date</th>
                    <th className="py-2">Ingredient</th>
                    <th className="py-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-50">
                      <td className="py-1.5 text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="py-1.5">{tx.ingredient?.name || '—'}</td>
                      <td className="py-1.5 text-right text-green-600 font-medium">+{Number(tx.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Profit Overview">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-lg font-bold text-green-700">{currency(profit?.revenue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Cost of Ingredients</p>
                <p className="text-lg font-bold text-gray-400">N/A</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Net Profit</p>
                <p className="text-lg font-bold text-gray-400">N/A</p>
              </div>
            </div>
            {profit?.monthly?.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-600 mb-2">Monthly Revenue</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 font-medium border-b">
                      <th className="py-2">Month</th>
                      <th className="py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profit.monthly.map(m => (
                      <tr key={m.month} className="border-b border-gray-50">
                        <td className="py-1.5">{m.month}</td>
                        <td className="py-1.5 text-right font-medium">{currency(m.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Section>

          <Section title="Customer Summary">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Total Customers</p>
                <p className="text-lg font-bold text-gray-900">{customers?.total_customers ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">New (period)</p>
                <p className="text-lg font-bold text-gray-900">{customers?.new_customers ?? 0}</p>
              </div>
            </div>
            {customers?.customers?.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b">
                    <th className="py-2">Customer</th>
                    <th className="py-2 text-right">Orders</th>
                    <th className="py-2 text-right">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.customers.slice(0, 10).map(c => (
                    <tr key={c.id} className="border-b border-gray-50">
                      <td className="py-1.5">{c.name || 'Guest'}</td>
                      <td className="py-1.5 text-right">{c.orders_count}</td>
                      <td className="py-1.5 text-right font-medium">{currency(c.total_spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Payment Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">By Method</p>
                {payments?.by_method?.length > 0 ? (
                  <div className="space-y-2">
                    {payments.by_method.map(pm => (
                      <div key={pm.payment_method} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700">{pm.payment_method || 'Unknown'}</span>
                        <span className="font-medium">{currency(pm.revenue)} ({pm.count} orders)</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">No data.</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">By Status</p>
                {payments?.by_status?.length > 0 ? (
                  <div className="space-y-2">
                    {payments.by_status.map(st => (
                      <div key={st.payment_status} className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700">{st.payment_status || 'Unknown'}</span>
                        <span className="font-medium">{st.count} orders</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400">No data.</p>}
              </div>
            </div>
          </Section>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12px; }
          #print-area { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 print:border-none print:shadow-none print:break-inside-avoid">
      <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h3>
      {children}
    </div>
  )
}
