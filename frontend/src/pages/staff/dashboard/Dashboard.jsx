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
import { updateOrder } from './utils/api'
import { getTodayDate, calculateCustomDateRange } from './utils/helpers'

import socket from '../../../socket'

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const [fromDate, setFromDate] = useState(() =>
    new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
  )
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

  // ===============================
  // 🚀 SOCKET REAL-TIME LISTENER
  // ===============================
  useEffect(() => {
    socket.on("new-order", (order) => {
      console.log("🔥 New order received:", order)

      playNotificationSound()

      // Add new order to UI instantly
      setAllOrders(prev => [order, ...prev])
      setRecentOrders(prev => [order, ...prev])

      // Update stats safely
      setStats(prev => {
        const updated = [...prev]
        return updated
      })
    })

    return () => {
      socket.off("new-order")
    }
  }, [])

  useEffect(() => {
    if (period === 'custom') {
      if (!fromDate) setFromDate(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
      if (!toDate) setToDate(getTodayDate())
    }
  }, [period, fromDate, toDate])

  const customData =
    period === 'custom' && fromDate && toDate
      ? calculateCustomDateRange(allOrders, fromDate, toDate)
      : null

  const data =
    period === 'custom'
      ? customData ?? [{ label: 'No data', revenue: 0, orders: 0 }]
      : chartData[period]

  // ===============================
  // ORDER STATUS UPDATE
  // ===============================
  const handleStatusChange = async (orderId, newStatus) => {
    const order =
      allOrders.find(o => o.id === orderId) ??
      recentOrders.find(o => o.id === orderId)

    setRecentOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    setAllOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    setSelectedOrder(prev =>
      prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
    )

    await updateOrder(orderId, {
      status: newStatus,
      payment_status: order?.payment_status ?? 'Unpaid',
      total: Number(order?.total ?? 0),
      customer_id: order?.customer_id ?? null,
      table_id: order?.table_id ?? null,
      payment_method: order?.payment_method ?? null,
    })
  }

  // ===============================
  // PAYMENT UPDATE
  // ===============================
  const handlePaymentChange = async (orderId, newPayment) => {
    const order =
      allOrders.find(o => o.id === orderId) ??
      recentOrders.find(o => o.id === orderId)

    setRecentOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, payment_status: newPayment } : o
      )
    )

    setAllOrders(prev => {
      const updated = prev.map(o =>
        o.id === orderId ? { ...o, payment_status: newPayment } : o
      )

      const today = getTodayDate()

      const ordersToday = updated.filter(o => {
        const d = new Date(o.created_at ?? '')
        if (isNaN(d)) return false
        const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
        return kh.toISOString().slice(0, 10) === today
      })

      const paidToday = ordersToday.filter(o => o.payment_status === 'Paid')

      const revenueToday = paidToday.reduce(
        (s, o) => s + Number(o.total ?? 0),
        0
      )

      setStats(prevStats =>
        prevStats.map(s =>
          s.label === 'Total Revenue Today'
            ? { ...s, value: `$${revenueToday.toFixed(2)}`, change: `${ordersToday.length} orders` }
            : s.label === 'Orders Today'
            ? { ...s, value: String(ordersToday.length), change: `$${revenueToday.toFixed(2)}` }
            : s
        )
      )

      return updated
    })

    setSelectedOrder(prev =>
      prev && prev.id === orderId
        ? { ...prev, payment_status: newPayment }
        : prev
    )

    await updateOrder(orderId, {
      status: order?.status ?? 'New',
      payment_status: newPayment,
      total: Number(order?.total ?? 0),
      customer_id: order?.customer_id ?? null,
      table_id: order?.table_id ?? null,
      payment_method: order?.payment_method ?? null,
    })
  }

  // ===============================
  // LOADING UI
  // ===============================
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

  // ===============================
  // MAIN UI
  // ===============================
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

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>

          {/* CHART + ORDERS */}
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
                newOrderAlert={true}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
                onViewDetail={setSelectedOrder}
              />
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TopProducts topProducts={topProducts} />
            <ProductsList products={products} />
          </div>

          {/* MODAL */}
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