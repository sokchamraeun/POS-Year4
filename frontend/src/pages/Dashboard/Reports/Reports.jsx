import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Loader from '../../../components/shared/Loader.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import PrinterReport from './PrinterReport.jsx'

const API_URL = import.meta.env.VITE_API_URL
const headers = { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' }

const tabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'products', label: 'Products' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'profit', label: 'Profit' },
  { key: 'staff', label: 'Staff' },
  { key: 'customers', label: 'Customers' },
  { key: 'payments', label: 'Payments' },
  { key: 'printer', label: 'Printer' },
]

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

const presets = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'This Year', days: 365 },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales')
  const [startDate, setStartDate] = useState(daysAgo(30))
  const [endDate, setEndDate] = useState(today())
  const [loading, setLoading] = useState({})
  const [data, setData] = useState({})
  const [activePreset, setActivePreset] = useState(null)

  const fetchReport = useCallback(async (key, params = {}) => {
    setLoading(prev => ({ ...prev, [key]: true }))
    try {
      const qs = new URLSearchParams(params).toString()
      const res = await fetch(`${API_URL}/reports/${key}${qs ? '?' + qs : ''}`, { headers })
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(prev => ({ ...prev, [key]: json }))
    } catch (err) {
      setData(prev => ({ ...prev, [key]: { error: err.message } }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  useEffect(() => {
    const params = activeTab === 'inventory' || activeTab === 'staff' || activeTab === 'printer' ? {} : { from: startDate, to: endDate }
    fetchReport(activeTab, params)
  }, [activeTab, startDate, endDate, fetchReport])

  function applyPreset(days) {
    setActivePreset(days)
    setStartDate(daysAgo(days))
    setEndDate(today())
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function currency(n) { return '$' + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  function pct(n) { return Number(n || 0).toFixed(1) + '%' }

  const isLoading = loading[activeTab]
  const report = data[activeTab] || {}

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab !== 'inventory' && activeTab !== 'staff' && activeTab !== 'printer' && (
              <div className="flex items-center gap-2 flex-wrap">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p.days)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      activePreset === p.days ? 'bg-blue-600 text-white border-amber-600' : 'text-gray-600 bg-white border-gray-200 hover:bg-orange-50'
                    }`}
                  >{p.label}</button>
                ))}
                <input type="date" value={startDate} onChange={e => { setActivePreset(null); setStartDate(e.target.value) }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                <span className="text-xs text-gray-400">to</span>
                <input type="date" value={endDate} onChange={e => { setActivePreset(null); setEndDate(e.target.value) }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
            )}
          </div>

          {isLoading ? <Loader page={false} text="Loading report..." /> : report.error ? (
            <div className="bg-red-50 text-red-600 rounded-xl p-6 text-center">{report.error}</div>
          ) : (
            <>
              {activeTab === 'sales' && <SalesReport data={report} currency={currency} pct={pct} />}
              {activeTab === 'products' && <ProductsReport data={report} currency={currency} />}
              {activeTab === 'inventory' && <InventoryReport data={report} />}
              {activeTab === 'purchases' && <PurchasesReport data={report} currency={currency} formatDate={formatDate} />}
              {activeTab === 'profit' && <ProfitReport data={report} currency={currency} />}
              {activeTab === 'staff' && <StaffReport />}
              {activeTab === 'customers' && <CustomersReport data={report} currency={currency} formatDate={formatDate} />}
              {activeTab === 'payments' && <PaymentsReport data={report} currency={currency} />}
              {activeTab === 'printer' && <PrinterReport />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SalesReport({ data, currency, pct }) {
  const { total_sales, total_orders, paid_orders, avg_order_value, daily, payment_methods, best_sellers } = data

  function printDaily() {
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Daily Sales</title><style>
      body { font-family: monospace; font-size: 14px; padding: 20px; }
      h2 { text-align: center; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { font-weight: 600; }
      .text-right { text-align: right; }
    </style></head><body>
    <h2>Daily Sales</h2>
    <table>
      <thead><tr><th>Date</th><th class="text-right">Orders</th><th class="text-right">Revenue</th></tr></thead>
      <tbody>
        ${(daily || []).map(d => `<tr><td>${d.date}</td><td class="text-right">${d.orders}</td><td class="text-right">${currency(d.revenue)}</td></tr>`).join('')}
      </tbody>
    </table>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Total Sales" value={currency(total_sales)} color="text-green-700" />
        <SummaryCard label="Total Orders" value={total_orders ?? 0} sub={`${paid_orders ?? 0} paid`} />
        <SummaryCard label="Avg Order Value" value={currency(avg_order_value)} />
        <SummaryCard label="Payment Success" value={total_orders > 0 ? pct((paid_orders / total_orders) * 100) : '0%'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Sales</h2>
          {daily?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Orders</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d.date} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-800">{d.date}</td>
                      <td className="py-2.5 text-gray-600 text-right">{d.orders}</td>
                      <td className="py-2.5 text-gray-800 text-right font-medium">{currency(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-400 text-sm py-4 text-center">No data for selected period.</p>}
          {daily?.length > 0 && (
            <button onClick={printDaily} className="self-start mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Print
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Payment Method</h2>
            {payment_methods?.length > 0 ? (
              <div className="space-y-3">
                {payment_methods.map((pm) => (
                  <div key={pm.payment_method} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{pm.payment_method || 'Unknown'}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-800">{currency(pm.revenue)}</span>
                      <span className="text-xs text-gray-400 ml-2">({pm.count} orders)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm py-4 text-center">No data.</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Best Selling Products</h2>
            {best_sellers?.length > 0 ? (
              <div className="space-y-3">
                {best_sellers.map((p, i) => (
                  <div key={p.product_id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      <span className="text-gray-400 mr-2">#{i + 1}</span>
                      {p.product?.name || 'Unknown'}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-800">{p.total_qty} sold</span>
                      <span className="text-xs text-gray-400 ml-2">{currency(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm py-4 text-center">No data.</p>}
          </div>
        </div>
      </div>
    </>
  )
}

function ProductsReport({ data, currency }) {
  if (!data?.length) return <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">No product sales data for selected period.</div>
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Size</th>
            <th className="px-6 py-3 text-right">Qty Sold</th>
            <th className="px-6 py-3 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-800">{item.product?.name || 'Unknown'}</td>
              <td className="px-6 py-4 text-gray-600">{item.size?.name || '—'}</td>
              <td className="px-6 py-4 text-gray-800 text-right">{item.total_qty}</td>
              <td className="px-6 py-4 text-gray-800 text-right font-medium">{currency(item.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InventoryReport({ data }) {
  const { ingredients, low_stock, total_ingredients, low_stock_count } = data
  const statusStyles = {
    'In Stock': 'text-green-700 bg-green-100',
    'Low Stock': 'text-red-700 bg-red-100',
    'Out of Stock': 'text-red-700 bg-red-100',
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SummaryCard label="Total Ingredients" value={total_ingredients ?? 0} />
        <SummaryCard label="Low Stock Items" value={low_stock_count ?? 0} color={low_stock_count > 0 ? 'text-red-600' : 'text-green-600'} />
        <SummaryCard label="In Stock" value={(total_ingredients ?? 0) - (low_stock_count ?? 0)} color="text-green-700" />
      </div>

      {low_stock?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Low Stock Alerts</h3>
          <div className="space-y-1">
            {low_stock.map((ing) => (
              <p key={ing.id} className="text-sm text-red-700">
                {ing.name} — {Number(ing.stock_quantity).toFixed(2)} {ing.unit} (reorder at {Number(ing.reorder_level).toFixed(2)})
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
              <th className="px-6 py-3">Ingredient</th>
              <th className="px-6 py-3">Unit</th>
              <th className="px-6 py-3 text-right">Stock Left</th>
              <th className="px-6 py-3 text-right">Reorder Level</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients?.map((ing) => (
              <tr key={ing.id} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{ing.name}</td>
                <td className="px-6 py-4 text-gray-600">{ing.unit}</td>
                <td className="px-6 py-4 text-gray-800 text-right">{Number(ing.stock_quantity).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-800 text-right">{Number(ing.reorder_level).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[ing.status] || 'bg-gray-100 text-gray-600'}`}>
                    {ing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-right">{ing.transactions_count}</td>
              </tr>
            ))}
            {(!ingredients || ingredients.length === 0) && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No ingredients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PurchasesReport({ data, currency, formatDate }) {
  const { transactions, summary, pagination } = data
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <SummaryCard label="Total Purchases" value={summary?.total_transactions ?? 0} />
        <SummaryCard label="Total Quantity" value={Number(summary?.total_quantity || 0).toFixed(2)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Ingredient</th>
              <th className="px-6 py-3 text-right">Quantity</th>
              <th className="px-6 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx) => (
              <tr key={tx.id} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4 text-gray-600 text-xs">{formatDate(tx.created_at)}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{tx.ingredient?.name || '—'}</td>
                <td className="px-6 py-4 text-green-600 text-right font-medium">+{Number(tx.quantity).toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-500">{tx.note || '—'}</td>
              </tr>
            ))}
            {(!transactions || transactions.length === 0) && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No purchases found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination?.last_page > 1 && (
        <div className="bg-white rounded-xl shadow-sm px-6 py-4 mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">Page {pagination.current_page} of {pagination.last_page}</span>
        </div>
      )}
    </>
  )
}

function ProfitReport({ data, currency }) {
  const { revenue, monthly } = data
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <SummaryCard label="Total Revenue" value={currency(revenue)} color="text-green-700" />
        <SummaryCard label="Cost of Ingredients" value="N/A" sub="Cost data not tracked yet" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
        </div>
        {monthly?.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{m.month}</td>
                  <td className="px-6 py-4 text-gray-800 text-right font-medium">{currency(m.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-400">No data for selected period.</div>
        )}
      </div>
    </>
  )
}

function StaffReport() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      <div className="text-4xl mb-4">👤</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Staff Performance</h2>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        Staff performance tracking requires assigning staff members to orders. 
        This feature will be available after adding staff assignment to the order system.
      </p>
    </div>
  )
}

