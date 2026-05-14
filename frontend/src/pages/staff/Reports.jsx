import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'products', label: 'Products' },
]

const summary = {
  overview: [
    { label: 'Total Sales', value: '$124,580', change: '+15.3%', color: 'bg-green-500' },
    { label: 'Total Orders', value: '3,842', change: '+12.1%', color: 'bg-blue-500' },
    { label: 'Avg Order Value', value: '$32.40', change: '+4.2%', color: 'bg-purple-500' },
    { label: 'Total Customers', value: '1,256', change: '+22.7%', color: 'bg-yellow-500' },
  ],
  orders: [
    { label: 'Total Orders', value: '3,842', change: '+12.1%', color: 'bg-blue-500' },
    { label: 'Pending', value: '128', change: '+5.4%', color: 'bg-yellow-500' },
    { label: 'Completed', value: '3,421', change: '+14.8%', color: 'bg-green-500' },
    { label: 'Cancelled', value: '293', change: '-3.2%', color: 'bg-red-500' },
  ],
  revenue: [
    { label: 'Total Revenue', value: '$124,580', change: '+15.3%', color: 'bg-green-500' },
    { label: 'This Month', value: '$18,420', change: '+8.7%', color: 'bg-blue-500' },
    { label: 'Avg Daily', value: '$614', change: '+6.1%', color: 'bg-purple-500' },
    { label: 'Projected', value: '$142,000', change: '+14.0%', color: 'bg-yellow-500' },
  ],
  products: [
    { label: 'Total Products', value: '156', change: '+3.1%', color: 'bg-blue-500' },
    { label: 'Active', value: '142', change: '+4.4%', color: 'bg-green-500' },
    { label: 'Low Stock', value: '8', change: '+60.0%', color: 'bg-red-500' },
    { label: 'Out of Stock', value: '3', change: '0%', color: 'bg-yellow-500' },
  ],
}

const topProducts = [
  { name: 'Americano', qty: 845, revenue: 7520.50 },
  { name: 'Caffe Latte', qty: 712, revenue: 7760.80 },
  { name: 'Mocha', qty: 634, revenue: 7925.00 },
  { name: 'Cappuccino', qty: 521, revenue: 5991.50 },
  { name: 'Caramel Macchiato', qty: 487, revenue: 6769.30 },
]

const recentActivity = [
  { action: 'New order #1009 placed', time: '2 min ago', type: 'order' },
  { action: 'Inventory updated: Coffee Beans', time: '15 min ago', type: 'inventory' },
  { action: 'Order #1005 completed', time: '1 hr ago', type: 'order' },
  { action: 'New product added: Iced Latte', time: '3 hrs ago', type: 'product' },
  { action: 'Stock alert: Vanilla Syrup low', time: '5 hrs ago', type: 'alert' },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const currentSummary = summary[activeTab] || summary.overview

  const presets = [
    { label: 'Today', days: 0 },
    { label: 'This Week', days: 7 },
    { label: 'This Month', days: 30 },
    { label: 'This Year', days: 365 },
  ]

  function applyPreset(days) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setStartDate(start.toISOString().slice(0, 10))
    setEndDate(end.toISOString().slice(0, 10))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.days)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentSummary.map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <div className={`${s.color} text-white text-xs font-bold px-2.5 py-1 rounded-lg`}>
                    {s.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-right">Qty Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-800">
                        <span className="text-gray-400 mr-2">{i + 1}.</span> {p.name}
                      </td>
                      <td className="py-2.5 text-gray-600 text-right">{p.qty}</td>
                      <td className="py-2.5 text-gray-800 text-right font-medium">${p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      a.type === 'order' ? 'bg-blue-500' : a.type === 'inventory' ? 'bg-green-500' : a.type === 'alert' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{a.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
