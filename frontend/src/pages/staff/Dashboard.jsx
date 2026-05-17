import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const API_URL = 'https://pos-year4.onrender.com/api'

const periods = [
  { key: 'daily', label: 'Daily' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
]

const SVG_WIDTH = 700
const SVG_HEIGHT = 280
const PAD = { top: 20, right: 20, bottom: 30, left: 55 }
const plotW = SVG_WIDTH - PAD.left - PAD.right
const plotH = SVG_HEIGHT - PAD.top - PAD.bottom

function fetchAllPages(endpoint) {
  return fetch(`${API_URL}${endpoint}?page=1`)
    .then((r) => r.json())
    .then(async (first) => {
      let all = first.data ?? []
      const lastPage = first.last_page ?? 1
      const pages = []
      for (let p = 2; p <= lastPage; p++) {
        pages.push(
          fetch(`${API_URL}${endpoint}?page=${p}`)
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
  const [recentOrders, setRecentOrders] = useState([
    { id: 1001, customer: { name: 'John Doe' }, total: 24.50, payment_status: 'Paid', created_at: '2026-05-18T10:30:00' },
    { id: 1002, customer: { name: 'Jane Smith' }, total: 15.00, payment_status: 'Paid', created_at: '2026-05-18T11:00:00' },
    { id: 1003, customer: { name: 'Alice Wong' }, total: 32.80, payment_status: 'Unpaid', created_at: '2026-05-18T11:45:00' },
    { id: 1004, customer: { name: 'Bob Lee' }, total: 8.90, payment_status: 'Paid', created_at: '2026-05-18T12:15:00' },
    { id: 1005, customer: { name: 'Carol Tan' }, total: 41.20, payment_status: 'Pending', created_at: '2026-05-18T13:00:00' },
  ])
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

  const data = chartData[period]
  const maxVal = data.length > 0 ? Math.max(...data.flatMap((d) => [d.revenue, d.orders])) * 1.15 : 1
  const barWidth = Math.min(plotW / (data.length || 1) * 0.22, 20)

  function xCenter(i) {
    return PAD.left + (i + 0.5) * (plotW / (data.length || 1))
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
                              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                                o.payment_status === 'Paid' ? 'text-green-700 bg-green-100' :
                                o.payment_status === 'Unpaid' ? 'text-red-700 bg-red-100' :
                                'text-yellow-700 bg-yellow-100'
                              }`}>
                                {o.payment_status ?? 'Unpaid'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
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
        </main>
      </div>
    </div>
  )
}
