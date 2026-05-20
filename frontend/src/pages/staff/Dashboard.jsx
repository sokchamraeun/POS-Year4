import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

const periods = [
  { key: 'daily', label: 'Daily' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom' },
]

const statusColors = {
  Completed: 'text-green-600 bg-green-100',
  Processing: 'text-blue-600 bg-blue-100',
  Pending: 'text-yellow-600 bg-yellow-100',
  Cancelled: 'text-red-600 bg-red-100',
}

const paymentColors = {
  Paid: 'text-green-600 bg-green-100',
  Unpaid: 'text-red-600 bg-red-100',
  Refunded: 'text-gray-600 bg-gray-100',
}

const SVG_WIDTH = 700
const SVG_HEIGHT = 280
const PAD = { top: 20, right: 20, bottom: 30, left: 55 }
const plotW = SVG_WIDTH - PAD.left - PAD.right
const plotH = SVG_HEIGHT - PAD.top - PAD.bottom

function fetchAllPages(endpoint) {
  return fetch(`${API_URL}${endpoint}?page=1`, { headers })
    .then((r) => r.json())
    .then(async (first) => {
      let all = first.data ?? []
      const lastPage = first.last_page ?? 1
      const pages = []
      for (let p = 2; p <= lastPage; p++) {
        pages.push(
          fetch(`${API_URL}${endpoint}?page=${p}`, { headers })
            .then((r) => r.json())
            .then((j) => j.data ?? [])
        )
      }
      const rest = await Promise.all(pages)
      for (const arr of rest) all = all.concat(arr)
      return all
    })
}

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', change: '-', color: 'bg-green-500' },
    { label: 'Orders Today', value: '0', change: '-', color: 'bg-blue-500' },
    { label: 'Products', value: '0', change: '-', color: 'bg-yellow-500' },
    { label: 'Customers', value: '0', change: '-', color: 'bg-purple-500' },
  ])
  const [chartData, setChartData] = useState({ daily: [], monthly: [], yearly: [] })
  const [topProducts, setTopProducts] = useState([])
  const [products, setProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [orders, allProducts, customers] = await Promise.all([
          fetchAllPages('/orders'),
          fetchAllPages('/products'),
          fetchAllPages('/customers'),
        ])

        setProducts(allProducts)
        const today = new Date().toISOString().slice(0, 10)
        const ordersToday = orders.filter((o) => (o.created_at ?? '').startsWith(today))
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0)
        const revenueToday = ordersToday.reduce((s, o) => s + Number(o.total ?? 0), 0)

        setStats([
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: orders.length > 0 ? `${orders.length} orders` : '-', color: 'bg-green-500' },
          { label: 'Orders Today', value: String(ordersToday.length), change: `$${revenueToday.toFixed(2)}`, color: 'bg-blue-500' },
          { label: 'Products', value: String(allProducts.length), change: `${allProducts.filter((p) => p.status).length} active`, color: 'bg-yellow-500' },
          { label: 'Customers', value: String(customers.length), change: '-', color: 'bg-purple-500' },
        ])

        setRecentOrders(orders.slice(0, 5))
        setAllOrders(orders)

        const orderItems = orders.flatMap((o) => (o.items ?? []).map((i) => ({ ...i, date: o.created_at })))

        const prodCounts = {}
        for (const i of orderItems) {
          const name = i.product?.name ?? i.name ?? 'Unknown'
          prodCounts[name] = (prodCounts[name] || 0) + Number(i.qty ?? 1)
        }
        const sorted = Object.entries(prodCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }))

        if (sorted.length === 0) {
          setTopProducts(allProducts.slice(0, 5).map((p) => ({ name: p.name, qty: 0 })))
        } else {
          setTopProducts(sorted)
        }

        const byDate = {}
        for (const o of orders) {
          const date = (o.created_at ?? '').slice(0, 10)
          if (date) {
            if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 }
            byDate[date].revenue += Number(o.total ?? 0)
            byDate[date].orders += 1
          }
        }

        const sortedDates = Object.keys(byDate).sort()
        const dailyData = sortedDates.slice(-7).map((d) => ({
          label: d.slice(5),
          revenue: byDate[d].revenue,
          orders: byDate[d].orders,
        }))

        const byMonth = {}
        for (const o of orders) {
          const month = (o.created_at ?? '').slice(0, 7)
          if (month) {
            if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0 }
            byMonth[month].revenue += Number(o.total ?? 0)
            byMonth[month].orders += 1
          }
        }

        const sortedMonths = Object.keys(byMonth).sort()
        const monthlyData = sortedMonths.slice(-6).map((m) => ({
          label: m.slice(5),
          revenue: byMonth[m].revenue,
          orders: byMonth[m].orders,
        }))

        const byYear = {}
        for (const o of orders) {
          const year = (o.created_at ?? '').slice(0, 4)
          if (year) {
            if (!byYear[year]) byYear[year] = { revenue: 0, orders: 0 }
            byYear[year].revenue += Number(o.total ?? 0)
            byYear[year].orders += 1
          }
        }

        const sortedYears = Object.keys(byYear).sort()
        const yearlyData = sortedYears.map((y) => ({
          label: y,
          revenue: byYear[y].revenue,
          orders: byYear[y].orders,
        }))

        setChartData({
          daily: dailyData.length > 0 ? dailyData : [{ label: 'No data', revenue: 0, orders: 0 }],
          monthly: monthlyData.length > 0 ? monthlyData : [{ label: 'No data', revenue: 0, orders: 0 }],
          yearly: yearlyData.length > 0 ? yearlyData : [{ label: 'No data', revenue: 0, orders: 0 }],
        })

      } catch {
        // keep defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (period === 'custom') {
      if (!fromDate) setFromDate(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
      if (!toDate) setToDate(new Date().toISOString().slice(0, 10))
    }
  }, [period])

  const customData = (() => {
    if (period !== 'custom' || !fromDate || !toDate) return null
    const filtered = allOrders.filter((o) => {
      const d = (o.created_at ?? '').slice(0, 10)
      return d >= fromDate && d <= toDate
    })
    const byDate = {}
    for (const o of filtered) {
      const date = (o.created_at ?? '').slice(0, 10)
      if (date) {
        if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 }
        byDate[date].revenue += Number(o.total ?? 0)
        byDate[date].orders += 1
      }
    }
    const sorted = Object.keys(byDate).sort()
    return sorted.length > 0
      ? sorted.map((d) => ({ label: d.slice(5), revenue: byDate[d].revenue, orders: byDate[d].orders }))
      : [{ label: 'No data', revenue: 0, orders: 0 }]
  })()

  const data = period === 'custom' ? (customData ?? [{ label: 'No data', revenue: 0, orders: 0 }]) : chartData[period]
  const maxVal = data.length > 0 ? Math.max(...data.flatMap((d) => [d.revenue, d.orders])) * 1.15 : 1
  const barWidth = Math.min(plotW / (data.length || 1) * 0.22, 20)

  function xCenter(i) {
    return PAD.left + (i + 0.5) * (plotW / (data.length || 1))
  }

  function handleStatusChange(orderId, newStatus) {
    const order = allOrders.find((o) => o.id === orderId) ?? recentOrders.find((o) => o.id === orderId)
    setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    setAllOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev))
    fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        payment_status: order?.payment_status ?? 'Unpaid',
        total: Number(order?.total ?? 0),
        customer_id: order?.customer_id ?? null,
        table_id: order?.table_id ?? null,
        payment_method: order?.payment_method ?? null,
      }),
    })
  }

  function handlePaymentChange(orderId, newPayment) {
    const order = allOrders.find((o) => o.id === orderId) ?? recentOrders.find((o) => o.id === orderId)
    setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o)))
    setAllOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, payment_status: newPayment } : prev))
    fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: order?.status ?? 'Pending',
        payment_status: newPayment,
        total: Number(order?.total ?? 0),
        customer_id: order?.customer_id ?? null,
        table_id: order?.table_id ?? null,
        payment_method: order?.payment_method ?? null,
      }),
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading dashboard...</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6 mb-6 flex-col lg:flex-row">
            <div className="lg:w-1/2 w-full flex">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Revenue &amp; Orders</h2>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {periods.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPeriod(p.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        period === p.key
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {period === 'custom' && (
                  <div className="flex items-center gap-2 mt-3">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-gray-500">to</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-blue-500" />
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span className="text-gray-600">Orders</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full min-w-[500px]" style={{ maxHeight: `${SVG_HEIGHT}px` }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <filter id="barShadow">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#f8fafc" rx={6} />

                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                    <g key={frac}>
                      <line
                        x1={PAD.left} y1={PAD.top + plotH * (1 - frac)}
                        x2={SVG_WIDTH - PAD.right} y2={PAD.top + plotH * (1 - frac)}
                        stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4,3"
                      />
                      <text x={PAD.left - 8} y={PAD.top + plotH * (1 - frac) + 3}
                        textAnchor="end" fill="#9ca3af" fontSize={11}>
                        {period === 'yearly' ? `$${Math.round(maxVal * frac / 1000)}k` : `$${Math.round(maxVal * frac)}`}
                      </text>
                    </g>
                  ))}

                  <line x1={PAD.left} y1={PAD.top + plotH} x2={SVG_WIDTH - PAD.right} y2={PAD.top + plotH}
                    stroke="#d1d5db" strokeWidth={1.5} />

                  {data.map((d, i) => {
                    const cx = xCenter(i)
                    const revH = (d.revenue / maxVal) * plotH
                    const ordH = (d.orders / maxVal) * plotH
                    const gap = 3
                    return (
                      <g key={i}>
                        <rect x={cx - barWidth - gap / 2} y={PAD.top + plotH - revH}
                          width={barWidth} height={revH} rx={4} fill="url(#revGrad)" filter="url(#barShadow)" />
                        {revH > 15 && (
                          <text x={cx - barWidth / 2 - gap / 2} y={PAD.top + plotH - revH - 5}
                            textAnchor="middle" fill="#3b82f6" fontSize={10} fontWeight={600}>
                            ${period === 'yearly' ? Math.round(d.revenue / 1000) + 'k' : d.revenue}
                          </text>
                        )}
                        <rect x={cx + gap / 2} y={PAD.top + plotH - ordH}
                          width={barWidth} height={ordH} rx={4} fill="url(#ordGrad)" filter="url(#barShadow)" />
                        {ordH > 15 && (
                          <text x={cx + barWidth / 2 + gap / 2} y={PAD.top + plotH - ordH - 5}
                            textAnchor="middle" fill="#16a34a" fontSize={10} fontWeight={600}>
                            {d.orders}
                          </text>
                        )}
                        <text x={cx} y={SVG_HEIGHT - 6} textAnchor="middle" fill="#6b7280" fontSize={11} fontWeight={500}>
                          {d.label}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
            </div>

            <div className="lg:w-1/2 w-full flex">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                          <th className="pb-2 pr-2">Order ID</th>
                          <th className="pb-2 pr-2">Customer</th>
                          <th className="pb-2 pr-2">Total</th>
                          <th className="pb-2 pr-2">Payment</th>
                          <th className="pb-2 pr-2">Status</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o) => (
                          <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 pr-2 font-medium text-gray-800">#{o.id}</td>
                            <td className="py-2.5 pr-2 text-gray-600">{o.customer?.name ?? 'Guest'}</td>
                            <td className="py-2.5 pr-2 text-gray-800">${Number(o.total ?? 0).toFixed(2)}</td>
                            <td className="py-2.5 pr-2">
                              <select
                                value={o.payment_status ?? 'Unpaid'}
                                onChange={(e) => handlePaymentChange(o.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${paymentColors[o.payment_status ?? 'Unpaid']}`}
                                style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                              >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </td>
                            <td className="py-2.5 pr-2">
                              <select
                                value={o.status ?? 'Pending'}
                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[o.status ?? 'Pending']}`}
                                style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-2.5 text-right">
                              <button onClick={() => setSelectedOrder(o)} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                View Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No orders yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
              {topProducts.length > 0 ? (
                topProducts.map((p, i) => {
                  const maxQty = topProducts[0].qty || 1
                  const pct = (p.qty / maxQty) * 100
                  return (
                    <div key={p.name} className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-700 w-36 truncate">{p.name}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-10 text-right">{p.qty}</span>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-400 text-sm">No order data yet.</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
              {products.length > 0 ? (
                products.map((p) => {
                  const pct = p.status ? 100 : 0
                  const color = p.status ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'
                  return (
                    <div key={p.id} className="flex items-center gap-4 mb-3">
                      <span className="text-sm text-gray-700 w-36 truncate">{p.name}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-sm w-10 text-right ${p.status ? 'text-green-600' : 'text-red-600'}`}>
                        {p.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-400 text-sm">No products yet.</p>
              )}
            </div>
          </div>

          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Order #{selectedOrder.id} - Items</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Customer: <span className="text-gray-800 font-medium">{selectedOrder.customer?.name ?? 'Guest'}</span>{selectedOrder.customer?.phone ? ` \u2014 ${selectedOrder.customer.phone}` : ''}</span>
                    <span>{(selectedOrder.created_at ?? '').slice(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedOrder.payment_status === 'Paid' ? 'text-green-700 bg-green-100' :
                      selectedOrder.payment_status === 'Unpaid' ? 'text-red-700 bg-red-100' :
                      'text-yellow-700 bg-yellow-100'
                    }`}>
                      {selectedOrder.payment_status ?? 'Unpaid'}
                    </span>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      selectedOrder.status === 'Completed' ? 'text-green-700 bg-green-100' :
                      selectedOrder.status === 'Processing' ? 'text-blue-700 bg-blue-100' :
                      selectedOrder.status === 'Cancelled' ? 'text-red-700 bg-red-100' :
                      'text-yellow-700 bg-yellow-100'
                    }`}>
                      {selectedOrder.status ?? 'Pending'}
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items ?? []).map((item, i) => {
                        const itemName = item.product?.name ?? item.name ?? 'Unknown'
                        const itemPrice = Number(item.unit_price ?? item.price ?? 0)
                        const itemQty = item.qty ?? 1
                        const variations = [item.size?.name, item.sugarLevel?.name, item.iceLevel?.name].filter(Boolean).join(' | ')
                        const addonText = (item.addons ?? []).map((a) => a.addon?.name).filter(Boolean).join(', ')
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 text-gray-800">
                              {itemName}
                              {variations && <div className="text-xs text-gray-400">{variations}</div>}
                              {addonText && <div className="text-xs text-gray-400">+ {addonText}</div>}
                            </td>
                            <td className="py-2 text-gray-600">{itemQty}</td>
                            <td className="py-2 text-gray-600 text-right">${itemPrice.toFixed(2)}</td>
                            <td className="py-2 text-gray-800 text-right">${(itemQty * itemPrice).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-right font-semibold text-gray-800">Total</td>
                        <td className="pt-3 text-right font-semibold text-gray-800">${Number(selectedOrder.total ?? 0).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
