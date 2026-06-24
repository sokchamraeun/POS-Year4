import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import Invoice from '../../components/customer/Invoice.jsx'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { useSocket, useSocketConnect } from '../../hooks/useSocket'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

function getImageUrl(image) {
  if (!image) return ''
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function History() {
  const { customer } = useCustomerAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [searchPhone, setSearchPhone] = useState('')

  const activePhone = customer?.phone || searchPhone
  const qrToken = sessionStorage.getItem('qr_token') || ''

  useSocketConnect()

  // When the customer arrived by scanning a table QR, show that table's order
  // history (while the table is still occupied) even without a phone/login.
  useEffect(() => {
    if (!qrToken) return

    async function fetchTableOrders(silent = false) {
      if (!silent) setLoading(true)
      setSearched(true)
      try {
        const res = await fetch(`${API_URL}/tables/by-token/${qrToken}/current-order`, {
          headers: { Accept: 'application/json' },
        })
        const data = await res.json()
        const tableOrders = Array.isArray(data?.orders) ? data.orders : []
        if (tableOrders.length) {
          setOrders((prev) => {
            const ids = new Set(tableOrders.map((o) => Number(o.id)))
            return [...tableOrders, ...prev.filter((o) => !ids.has(Number(o.id)))]
          })
        }
      } catch {
        // ignore
      } finally {
        if (!silent) setLoading(false)
      }
    }

    fetchTableOrders()
    const interval = setInterval(() => fetchTableOrders(true), 5000)
    return () => clearInterval(interval)
  }, [qrToken])

  useEffect(() => {
    if (!activePhone) return

    fetchOrders(activePhone)

    const interval = setInterval(() => {
      fetchOrders(activePhone, true)
    }, 5000)

    return () => clearInterval(interval)
  }, [activePhone])

  useSocket('order:updated', (updatedOrder) => {
    setOrders((prev) => {
      if (!orderBelongsToUser(updatedOrder)) return prev

      const exists = prev.some((order) => Number(order.id) === Number(updatedOrder.id))
      if (!exists) return prev

      return prev.map((order) =>
        Number(order.id) === Number(updatedOrder.id) ? updatedOrder : order
      )
    })
  })

  useSocket('order:created', (newOrder) => {
    if (!orderBelongsToUser(newOrder)) return

    setOrders((prev) => {
      const exists = prev.some((order) => Number(order.id) === Number(newOrder.id))
      if (exists) return prev
      return [newOrder, ...prev]
    })
  })

  function orderBelongsToUser(order) {
    if (customer?.id) {
      return Number(order.customer_id) === Number(customer.id)
    }

    if (activePhone) {
      const orderPhone =
        order.customer?.phone ||
        order.customer_phone ||
        order.phone ||
        order.customer?.customer_phone

      return String(orderPhone || '').trim() === String(activePhone).trim()
    }

    return false
  }

  async function fetchOrders(phoneNumber, silent = false) {
    if (!silent) setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(
        `${API_URL}/orders/history?phone=${encodeURIComponent(phoneNumber)}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const data = await res.json()
      setOrders(Array.isArray(data.data) ? data.data : [])
    } catch {
      if (!silent) setOrders([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  function handleSearch() {
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) return

    if (trimmedPhone === searchPhone) {
      fetchOrders(trimmedPhone)
      return
    }

    setSearchPhone(trimmedPhone)
  }

  function formatDate(value) {
    if (!value) return 'Unknown date'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Unknown date'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  }

  function formatTime(value) {
    if (!value) return ''

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function money(value) {
    return `$${Number(value || 0).toFixed(2)}`
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-700 ring-red-200'
      case 'Processing':
        return 'bg-blue-100 text-blue-700 ring-blue-200'
      case 'Open':
      case 'Pending':
      case 'New':
      default:
        return 'bg-amber-100 text-amber-700 ring-amber-200'
    }
  }

  function getPaymentClass(status) {
    return status === 'Paid'
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
      : 'bg-red-100 text-red-700 ring-red-200'
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const paidOrders = orders.filter((order) => order.payment_status === 'Paid').length
  const latestOrder = orders[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8ef] pb-24 text-[#2b170d] sm:pb-0">
      <Navbar />

      <main className="flex-1">
        {/* Background */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,139,73,0.24),transparent_34%),radial-gradient(circle_at_top_right,rgba(91,50,26,0.18),transparent_30%)]" />
          <div className="absolute left-0 top-16 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-0 top-24 h-52 w-52 rounded-full bg-[#6f3f1f]/15 blur-3xl" />

          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="rounded-[2rem] border border-[#e7cda7] bg-white/80 p-5 shadow-[0_24px_70px_rgba(61,40,23,0.12)] backdrop-blur-2xl sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e7cda7] bg-[#fff4e3] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#8a5d3b]">
                    <span></span>
                    Coffee Orders
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-[#2b170d] sm:text-4xl">
                    Order History
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#8a6a50]">
                    View your coffee orders, payment status, table information, and receipt in one place.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#3d2415] via-[#6f3f1f] to-[#a86530] p-4 text-white shadow-[0_18px_45px_rgba(111,63,31,0.28)] md:min-w-[230px]">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100/80">
                    Current Customer
                  </p>

                  <p className="mt-2 truncate text-lg font-black">
                    {customer?.name || 'Guest Customer'}
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-amber-100/80">
                    {activePhone || 'Search by phone number'}
                  </p>
                </div>
              </div>

              {/* Search */}
              {!customer?.phone && (
                <div className="mt-6 rounded-[1.5rem] border border-[#e7cda7] bg-[#fffaf3] p-4">
                  <label className="mb-2 block text-sm font-black text-[#3d2415]">
                    Enter your phone number
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a47a55]">
                        ☎
                      </span>

                      <input
                        type="tel"
                        placeholder="Example: 012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full rounded-2xl border border-[#e2c59b] bg-white px-11 py-3 text-sm font-semibold text-[#3d2415] outline-none transition-all placeholder:text-[#b99a78] focus:border-[#a86530] focus:ring-4 focus:ring-[#c58b49]/20"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading || !phone.trim()}
                      className="rounded-2xl bg-gradient-to-r from-[#3d2415] via-[#6f3f1f] to-[#a86530] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(111,63,31,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(111,63,31,0.36)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? 'Searching...' : 'Search Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            {orders.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Total Orders"
                  value={orders.length}
                  sub="All history"
                  icon="🧾"
                />

                <SummaryCard
                  label="Total Spent"
                  value={money(totalSpent)}
                  sub="Coffee payment"
                  icon="☕"
                />

                <SummaryCard
                  label="Paid Orders"
                  value={paidOrders}
                  sub={latestOrder ? `Latest #${latestOrder.id}` : 'No latest order'}
                  icon="✅"
                />
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-6 rounded-[2rem] border border-[#e7cda7] bg-white/80 p-12 text-center shadow-[0_20px_55px_rgba(61,40,23,0.08)]">
                <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-[#d8b98b] border-t-[#5b321a]" />
                <p className="text-sm font-bold text-[#8a6a50]">Loading your coffee orders...</p>
              </div>
            )}

            {/* Empty */}
            {!loading && searched && orders.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-[#e7cda7] bg-white/80 p-10 text-center shadow-[0_20px_55px_rgba(61,40,23,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff0dc] text-3xl shadow-inner">
                  🧾
                </div>

                <h2 className="text-xl font-black text-[#2b170d]">No orders found</h2>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-[#8a6a50]">
                  We could not find any order history for this phone number. Please check the number and search again.
                </p>
              </div>
            )}

            {/* Orders */}
            {!loading && orders.length > 0 && (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-[2rem] border border-[#e7cda7] bg-white/85 shadow-[0_20px_55px_rgba(61,40,23,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(61,40,23,0.13)]"
                  >
                    <div className="border-b border-[#efd9b8] bg-gradient-to-r from-[#fff7ec] to-white px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-black text-[#2b170d]">
                              Order #{order.id}
                            </h2>

                            <span className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${getStatusClass(order.status || 'New')}`}>
                              {order.status || 'New'}
                            </span>

                            <span className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${getPaymentClass(order.payment_status)}`}>
                              {order.payment_status === 'Paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#a47a55]">
                            {formatDate(order.created_at)} {formatTime(order.created_at)}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a47a55]">
                            Total
                          </p>
                          <p className="text-2xl font-black text-[#6f3f1f]">
                            {money(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="space-y-3">
                        {order.items?.map((item) => {
                          const opts = [
                            item.size?.name,
                            item.sugar_level?.name,
                            item.ice_level?.name,
                            ...(item.addons?.map((a) => a.addon?.name).filter(Boolean) ?? []),
                          ]
                            .filter(Boolean)
                            .join(' • ')

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-4 rounded-2xl border border-[#f0dcc1] bg-[#fffaf3] p-3"
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                {item.product?.image ? (
                                  <img
                                    src={getImageUrl(item.product.image)}
                                    alt={item.product?.name || 'Product'}
                                    className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-md"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                ) : (
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3d2415] to-[#a86530] text-lg text-white shadow-md">
                                    ☕
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-[#2b170d]">
                                    {item.product?.name || 'Coffee Item'}
                                    <span className="ml-2 text-xs font-black text-[#a47a55]">
                                      x{item.qty}
                                    </span>
                                  </p>

                                  {opts && (
                                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#8a6a50]">
                                      {opts}
                                    </p>
                                  )}

                                  {(item.created_at || order.created_at) && (
                                    <p className="mt-1 text-[11px] font-bold text-[#a47a55]">
                                      🕒 {formatTime(item.created_at || order.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <p className="shrink-0 text-sm font-black text-[#6f3f1f]">
                                {money(item.subtotal)}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#efd9b8] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#8a6a50]">
                          {order.table && (
                            <span className="rounded-full bg-[#fff0dc] px-3 py-1 text-xs font-black text-[#7b4a26]">
                              Table: {order.table.name}
                            </span>
                          )}

                          {order.payment_method && (
                            <span className="rounded-full bg-[#fff0dc] px-3 py-1 text-xs font-black text-[#7b4a26]">
                              {order.payment_method}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setReceiptOrder(order)}
                          className="rounded-2xl border border-[#d9b98f] bg-white px-5 py-2.5 text-sm font-black text-[#6f3f1f] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fff0dc] hover:shadow-md"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {receiptOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2b170d]/70 p-4 backdrop-blur-sm"
          onClick={() => setReceiptOrder(null)}
        >
          <div
            className="w-full max-w-sm animate-receiptPop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[2rem] border border-[#e7cda7] bg-[#fffaf3] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <Invoice order={receiptOrder} customer={customer} />

              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#3d2415] via-[#6f3f1f] to-[#a86530] py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(111,63,31,0.25)] transition-all hover:shadow-[0_18px_40px_rgba(111,63,31,0.35)]"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />

      <style>{`
        @keyframes receiptPop {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-receiptPop {
          animation: receiptPop 0.22s ease-out;
        }
      `}</style>
    </div>
  )
}

function SummaryCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-[1.5rem] border border-[#e7cda7] bg-white/85 p-4 shadow-[0_16px_40px_rgba(61,40,23,0.08)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3d2415] to-[#a86530] text-xl text-white shadow-md">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a47a55]">
            {label}
          </p>

          <p className="truncate text-xl font-black text-[#2b170d]">
            {value}
          </p>

          <p className="truncate text-xs font-semibold text-[#8a6a50]">
            {sub}
          </p>
        </div>
      </div>
    </div>
  )
}