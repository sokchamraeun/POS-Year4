// src/pages/staff/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import StatCard from './components/StatCard'
import RevenueChart from './components/RevenueChart'
import RecentOrdersTable from './components/RecentOrdersTable'
import TopProducts from './components/TopProducts'
import ProductManagement from './components/ProductManagement'
import OrderDetailModal from './components/OrderDetailModal'
import { useDashboardData } from './hooks/useDashboardData'
import { useOrderPolling } from './hooks/useOrderPolling'
import { updateOrder } from './utils/api'
import Loader from '../../../components/shared/Loader.jsx'
import { getTodayDate, calculateCustomDateRange } from './utils/helpers'

export default function Dashboard() {
  const [period, setPeriod] = useState('daily')
  const [fromDate, setFromDate] = useState(() =>
    new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)
  )
  const [toDate, setToDate] = useState(getTodayDate())
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const {
    loading,
    stats,
    chartData,
    topProducts,
    products,
    recentOrders,
    allOrders,
    profitDataRef,
    setStats,
    setRecentOrders,
    setAllOrders,
    setChartData,
  } = useDashboardData()

  const { newOrderAlert } = useOrderPolling(
    allOrders,
    setAllOrders,
    setStats,
    setChartData,
    () => {},
    setRecentOrders,
    profitDataRef
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (period === 'custom') {
      if (!fromDate) {
        setFromDate(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
      }

      if (!toDate) {
        setToDate(getTodayDate())
      }
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

  const handleStatusChange = async (orderId, newStatus) => {
    const order =
      allOrders.find((o) => o.id === orderId) ??
      recentOrders.find((o) => o.id === orderId)

    setRecentOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )

    setSelectedOrder((prev) =>
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

  const handlePaymentChange = async (orderId, newPayment) => {
    const order =
      allOrders.find((o) => o.id === orderId) ??
      recentOrders.find((o) => o.id === orderId)

    setRecentOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: newPayment } : o
      )
    )

    setAllOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, payment_status: newPayment } : o
      )

      const today = getTodayDate()

      const ordersToday = updated.filter((o) => {
        const d = new Date(o.created_at ?? '')
        if (isNaN(d)) return false

        const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
        return kh.toISOString().slice(0, 10) === today
      })

      const paidToday = ordersToday.filter((o) => o.payment_status === 'Paid')

      const revenueToday = paidToday.reduce(
        (sum, o) => sum + Number(o.total ?? 0),
        0
      )

      setStats((prevStats) =>
        prevStats.map((s) =>
          s.label === 'Total Revenue Today'
            ? {
                ...s,
                value: `$${revenueToday.toFixed(2)}`,
                change: `${ordersToday.length} orders`,
              }
            : s.label === 'Orders Today'
              ? {
                  ...s,
                  value: String(ordersToday.length),
                  change: `$${revenueToday.toFixed(2)}`,
                }
              : s
        )
      )

      return updated
    })

    setSelectedOrder((prev) =>
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

  if (loading) return <Loader text="Loading dashboard" />

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-900 to-teal-700 bg-clip-text text-transparent">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Welcome back! Here's what's happening today.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl shadow-teal-900/10 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                <Clock className="h-5 w-5 text-teal-600" />
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold leading-none text-slate-800">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {newOrderAlert && (
            <div className="mb-6 rounded-2xl border border-teal-800/20 bg-teal-50/50 px-4 py-3 text-sm font-semibold text-teal-700 backdrop-blur-sm">
              🔔 New order received
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>

          <div className="mb-6 flex flex-col gap-6 lg:flex-row">
            <div className="flex w-full lg:w-1/2">
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

            <div className="flex w-full lg:w-1/2">
              <RecentOrdersTable
                recentOrders={recentOrders}
                newOrderAlert={newOrderAlert}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
                onViewDetail={setSelectedOrder}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopProducts topProducts={topProducts} />
            <ProductManagement products={products} />
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