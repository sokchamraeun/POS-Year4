import { useState, useEffect, useCallback } from 'react'
import { List, CheckCircle, Clock, DollarSign } from 'lucide-react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import { useSocket, useSocketConnect } from '../../hooks/useSocket'
import { calcDiscount, getPromotionLabel } from '../../utils/promotion.js'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
// Read the token at call time (not module-load) so it isn't captured stale
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

function mapOrder(o) {
  return {
    id: `#${o.id}`,
    customer: o.customer?.name ?? 'Guest',
    phone: o.customer?.phone ?? '-',
    table: o.table?.name ?? '-',
    items: o.items?.reduce((s, i) => s + i.qty, 0) ?? 0,
    total: Number(o.total ?? 0),
    discount: Number(o.discount ?? 0),
    date: (o.created_at ?? '').slice(0, 10),
    datetime: (() => {
      const d = new Date(o.created_at ?? '')
      if (isNaN(d)) return ''
      const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
      return kh.toISOString().slice(0, 19).replace('T', ' ')
    })(),
    status: o.status ?? 'New',
    payment: o.payment_status ?? 'Unpaid',
    paymentMethod: o.payment_method ?? '-',
    detail: (o.items ?? []).map((i) => ({
      name: i.product?.name ?? 'Unknown',
      qty: i.qty,
      price: Number(i.unit_price ?? 0),
      size: i.size?.name ?? '',
      sugar: i.sugar_level?.name ?? '',
      ice: i.ice_level?.name ?? '',
      addOn: i.addons?.map((a) => a.addon?.name).filter(Boolean).join(', ') ?? '',
      promotion: i.promotion ?? null,
    })),
    printedBy: o.printed_by?.name ?? null,
  }
}

const recipes = {
  Americano: [
    { name: 'Coffee Beans', qty: 18, unit: 'g' },
    { name: 'Water', qty: 200, unit: 'ml' },
  ],
  'Caffe Latte': [
    { name: 'Coffee Beans', qty: 18, unit: 'g' },
    { name: 'Milk', qty: 200, unit: 'ml' },
  ],
  Mocha: [
    { name: 'Coffee Beans', qty: 18, unit: 'g' },
    { name: 'Milk', qty: 150, unit: 'ml' },
    { name: 'Chocolate Syrup', qty: 30, unit: 'ml' },
  ],
  Cappuccino: [
    { name: 'Coffee Beans', qty: 18, unit: 'g' },
    { name: 'Milk', qty: 150, unit: 'ml' },
  ],
  Espresso: [
    { name: 'Coffee Beans', qty: 9, unit: 'g' },
    { name: 'Water', qty: 30, unit: 'ml' },
  ],
  'Caramel Macchiato': [
    { name: 'Coffee Beans', qty: 18, unit: 'g' },
    { name: 'Milk', qty: 200, unit: 'ml' },
    { name: 'Caramel Syrup', qty: 20, unit: 'ml' },
  ],
  'Matcha Latte': [
    { name: 'Matcha Powder', qty: 10, unit: 'g' },
    { name: 'Milk', qty: 200, unit: 'ml' },
  ],
  'Cold Brew': [
    { name: 'Coffee Beans', qty: 30, unit: 'g' },
    { name: 'Water', qty: 300, unit: 'ml' },
  ],
}

const tabs = ['All', 'Completed', 'Processing', 'New', 'Cancelled']

const statusColors = {
  Completed: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  Processing: 'text-sky-700 bg-sky-50 border border-sky-200',
  New: 'text-teal-800 bg-teal-50 border border-teal-200',
  Cancelled: 'text-rose-700 bg-rose-50 border border-rose-200',
}

