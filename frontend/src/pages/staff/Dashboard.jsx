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
const SVG_HEIGHT = 300
const PAD = { top: 24, right: 20, bottom: 32, left: 56 }
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
  const [hoveredPoint, setHoveredPoint] = useState(null)

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
        const paidToday = ordersToday.filter((o) => o.payment_status === 'Paid')
        const totalRevenue = orders.reduce((s, o) => s + Number(o.total ?? 0), 0)
        const revenueToday = paidToday.reduce((s, o) => s + Number(o.total ?? 0), 0)

        setStats([
          { label: 'Total Revenue Today', value: `$${revenueToday.toFixed(2)}`, change: ordersToday.length > 0 ? `${ordersToday.length} orders` : '-', color: 'bg-green-500' },
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
            if (o.payment_status === 'Paid') byDate[date].revenue += Number(o.total ?? 0)
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
            if (o.payment_status === 'Paid') byMonth[month].revenue += Number(o.total ?? 0)
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
            if (o.payment_status === 'Paid') byYear[year].revenue += Number(o.total ?? 0)
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
        if (o.payment_status === 'Paid') byDate[date].revenue += Number(o.total ?? 0)
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
  const barWidth = Math.min(plotW / (data.length || 1) * 0.18, 18)

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

  function rebuildChartData(orders) {
    const byDate = {}
    const byMonth = {}
    const byYear = {}
    for (const o of orders) {
      const date = (o.created_at ?? '').slice(0, 10)
      if (date) {
        if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 }
        if (o.payment_status === 'Paid') byDate[date].revenue += Number(o.total ?? 0)
        byDate[date].orders += 1
      }
      const month = (o.created_at ?? '').slice(0, 7)
      if (month) {
        if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0 }
        if (o.payment_status === 'Paid') byMonth[month].revenue += Number(o.total ?? 0)
        byMonth[month].orders += 1
      }
      const year = (o.created_at ?? '').slice(0, 4)
      if (year) {
        if (!byYear[year]) byYear[year] = { revenue: 0, orders: 0 }
        if (o.payment_status === 'Paid') byYear[year].revenue += Number(o.total ?? 0)
        byYear[year].orders += 1
      }
    }
    const sortedDates = Object.keys(byDate).sort()
    const dailyData = sortedDates.slice(-7).map((d) => ({ label: d.slice(5), revenue: byDate[d].revenue, orders: byDate[d].orders }))
    const sortedMonths = Object.keys(byMonth).sort()
    const monthlyData = sortedMonths.slice(-6).map((m) => ({ label: m.slice(5), revenue: byMonth[m].revenue, orders: byMonth[m].orders }))
    const sortedYears = Object.keys(byYear).sort()
    const yearlyData = sortedYears.map((y) => ({ label: y, revenue: byYear[y].revenue, orders: byYear[y].orders }))
    setChartData({
      daily: dailyData.length > 0 ? dailyData : [{ label: 'No data', revenue: 0, orders: 0 }],
      monthly: monthlyData.length > 0 ? monthlyData : [{ label: 'No data', revenue: 0, orders: 0 }],
      yearly: yearlyData.length > 0 ? yearlyData : [{ label: 'No data', revenue: 0, orders: 0 }],
    })
  }

  function handlePaymentChange(orderId, newPayment) {
    const order = allOrders.find((o) => o.id === orderId) ?? recentOrders.find((o) => o.id === orderId)
    setRecentOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o)))
    setAllOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o))
      const today = new Date().toISOString().slice(0, 10)
      const ordersToday = updated.filter((o) => (o.created_at ?? '').startsWith(today))
      const paidToday = ordersToday.filter((o) => o.payment_status === 'Paid')
      const revenueToday = paidToday.reduce((s, o) => s + Number(o.total ?? 0), 0)
      setStats((prevStats) => prevStats.map((s) =>
        s.label === 'Total Revenue Today'
          ? { ...s, value: `$${revenueToday.toFixed(2)}`, change: `${ordersToday.length} orders` }
          : s.label === 'Orders Today'
          ? { ...s, value: String(ordersToday.length), change: `$${revenueToday.toFixed(2)}` }
          : s
      ))
      rebuildChartData(updated)
      return updated
    })
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
            {stats.map((stat, idx) => {
              const accents = ['from-indigo-500 to-indigo-600', 'from-blue-500 to-blue-600', 'from-amber-500 to-amber-600', 'from-purple-500 to-purple-600']
              return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500 hover:shadow-md transition-shadow duration-200" style={{ borderColor: ['#6366f1', '#3b82f6', '#f59e0b', '#8b5cf6'][idx] }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full">{stat.change}</span>
                </div>
              </div>
            )})}
          </div>

          <div className="flex gap-6 mb-6 flex-col lg:flex-row">
            <div className="lg:w-1/2 w-full flex">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Revenue &amp; Orders</h2>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  {periods.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPeriod(p.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        period === p.key
                          ? 'bg-white text-gray-900 shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {period === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    <span className="text-xs text-gray-400 font-medium">to</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-gray-600 font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-gray-600 font-medium">Orders</span>
                </div>
              </div>

              <div className="overflow-x-auto" style={{ position: 'relative' }}>
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full min-w-[500px]" style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}>
                  <defs>
                    <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="ordArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="dotGlow">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.35" />
                    </filter>
                    <filter id="dotGlowOrd">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#f8fafc" rx={8} />

                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                    <g key={frac}>
                      <line x1={PAD.left} y1={PAD.top + plotH * (1 - frac)}
                        x2={SVG_WIDTH - PAD.right} y2={PAD.top + plotH * (1 - frac)}
                        stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4,3" />
                      <text x={PAD.left - 10} y={PAD.top + plotH * (1 - frac) + 4}
                        textAnchor="end" fill="#9ca3af" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif" fontFeatureSettings="'tnum'">
                        {period === 'yearly' ? `$${Math.round(maxVal * frac / 1000)}k` : `$${Math.round(maxVal * frac)}`}
                      </text>
                    </g>
                  ))}

                  <line x1={PAD.left} y1={PAD.top + plotH} x2={SVG_WIDTH - PAD.right} y2={PAD.top + plotH}
                    stroke="#d1d5db" strokeWidth={1.5} />

                  {data.length > 1 && (() => {
                    const points = data.map((d, i) => ({
                      x: xCenter(i),
                      y: PAD.top + plotH - (d.revenue / maxVal) * plotH,
                    }))
                    const ordPoints = data.map((d, i) => ({
                      x: xCenter(i),
                      y: PAD.top + plotH - (d.orders / maxVal) * plotH,
                    }))

                    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
                    const ordLinePath = ordPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

                    const areaPath = `${linePath} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`
                    const ordAreaPath = `${ordLinePath} L${ordPoints[ordPoints.length - 1].x},${PAD.top + plotH} L${ordPoints[0].x},${PAD.top + plotH} Z`

                    const hoverIdx = hoveredPoint ? data.findIndex((d) => d.label === hoveredPoint.label) : -1

                    return (
                      <g>
                        <path d={areaPath} fill="url(#revArea)" />
                        <path d={ordAreaPath} fill="url(#ordArea)" />
                        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        <path d={ordLinePath} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="transparent"
                          onMouseMove={(e) => {
                            const svg = e.currentTarget.ownerSVGElement
                            const rect = svg.getBoundingClientRect()
                            const mx = (e.clientX - rect.left) / rect.width * SVG_WIDTH
                            const idx = Math.round((mx - PAD.left) / plotW * (data.length - 1))
                            const clamped = Math.max(0, Math.min(data.length - 1, idx))
                            setHoveredPoint({ ...data[clamped], x: xCenter(clamped) })
                          }}
                          onMouseLeave={() => setHoveredPoint(null)} />
                        {points.map((p, i) => (
                          <g key={`rev-${i}`}>
                            <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4} fill={hoverIdx === i ? '#6366f1' : '#fff'} stroke="#6366f1" strokeWidth={2.5} filter="url(#dotGlow)" />
                          </g>
                        ))}
                        {ordPoints.map((p, i) => (
                          <g key={`ord-${i}`}>
                            <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4} fill={hoverIdx === i ? '#f59e0b' : '#fff'} stroke="#f59e0b" strokeWidth={2.5} filter="url(#dotGlowOrd)" />
                          </g>
                        ))}
                        {data.map((d, i) => (
                          <text key={`lbl-${i}`} x={xCenter(i)} y={SVG_HEIGHT - 8} textAnchor="middle" fill="#6b7280" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif" fontWeight={hoverIdx === i ? 700 : 500}>
                            {d.label}
                          </text>
                        ))}
                        {hoveredPoint && (
                          <g>
                            <line x1={hoveredPoint.x} y1={PAD.top} x2={hoveredPoint.x} y2={PAD.top + plotH}
                              stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
                            <rect x={hoveredPoint.x - 60} y={PAD.top + 4} width={120} height={52} rx={6} fill="#1f2937" opacity={0.92} />
                            <text x={hoveredPoint.x} y={PAD.top + 20} textAnchor="middle" fill="#e5e7eb" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif" fontWeight={600}>
                              {hoveredPoint.label}
                            </text>
                            <text x={hoveredPoint.x} y={PAD.top + 34} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif" fontWeight={700}>
                              Rev: ${period === 'yearly' ? Math.round(hoveredPoint.revenue / 1000) + 'k' : hoveredPoint.revenue}
                            </text>
                            <text x={hoveredPoint.x} y={PAD.top + 48} textAnchor="middle" fill="#fde68a" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif" fontWeight={700}>
                              Ord: {hoveredPoint.orders}
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })()}

                  {data.length <= 1 && (
                    <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#9ca3af" fontSize={13} fontFamily="'Noto Sans Khmer', sans-serif">
                      Need more data points for a line chart
                    </text>
                  )}
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
                          <th className="pb-2 pr-2">Items</th>
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
                            <td className="py-2.5 pr-2">
                              {(o.items ?? []).slice(0, 3).map((item, i) => {
                                const name = item.product?.name ?? item.name ?? 'Unknown'
                                const vars = [item.size?.name, item.sugarLevel?.name, item.iceLevel?.name].filter(Boolean).join('|')
                                const adds = (item.addons ?? []).map(a => a.addon?.name).filter(Boolean).join(',')
                                return (
                                  <div key={i} className="text-xs leading-tight mb-0.5">
                                    <span className="text-gray-700 font-medium">{name}</span>
                                    {vars && <span className="text-gray-400"> ({vars})</span>}
                                    {adds && <span className="text-gray-400"> +{adds}</span>}
                                    <span className="text-gray-500"> x{item.qty ?? 1}</span>
                                  </div>
                                )
                              })}
                              {(o.items ?? []).length > 3 && <div className="text-xs text-gray-400">+{o.items.length - 3} more</div>}
                              {(o.items ?? []).length === 0 && <span className="text-xs text-gray-400">—</span>}
                            </td>
                            <td className="py-2.5 pr-2 text-gray-800 font-medium">${Number(o.total ?? 0).toFixed(2)}</td>
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
              {topProducts.length > 0 ? (() => {
                const total = topProducts.reduce((s, p) => s + p.qty, 0)
                const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
                const cx = 110, cy = 110, r = 85, innerR = 50
                let curAngle = -Math.PI / 2
                const slices = topProducts.map((p, i) => {
                  const sweep = total > 0 ? (p.qty / total) * Math.PI * 2 : 0
                  const sa = curAngle
                  const ea = curAngle + sweep
                  const sx = cx + r * Math.cos(sa)
                  const sy = cy + r * Math.sin(sa)
                  const ex = cx + r * Math.cos(ea)
                  const ey = cy + r * Math.sin(ea)
                  const large = sweep > Math.PI ? 1 : 0
                  const path = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`
                  curAngle = ea
                  return { ...p, color: colors[i % colors.length], path }
                })
                const midAngle = (slices.reduce((a, s, i) => {
                  const sweep = total > 0 ? (s.qty / total) * Math.PI * 2 : 0
                  return a + (i === 0 ? sweep / 2 : sweep)
                }, 0))
                return (
                  <div className="flex items-center gap-6">
                    <svg width="220" height="220" viewBox="0 0 220 220">
                      {slices.map((s, i) => (
                        <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
                      ))}
                      <circle cx={cx} cy={cy} r={innerR} fill="white" />
                      <text x={cx} y={cy - 6} textAnchor="middle" fill="#374151" fontSize={22} fontWeight={800} fontFamily="'Noto Sans Khmer', sans-serif">{total}</text>
                      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9ca3af" fontSize={11} fontFamily="'Noto Sans Khmer', sans-serif">Total Sold</text>
                    </svg>
                    <div className="flex-1 space-y-2">
                      {slices.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-gray-700 flex-1 truncate">{s.name}</span>
                          <span className="text-gray-500 font-medium">{s.qty}</span>
                          <span className="text-gray-400 w-10 text-right">{total > 0 ? Math.round((s.qty / total) * 100) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })() : (
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
                  <h2 className="text-lg font-semibold text-gray-800">#{selectedOrder.id} - Items</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Customer: <span className="text-gray-800 font-medium">{selectedOrder.customer?.name ?? 'Guest'}</span>{selectedOrder.customer?.phone ? ` \u2014 ${selectedOrder.customer.phone}` : ''}{selectedOrder.table ? ` | Table: ${selectedOrder.table?.name ?? selectedOrder.table}` : ''}</span>
                    <span>{(selectedOrder.created_at ?? '').slice(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <select
                        value={selectedOrder.status ?? 'Pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Payment:</span>
                      <select
                        value={selectedOrder.payment_status ?? 'Unpaid'}
                        onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
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
                        const name = item.product?.name ?? item.name ?? 'Unknown'
                        const price = Number(item.unit_price ?? item.price ?? 0)
                        const qty = item.qty ?? 1
                        const size = item.size?.name ?? ''
                        const sugar = item.sugarLevel?.name ?? ''
                        const ice = item.iceLevel?.name ?? ''
                        const addOn = (item.addons ?? []).map((a) => a.addon?.name).filter(Boolean).join(', ')
                        return (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 text-gray-800">
                              <div>{name}</div>
                              <div className="text-xs text-gray-400 space-x-1">
                                {size && <span>{size}</span>}
                                {sugar && <><span>|</span><span>{sugar}</span></>}
                                {ice && <><span>|</span><span>{ice}</span></>}
                                {addOn && <><span>|</span><span>{addOn}</span></>}
                              </div>
                            </td>
                            <td className="py-2 text-gray-600">{qty}</td>
                            <td className="py-2 text-gray-600 text-right">${price.toFixed(2)}</td>
                            <td className="py-2 text-gray-800 text-right">${(qty * price).toFixed(2)}</td>
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
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const w = window.open('', '_blank')
                      const o = selectedOrder
                      const itemsHtml = (o.items ?? []).map(item => {
                        const name = item.product?.name ?? item.name ?? 'Unknown'
                        const qty = item.qty ?? 1
                        const price = Number(item.unit_price ?? item.price ?? 0)
                        const size = item.size?.name ?? ''
                        const sugar = item.sugarLevel?.name ?? ''
                        const ice = item.iceLevel?.name ?? ''
                        const addOn = (item.addons ?? []).map(a => a.addon?.name).filter(Boolean).join(', ')
                        const vars = [size, sugar, ice, addOn].filter(Boolean).join(' | ')
                        return `<tr><td style="padding:4px 8px">${name}${vars ? '<br><span style="color:#888;font-size:11px">'+vars+'</span>' : ''}</td><td style="padding:4px 8px;text-align:center">${qty}</td><td style="padding:4px 8px;text-align:right">$${price.toFixed(2)}</td><td style="padding:4px 8px;text-align:right">$${(qty * price).toFixed(2)}</td></tr>`
                      }).join('')
                      w.document.write(`
                        <html><head><title>Receipt #${o.id}</title>
                        <style>
                          body { font-family: 'Courier New', monospace; font-size: 13px; margin: 20px; }
                          h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
                          .info { text-align: center; color: #555; margin-bottom: 16px; font-size: 12px; }
                          table { width: 100%; border-collapse: collapse; }
                          th { border-bottom: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 12px; }
                          th.right { text-align: right; }
                          td { padding: 6px 8px; }
                          .total { border-top: 2px solid #333; font-weight: bold; font-size: 15px; }
                          .total td { padding-top: 8px; }
                          hr { border: none; border-top: 1px dashed #999; margin: 12px 0; }
                          .footer { text-align: center; color: #888; font-size: 11px; margin-top: 16px; }
                        </style></head><body>
                        <h1>Visal Cafe</h1>
                        <div class="info">
                          Receipt #${o.id}<br>
                          ${o.customer?.name ?? 'Guest'}${o.customer?.phone ? ' &mdash; '+o.customer.phone : ''}${o.table ? ' | Table: '+(o.table?.name??o.table) : ''}<br>
                          ${(o.created_at ?? '').slice(0, 10)}<br>
                          Status: ${o.status ?? 'Pending'} | Payment: ${o.payment_status ?? 'Unpaid'}
                        </div>
                        <hr>
                        <table>
                          <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th class="right">Price</th><th class="right">Subtotal</th></tr></thead>
                          <tbody>${itemsHtml}</tbody>
                          <tfoot><tr class="total"><td colspan="3" style="text-align:right">Total</td><td style="text-align:right">$${Number(o.total ?? 0).toFixed(2)}</td></tr></tfoot>
                        </table>
                        <hr>
                        <div class="footer">Thank you for your visit!</div>
                        <script>window.print();window.close();</script>
                        </body></html>
                      `)
                      w.document.close()
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Print Receipt
                  </button>
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
