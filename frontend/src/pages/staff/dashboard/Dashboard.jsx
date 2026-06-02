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
import { useOrderPolling } from './hooks/useOrderPolling'
import { updateOrder } from './utils/api'
import { getTodayDate, calculateCustomDateRange } from './utils/helpers'

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
  const [toDate, setToDate] = useState(getTodayDate())
  const [selectedOrder, setSelectedOrder] = useState(null)
  
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
    setRecentOrders
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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {/* Animated Coffee Cup */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 animate-ping-slow">
                  <div className="w-full h-full rounded-full bg-teal-200 opacity-30"></div>
                </div>
                <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
                  <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  </svg>
                </div>
                {/* Steam animation */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-teal-300 rounded-full animate-steam-1"></div>
                    <div className="w-1 h-4 bg-teal-300 rounded-full animate-steam-2"></div>
                    <div className="w-1 h-2 bg-teal-300 rounded-full animate-steam-3"></div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading Dashboard</h2>
              <p className="text-slate-400 text-sm mb-6">Please wait while we fetch your data...</p>
              
              {/* Progress Bar */}
              <div className="w-64 mx-auto">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full animate-loading-bar"></div>
                </div>
              </div>
              
              {/* Loading dots */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-loading-dot-1"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-loading-dot-2"></div>
                <div className="w-2 h-2 bg-teal-600 rounded-full animate-loading-dot-3"></div>
              </div>
            </div>
          </main>
        </div>
        
        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes ping-slow {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.1; transform: scale(1.1); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes steam-1 {
            0% { transform: translateY(0) translateX(0); opacity: 0.6; }
            100% { transform: translateY(-20px) translateX(-5px); opacity: 0; }
          }
          @keyframes steam-2 {
            0% { transform: translateY(0) translateX(0); opacity: 0.6; }
            100% { transform: translateY(-25px) translateX(0); opacity: 0; }
          }
          @keyframes steam-3 {
            0% { transform: translateY(0) translateX(0); opacity: 0.6; }
            100% { transform: translateY(-18px) translateX(5px); opacity: 0; }
          }
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          @keyframes loading-dot-1 {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes loading-dot-2 {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes loading-dot-3 {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .animate-bounce-slow {
            animation: bounce-slow 1.5s ease-in-out infinite;
          }
          .animate-steam-1 {
            animation: steam-1 2s ease-out infinite;
          }
          .animate-steam-2 {
            animation: steam-2 2.5s ease-out infinite;
          }
          .animate-steam-3 {
            animation: steam-3 1.8s ease-out infinite;
          }
          .animate-loading-bar {
            animation: loading-bar 2s ease-in-out infinite;
          }
          .animate-loading-dot-1 {
            animation: loading-dot-1 1.2s ease-in-out infinite;
          }
          .animate-loading-dot-2 {
            animation: loading-dot-2 1.2s ease-in-out 0.3s infinite;
          }
          .animate-loading-dot-3 {
            animation: loading-dot-3 1.2s ease-in-out 0.6s infinite;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
          </div>

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