function CustomersReport({ data, currency, formatDate }) {
  const { customers, total_customers, new_customers } = data
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <SummaryCard label="Total Customers" value={total_customers ?? 0} />
        <SummaryCard label="New Customers (period)" value={new_customers ?? 0} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3 text-right">Orders</th>
              <th className="px-6 py-3 text-right">Total Spent</th>
              <th className="px-6 py-3 text-right">Points</th>
              <th className="px-6 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{c.name || 'Guest'}</td>
                <td className="px-6 py-4 text-gray-600">{c.phone || '—'}</td>
                <td className="px-6 py-4 text-gray-800 text-right">{c.orders_count}</td>
                <td className="px-6 py-4 text-gray-800 text-right font-medium">{currency(c.total_spent)}</td>
                <td className="px-6 py-4 text-gray-800 text-right">{c.points}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{c.created_at ? formatDate(c.created_at) : '—'}</td>
              </tr>
            ))}
            {(!customers || customers.length === 0) && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No customer data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PaymentsReport({ data, currency }) {
  const { by_method, by_status } = data
  const totalRevenue = by_method?.reduce((s, m) => s + Number(m.revenue), 0) || 0
  const totalOrders = by_status?.reduce((s, st) => s + Number(st.count), 0) || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Payment Method</h2>
        {by_method?.length > 0 ? (
          <div className="space-y-4">
            {by_method.map((pm) => (
              <div key={pm.payment_method}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize font-medium">{pm.payment_method || 'Unknown'}</span>
                  <span className="text-gray-800 font-medium">{currency(pm.revenue)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: totalRevenue > 0 ? (pm.revenue / totalRevenue * 100) + '%' : '0%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{pm.count} orders ({totalRevenue > 0 ? ((pm.revenue / totalRevenue) * 100).toFixed(1) : 0}%)</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm py-4 text-center">No payment data.</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Breakdown</h2>
        {by_status?.length > 0 ? (
          <div className="space-y-4">
            {by_status.map((st) => (
              <div key={st.payment_status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize font-medium">{st.payment_status || 'Unknown'}</span>
                  <span className="text-gray-800 font-medium">{st.count} orders</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${st.payment_status === 'Paid' ? 'bg-green-500' : st.payment_status === 'Unpaid' ? 'bg-yellow-500' : st.payment_status === 'Refunded' ? 'bg-red-500' : 'bg-orange-500'}`}
                    style={{ width: totalOrders > 0 ? (st.count / totalOrders * 100) + '%' : '0%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{totalOrders > 0 ? ((st.count / totalOrders) * 100).toFixed(1) : 0}%</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-400 text-sm py-4 text-center">No payment data.</p>}
      </div>
    </div>
  )
}
