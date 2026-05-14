import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const stats = [
  { label: 'Total Revenue', value: '$12,450', change: '+12.5%', color: 'bg-green-500' },
  { label: 'Orders Today', value: '48', change: '+8.2%', color: 'bg-blue-500' },
  { label: 'Products', value: '156', change: '+3.1%', color: 'bg-yellow-500' },
  { label: 'Customers', value: '892', change: '+18.7%', color: 'bg-purple-500' },
]

const chartData = {
  daily: [
    { label: 'Mon', revenue: 1240, orders: 28 },
    { label: 'Tue', revenue: 980, orders: 22 },
    { label: 'Wed', revenue: 1560, orders: 35 },
    { label: 'Thu', revenue: 1820, orders: 40 },
    { label: 'Fri', revenue: 2100, orders: 48 },
    { label: 'Sat', revenue: 1890, orders: 42 },
    { label: 'Sun', revenue: 1450, orders: 32 },
  ],
  monthly: [
    { label: 'Jan', revenue: 18500, orders: 420 },
    { label: 'Feb', revenue: 16200, orders: 380 },
    { label: 'Mar', revenue: 21000, orders: 490 },
    { label: 'Apr', revenue: 19800, orders: 460 },
    { label: 'May', revenue: 23400, orders: 530 },
    { label: 'Jun', revenue: 22100, orders: 510 },
  ],
  yearly: [
    { label: '2022', revenue: 185000, orders: 4200 },
    { label: '2023', revenue: 210000, orders: 4800 },
    { label: '2024', revenue: 245000, orders: 5500 },
    { label: '2025', revenue: 278000, orders: 6200 },
    { label: '2026', revenue: 12450, orders: 48 },
  ],
}

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

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')

  const data = chartData[period]
  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.orders])) * 1.15
  const barWidth = Math.min(plotW / data.length * 0.22, 20)

  function xCenter(i) {
    return PAD.left + (i + 0.5) * (plotW / data.length)
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
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
              {[
                { name: 'Americano', qty: 185 },
                { name: 'Caffe Latte', qty: 152 },
                { name: 'Mocha', qty: 134 },
                { name: 'Cappuccino', qty: 98 },
                { name: 'Caramel Macchiato', qty: 76 },
              ].map((p) => {
                const pct = (p.qty / 185) * 100
                return (
                  <div key={p.name} className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-700 w-36 truncate">{p.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{p.qty}</span>
                  </div>
                )
              })}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels</h2>
              {[
                { name: 'Espresso', stock: 60, max: 80 },
                { name: 'Americano', stock: 50, max: 80 },
                { name: 'Cold Brew', stock: 0, max: 60 },
                { name: 'Caffe Latte', stock: 40, max: 80 },
                { name: 'Mocha', stock: 35, max: 80 },
              ].map((p) => {
                const pct = (p.stock / p.max) * 100
                const color = pct <= 10 ? 'from-red-400 to-red-600' : pct <= 50 ? 'from-yellow-400 to-orange-500' : 'from-green-400 to-green-600'
                return (
                  <div key={p.name} className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-700 w-36 truncate">{p.name}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-sm w-10 text-right ${p.stock === 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {p.stock}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
