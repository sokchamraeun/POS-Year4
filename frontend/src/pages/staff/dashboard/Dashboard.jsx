// src/pages/staff/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import StatCard from './components/StatCard'
import RevenueChart from './components/RevenueChart'
import RecentOrdersTable from './components/RecentOrdersTable'
import TopProducts from './components/TopProducts'
import ProductsList from './components/ProductsList'
import OrderDetailModal from './components/OrderDetailModal'
import { useDashboardData } from './hooks/useDashboardData'
import { useNotificationSound } from './hooks/useNotificationSound'
import { useOrderPolling } from './hooks/useOrderPolling'
import { updateOrder } from './utils/api'
import { getTodayDate, calculateCustomDateRange } from './utils/helpers'

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
  const [toDate, setToDate] = useState(getTodayDate())
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  const { playNotificationSound } = useNotificationSound()
  const {
    loading,
    stats,
    chartData,
    topProducts,
    products,
    recentOrders,
    allOrders,
    setStats,
    setRecentOrders,
    setAllOrders,
    setChartData,
  } = useDashboardData()
  
  const { newOrderAlert, setNewOrderAlert } = useOrderPolling(
    allOrders, 
    setAllOrders, 
    setStats, 
    setChartData, 
    () => {}, // setProducts would need to be added to useDashboardData return
    setRecentOrders, 
    playNotificationSound
  )

  useEffect(() => {
    if (period === 'custom') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!fromDate) setFromDate(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
      if (!toDate) setToDate(getTodayDate())
    }
  }, [period, fromDate, toDate])

  const customData = period === 'custom' && fromDate && toDate
    ? calculateCustomDateRange(allOrders, fromDate, toDate)
    : null

  const data = period === 'custom' ? (customData ?? [{ label: 'No data', revenue: 0, orders: 0 }]) : chartData[period]

  const handleStatusChange = async (orderId, newStatus) => {
    const order = allOrders.find(o => o.id === orderId) ?? recentOrders.find(o => o.id === orderId)
    
    setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev)
    
    await updateOrder(orderId, {
      status: newStatus,
      payment_status: order?.payment_status ?? 'Unpaid',
      total: Number(order?.total ?? 0),
      customer_id: order?.customer_id ?? null,
      table_id: order?.table_id ?? null,
      payment_method: order?.payment_method ?? null,
    })
  }

  const handlePaymentChange = async (orderId, newPayment) => {
    const order = allOrders.find(o => o.id === orderId) ?? recentOrders.find(o => o.id === orderId)
    
    setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPayment } : o))
    setAllOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, payment_status: newPayment } : o)
      const today = getTodayDate()
      const ordersToday = updated.filter(o => {
        const d = new Date(o.created_at ?? '')
        if (isNaN(d)) return false
        const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
        return kh.toISOString().slice(0, 10) === today
      })
      const paidToday = ordersToday.filter(o => o.payment_status === 'Paid')
      const revenueToday = paidToday.reduce((s, o) => s + Number(o.total ?? 0), 0)
      
      setStats(prevStats => prevStats.map(s =>
        s.label === 'Total Revenue Today'
          ? { ...s, value: `$${revenueToday.toFixed(2)}`, change: `${ordersToday.length} orders` }
          : s.label === 'Orders Today'
          ? { ...s, value: String(ordersToday.length), change: `$${revenueToday.toFixed(2)}` }
          : s
      ))
      return updated
    })
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, payment_status: newPayment } : prev)
    
    await updateOrder(orderId, {
      status: order?.status ?? 'New',
      payment_status: newPayment,
      total: Number(order?.total ?? 0),
      customer_id: order?.customer_id ?? null,
      table_id: order?.table_id ?? null,
      payment_method: order?.payment_method ?? null,
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={() => playNotificationSound()}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Test Sound
            </button>
          </div>

          <style>{`@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slideDown{animation:slideDown .4s ease-out}`}</style>
          {newOrderAlert && (
            <div className="fixed top-4 right-4 z-50 animate-slideDown">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">New Order Received!</p>
                  <p className="text-white/80 text-xs mt-0.5">Check recent orders table</p>
                </div>
                <button
                  onClick={() => setNewOrderAlert(false)}
                  className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>

          <div className="flex gap-6 mb-6 flex-col lg:flex-row">
            <div className="lg:w-1/2 w-full flex">
              <RevenueChart
                period={period}
                setPeriod={setPeriod}
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
                data={data}
              />
            </div>
            <div className="lg:w-1/2 w-full flex">
              <RecentOrdersTable
                recentOrders={recentOrders}
                newOrderAlert={newOrderAlert}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
                onViewDetail={setSelectedOrder}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TopProducts topProducts={topProducts} />
            <ProductsList products={products} />
          </div>

          {selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusChange={handleStatusChange}
              onPaymentChange={handlePaymentChange}
            />
          )}
        </main>
      </div>
    </div>
  )
}