const paymentColors = {
  Paid: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  Unpaid: 'text-rose-700 bg-rose-50 border border-rose-200',
  Refunded: 'text-slate-600 bg-slate-100 border border-slate-200',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deductMsg, setDeductMsg] = useState('')
  const [search, setSearch] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  function loadOrders() {
    setLoading(true)
    fetch(`${API_URL}/orders?page=${page}`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((json) => {
        const apiOrders = (json.data ?? []).map(mapOrder)
        setOrders(apiOrders)
        setLastPage(json.last_page ?? 1)
        setTotal(json.total ?? 0)
      })
      .catch(() => {
        setOrders([])
      })
      .finally(() => setLoading(false))
  }

  function pollOrders() {
    fetch(`${API_URL}/orders?page=1&per_page=50`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((json) => {
        const apiOrders = (json.data ?? []).map(mapOrder)
        setOrders(apiOrders)
        setLastPage(json.last_page ?? 1)
        setTotal(json.total ?? 0)
      })
      .catch(() => {})
  }

  function clearLocal() {
    localStorage.removeItem('newOrders')
    loadOrders()
  }

  useSocketConnect()

  useSocket('order:created', useCallback((order) => {
    const mapped = mapOrder(order)
    setOrders(prev => [mapped, ...prev])
    setTotal(prev => prev + 1)
  }, []))

  useSocket('order:updated', useCallback((order) => {
    const mapped = mapOrder(order)
    setOrders(prev => prev.map(o => o.id === mapped.id ? mapped : o))
  }, []))

  useEffect(() => {
    loadOrders()
  }, [page])

  useEffect(() => {
    pollOrders()
    const interval = setInterval(pollOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (deductMsg) {
      const t = setTimeout(() => setDeductMsg(''), 4000)
      return () => clearTimeout(t)
    }
  }, [deductMsg])

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const filtered = orders
    .filter((o) => activeTab === 'All' || o.status === activeTab)
    .filter((o) => !todayOnly || o.date === todayStr)
    .filter((o) => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search))

  const summary = {
    shown: filtered.length,
    paid: orders.filter((o) => o.payment === 'Paid').length,
    unpaid: orders.filter((o) => o.payment === 'Unpaid').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  }

  function handleStatusChange(orderId, newStatus) {
    const numericId = orderId.startsWith('#') ? orderId.slice(1) : orderId
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev))

    fetch(`${API_URL}/orders/${numericId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status: newStatus }),
    })

    if (newStatus === 'Completed') {
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        const consumed = {}
        order.detail.forEach((item) => {
          const recipe = recipes[item.name]
          if (recipe) {
            recipe.forEach((ing) => {
              const key = `${ing.name} (${ing.unit})`
              consumed[key] = (consumed[key] || 0) + ing.qty * item.qty
            })
          }
        })
        const lines = Object.entries(consumed).map(([k, v]) => `-${v} ${k}`).join(', ')
        setDeductMsg(`Ingredients deducted for ${order.id}: ${lines}`)
      }
    }
  }

  function handlePaymentChange(orderId, newPayment) {
    const numericId = orderId.startsWith('#') ? orderId.slice(1) : orderId
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment: newPayment } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, payment: newPayment } : prev))

    fetch(`${API_URL}/orders/${numericId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ payment_status: newPayment }),
    })
  }

  if (loading) return <Loader text="Loading Orders" />

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-white p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-900">
                Orders
              </h1>
              <p className="mt-1 text-sm text-teal-600/80">Manage and track customer orders with clean status and payment tracking</p>
            </div>
            <button
              onClick={clearLocal}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-100"
            >
              Clear Local
            </button>
          </div>

          {deductMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-50 p-4 shadow-lg shadow-emerald-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-700">{deductMsg}</span>
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="absolute left-0 top-0 h-full w-1 bg-slate-200 transition-all duration-300" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Shown Orders</p>
                  <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">{summary.shown}</p>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">After search and filter</p>
                </div>
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <List className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="absolute left-0 top-0 h-full w-1 bg-slate-200 transition-all duration-300" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Paid</p>
                  <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">{summary.paid}</p>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">Paid orders loaded</p>
                </div>
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="absolute left-0 top-0 h-full w-1 bg-slate-200 transition-all duration-300" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Unpaid</p>
                  <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">{summary.unpaid}</p>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">Need follow up</p>
                </div>
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="absolute left-0 top-0 h-full w-1 bg-slate-200 transition-all duration-300" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Loaded Revenue</p>
                  <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">${summary.revenue.toFixed(2)}</p>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">Current page / polling data</p>
                </div>
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-teal-500 bg-teal-500 shadow-lg shadow-teal-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-teal-700/20 bg-white shadow-2xl shadow-teal-900/15 ring-1 ring-white/70">
            <div className="flex flex-col gap-3 border-b border-teal-200/80 bg-gradient-to-r from-teal-50 via-white to-teal-100 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="relative flex-1 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order ID, customer, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-teal-200 bg-white px-10 py-2.5 text-sm text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-transparent p-1 transition-colors hover:border-teal-200 hover:bg-teal-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => setTodayOnly(!todayOnly)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  todayOnly
                    ? 'border border-teal-600 bg-gradient-to-r from-teal-700 to-teal-500 text-white shadow-lg shadow-teal-900/15'
                    : 'border border-teal-200 bg-white text-slate-700 shadow-sm hover:bg-teal-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </button>
              {(search || todayOnly) && (
                <button
                  onClick={() => { setSearch(''); setTodayOnly(false) }}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Show All
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 overflow-x-auto border-b border-teal-200/80 bg-teal-50 px-4 py-4 sm:px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'border border-teal-600 bg-gradient-to-r from-teal-700 to-teal-500 px-4 py-2 text-white shadow-md shadow-teal-900/15'
                      : 'border border-teal-200 bg-white px-4 py-2 text-slate-500 hover:border-teal-400 hover:text-teal-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-teal-200 bg-gradient-to-r from-teal-900 to-teal-700 text-left font-semibold text-white">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Table</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-teal-100 bg-white transition-colors duration-200 hover:bg-teal-50/80">
                      <td className="px-6 py-4 font-bold text-teal-800">{order.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{order.customer}</td>
                      <td className="px-6 py-4 text-slate-500">{order.phone}</td>
                      <td className="px-6 py-4 text-slate-500">{order.table || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{order.items}</td>
                      <td className="px-6 py-4 font-extrabold text-teal-800">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-500">{order.date}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold outline-none transition-all ${statusColors[order.status]}`}
                          style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                        >
                          <option value="New">New</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.payment}
                          onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold outline-none transition-all ${paymentColors[order.payment]}`}
                          style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-600">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 transition-all hover:border-teal-600 hover:bg-teal-700 hover:text-white"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center border-t border-teal-100 bg-white px-6 py-14 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-2xl">☕</div>
                  <h3 className="text-base font-extrabold text-slate-800">No orders found</h3>
                  <p className="mt-1 text-sm text-slate-500">Try changing the search, status tab, or Today filter.</p>
                </div>
              )}
            </div>

            {lastPage > 1 && !loading && (
              <div className="flex flex-col gap-3 border-t border-teal-200 bg-teal-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span className="text-xs font-medium text-slate-500">Page {page} of {lastPage} ({total} orders)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${page <= 1 ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-teal-200 bg-white text-slate-600 hover:bg-teal-100'}`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: lastPage }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, i) =>
                      item === '...' ? (
                        <span key={`e${i}`} className="px-2 py-1.5 text-xs text-slate-400">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${item === page ? 'border-teal-600 bg-teal-700 text-white shadow-md' : 'border-teal-200 bg-white text-slate-600 hover:bg-teal-100'}`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= lastPage}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${page >= lastPage ? 'cursor-not-allowed border-slate-100 text-slate-300' : 'border-teal-200 bg-white text-slate-600 hover:bg-teal-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md">
              <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-teal-700/25 bg-white shadow-2xl shadow-teal-900/20 ring-1 ring-white/70">
                <div className="flex items-center justify-between border-b border-teal-200 bg-gradient-to-r from-teal-700 to-teal-500 px-6 py-4">
                  <h2 className="text-lg font-extrabold text-white">Order Detail {selectedOrder.id}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="rounded-xl border border-white/10 p-1 text-teal-100 transition-colors hover:bg-white/10 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto px-4 py-4 sm:px-6">
                  <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-teal-200 bg-white p-4 text-sm text-slate-500 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <span><span className="text-slate-400">Customer:</span> <span className="font-bold text-slate-800">{selectedOrder.customer}</span></span>
                      <span className="text-teal-300">•</span>
                      <span>{selectedOrder.phone}</span>
                      {selectedOrder.table && selectedOrder.table !== '-' ? <><span className="text-teal-300">•</span><span>Table: <span className="font-bold text-teal-800">{selectedOrder.table}</span></span></> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {selectedOrder.printedBy && <span><span className="text-slate-400">Staff:</span> <span className="font-bold text-slate-800">{selectedOrder.printedBy}</span></span>}
                      <span className="ml-auto text-slate-400">{selectedOrder.datetime}</span>
                    </div>
                  </div>
                  <div className="mb-4 grid gap-3 border-b border-teal-200 pb-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-sm font-medium text-slate-500">Method:</span>
                      <span className="text-sm font-bold capitalize text-slate-800">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-sm font-medium text-slate-500">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className={`rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-500/15 ${statusColors[selectedOrder.status]?.split(' ')[0] || 'text-slate-600'}`}
                      >
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-sm font-medium text-slate-500">Payment:</span>
                      <select
                        value={selectedOrder.payment}
                        onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value)}
                        className={`rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-500/15 ${paymentColors[selectedOrder.payment]?.split(' ')[0] || 'text-slate-600'}`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  <table className="w-full min-w-[980px] text-sm">
                    <thead>
                      <tr className="border-b border-teal-200 bg-teal-50 text-left font-bold text-teal-900">
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Sugar</th>
                        <th className="pb-2">Ice</th>
                        <th className="pb-2">Add-ons</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.detail.map((item, i) => {
                        const recipe = recipes[item.name]
                        return (
                          <tr key={i} className="border-b border-teal-100 bg-white hover:bg-teal-50/70">
                            <td className="py-3 font-bold text-slate-800">
                              {item.name}
                              {item.promotion && item.promotion.type !== 'combo_discount' && item.promotion.type !== 'combo' && (
                                <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                  ({getPromotionLabel(item.promotion)})
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-600">{item.size || '-'}</td>
                            <td className="py-3 text-slate-600">{item.sugar || '-'}</td>
                            <td className="py-3 text-slate-600">{item.ice || '-'}</td>
                            <td className="py-3 text-slate-600">{item.addOn || '-'}</td>
                            <td className="py-3 font-semibold text-slate-700">{item.qty}</td>
                            <td className="py-3 text-right text-slate-600">${item.price.toFixed(2)}</td>
                            <td className="py-3 text-right font-bold text-slate-800">${(item.qty * item.price).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} className="pt-4 text-right text-sm font-medium text-slate-500">Subtotal</td>
                        <td className="pt-4 text-right text-sm font-medium text-slate-500">${(selectedOrder.total + selectedOrder.discount).toFixed(2)}</td>
                      </tr>
                      {selectedOrder.discount > 0 && selectedOrder.detail.filter(i => i.promotion).length > 0 && (
                        selectedOrder.detail.filter(i => i.promotion).map((item, idx) => {
                          const d = calcDiscount(item.price, item.promotion, item.qty)
                          if (d <= 0) return null
                          const displayQty = item.promotion?.type === 'buy_x_get_y' ? Math.round(d / item.price) : item.qty
                          return (
                            <tr key={idx}>
                              <td colSpan={7} className="pt-1 text-right text-[11px] font-bold text-emerald-700">
                                {getPromotionLabel(item.promotion)} &mdash; {item.name}{item.size ? ` (${item.size})` : ''} x{displayQty}
                              </td>
                              <td className="pt-1 text-right text-[11px] font-bold text-emerald-700">-${d.toFixed(2)}</td>
                            </tr>
                          )
                        })
                      )}
                      {selectedOrder.discount > 0 && (
                        <tr>
                          <td colSpan={7} className="border-t border-dashed border-emerald-200 pt-2 text-right text-sm font-bold text-emerald-700">
                            {selectedOrder.detail.some(i => i.promotion) ? (() => { const pNames = [...new Set(selectedOrder.detail.filter(i=>i.promotion).map(i=>i.promotion.name).filter(Boolean))].join(', '); return `Total Discount${pNames ? ' ('+pNames+')' : ''}` })() : 'Promotion'}
                          </td>
                          <td className="border-t border-dashed border-emerald-200 pt-2 text-right text-sm font-bold text-emerald-700">-${selectedOrder.discount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={7} className="pt-4 text-right text-base font-extrabold text-slate-900">Total</td>
                        <td className="pt-4 text-right text-base font-extrabold text-teal-800">${selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-teal-200 bg-teal-50 px-6 py-4">
                  <button
                    onClick={() => {
                      const numericId = selectedOrder.id.startsWith('#') ? selectedOrder.id.slice(1) : selectedOrder.id
                      fetch(`${API_URL}/orders/${numericId}/mark-printed`, { method: 'POST', headers: authHeaders() }).catch(() => {})
                      const w = window.open('', '_blank')
                      const o = selectedOrder
                      const itemsHtml = o.detail.map((item, idx) => {
                        const vars = [item.size, item.sugar, item.ice, item.addOn].filter(Boolean).join('|')
                        const promLabel = item.promotion && item.promotion.type !== 'combo_discount' && item.promotion.type !== 'combo' ? `<br><span style="color:#0d9488;font-size:8px">${getPromotionLabel(item.promotion)}</span>` : ''
                        return `<tr><td style="padding:4px 4px;text-align:center;font-size:10px">${idx + 1}</td><td style="padding:4px 4px;font-size:10px">${item.name}${vars ? '<br><span style="color:#666;font-size:8px">'+vars+'</span>' : ''}${promLabel}</td><td style="padding:4px 4px;text-align:center;font-size:10px">${item.qty}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${item.price.toFixed(2)}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${(item.qty * item.price).toFixed(2)}</td></tr>`
                      }).join('')
                      w.document.write(`
                        <html><head><title>Receipt ${o.id}</title>
                        <style>
                          body { font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 8px; width: 58mm; font-weight: bold; }
                          h1 { font-size: 14px; text-align: center; margin-bottom: 4px; color: #0d9488; }
                          .info { text-align: center; color: #555; margin-bottom: 12px; font-size: 10px; }
                          table { width: 100%; border-collapse: collapse; }
                          th { border-bottom: 1px solid #333; padding: 4px 4px; text-align: left; font-size: 10px; }
                          th.right { text-align: right; }
                          td { padding: 4px 4px; font-size: 10px; }
                          .total { border-top: 2px solid #333; font-weight: bold; font-size: 12px; }
                          .total td { padding-top: 6px; }
                          hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
                          .footer { text-align: center; color: #888; font-size: 9px; margin-top: 12px; }
                        </style></head><body>
                        <h1>Visal Cafe</h1>
                        <div class="info">
                          ${o.id}<br>
                          ${o.customer}${o.phone !== '-' ? ' &mdash; '+o.phone : ''}${o.table !== '-' ? ' | Table: '+o.table : ''}<br>
                          ${o.datetime}<br>
                          Status: ${o.status} | Payment: ${o.payment}<br>
                          ${o.printedBy ? 'Staff: '+o.printedBy+'<br>' : ''}Free WIFI<br>Username: Visal<br>Password: 12345678
                        </div>
                        <hr>
                        <table>
                          <thead><tr><th style="text-align:center">No.</th><th>Item</th><th style="text-align:center">Qty</th><th class="right">Price</th><th class="right">Subtotal</th></tr></thead>
                          <tbody>${itemsHtml}</tbody>
                          <tfoot>${(() => {
                            const promoItems = o.detail.filter(i => i.promotion)
                            let html = ''
                            promoItems.forEach((item) => {
                              const d = calcDiscount(item.price, item.promotion, item.qty)
                              if (d <= 0) return
                              const displayQty = item.promotion?.type === 'buy_x_get_y' ? Math.round(d / item.price) : item.qty
                              html += `<tr><td colspan="4" style="text-align:right;font-size:9px;padding:1px 4px;color:#0d9488">${getPromotionLabel(item.promotion)} &mdash; ${item.name}${item.size ? ' ('+item.size+')' : ''} x${displayQty}</td><td style="text-align:right;font-size:9px;padding:1px 4px;color:#0d9488">-${d.toFixed(2)}</td></tr>`
                            })
                            if (html) {
                              const pNames = [...new Set(o.detail.filter(i=>i.promotion).map(i=>i.promotion.name).filter(Boolean))].join(', ')
                              html += `<tr><td colspan="4" style="text-align:right;font-size:10px;padding:2px 4px;color:#0d9488;border-top:1px dashed #ccc">Total Discount${pNames ? ' ('+pNames+')' : ''}</td><td style="text-align:right;font-size:10px;padding:2px 4px;color:#0d9488;border-top:1px dashed #ccc">-${o.discount.toFixed(2)}</td></tr>`
                            } else if (o.discount > 0) {
                              html += `<tr><td colspan="4" style="text-align:right;font-size:10px;padding:2px 4px;color:#0d9488">Promotion</td><td style="text-align:right;font-size:10px;padding:2px 4px;color:#0d9488">-${o.discount.toFixed(2)}</td></tr>`
                            }
                            if (html) {
                              const subtotal = o.total + o.discount
                              html = `<tr><td colspan="4" style="text-align:right;font-size:10px;padding:2px 4px;color:#666">Subtotal</td><td style="text-align:right;font-size:10px;padding:2px 4px;color:#666">$${subtotal.toFixed(2)}</td></tr>` + html
                            }
                            return html
                          })()}<tr class="total"><td colspan="4" style="text-align:right">Total</td><td style="text-align:right">$${o.total.toFixed(2)}</td></tr></tfoot>
                        </table>
                        <hr>
                        <div class="footer">Thank you for your visit!</div>
                        <script>window.print();window.close();</script>
                        </body></html>
                      `)
                      w.document.close()
                    }}
                    className="rounded-2xl border border-teal-600 bg-gradient-to-r from-teal-700 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:from-teal-600 hover:to-teal-600"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
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