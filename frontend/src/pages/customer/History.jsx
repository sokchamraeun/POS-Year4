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


  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdfa] pb-24 text-black sm:pb-0">
      <Navbar />

      <main className="flex-1">
        {/* Background */}
        <section className="relative overflow-hidden">



          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-5 rounded-[2.25rem] border border-[#ccfbf1] bg-white/70 p-3 shadow-[0_30px_80px_rgba(15,118,110,0.14)] sm:p-5">
            {/* Header */}
            <div className="rounded-[2rem] border border-[#ccfbf1] bg-white/80 p-5 shadow-[0_24px_70px_rgba(15,118,110,0.12)] sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ccfbf1] bg-[#ccfbf1] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
                    <span></span>
                    Coffee Orders
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
                    Order History
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-black">
                    View your coffee orders, payment status, table information, and receipt in one place.
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-gradient-to-br from-[#134e4a] via-[#0f766e] to-[#0d9488] p-4 text-white shadow-[0_18px_45px_rgba(15,118,110,0.28)] md:min-w-[230px]">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-100/80">
                    Current Customer
                  </p>

                  <p className="mt-2 truncate text-lg font-black">
                    {customer?.name || 'Guest Customer'}
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-teal-100/80">
                    {activePhone || 'Search by phone number'}
                  </p>
                </div>
              </div>

              {/* Search */}
              {!customer?.phone && (
                <div className="mt-6 rounded-[1.5rem] border border-[#ccfbf1] bg-[#f0fdfa] p-4">
                  <label className="mb-2 block text-sm font-black text-black">
                    Enter your phone number
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black">
                        ☎
                      </span>

                      <input
                        type="tel"
                        placeholder="Example: 012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full rounded-2xl border border-[#99f6e4] bg-white px-11 py-3 text-sm font-semibold text-black outline-none transition-all placeholder:text-[#5eead4] focus:border-[#0d9488] focus:ring-4 focus:ring-[#14b8a6]/20"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading || !phone.trim()}
                      className="rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-6 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,118,110,0.36)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? 'Searching...' : 'Search Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-6 rounded-[2rem] border border-[#ccfbf1] bg-white/80 p-12 text-center shadow-[0_20px_55px_rgba(15,118,110,0.08)]">
                <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-[#99f6e4] border-t-[#0d9488]" />
                <p className="text-sm font-bold text-black">Loading your coffee orders...</p>
              </div>
            )}

            {/* Empty */}
            {!loading && searched && orders.length === 0 && (
              <div className="mt-6 rounded-[2rem] border border-[#ccfbf1] bg-white/80 p-10 text-center shadow-[0_20px_55px_rgba(15,118,110,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ccfbf1] text-3xl shadow-inner">
                  🧾
                </div>

                <h2 className="text-xl font-black text-black">No orders found</h2>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-black">
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
                    className="overflow-hidden rounded-[2rem] border border-[#ccfbf1] bg-white/85 shadow-[0_20px_55px_rgba(15,118,110,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(15,118,110,0.13)]"
                  >
                    <div className="border-b border-[#ccfbf1] bg-gradient-to-r from-[#f0fdfa] to-white px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-black text-black">
                              Order #{order.id}
                            </h2>

                            <span className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${getStatusClass(order.status || 'New')}`}>
                              {order.status || 'New'}
                            </span>

                            <span className={`rounded-full px-3 py-1 text-[11px] font-black ring-1 ${getPaymentClass(order.payment_status)}`}>
                              {order.payment_status === 'Paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-black">
                            {formatDate(order.created_at)} {formatTime(order.created_at)}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-black">
                            Total
                          </p>
                          <p className="text-2xl font-black text-black">
                            {money(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="divide-y divide-[#ccfbf1]">
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
                              className="flex items-start justify-between gap-4 p-3"
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
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] text-lg text-white shadow-md">
                                    ☕
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-black text-black">
                                    {item.product?.name || 'Coffee Item'}
                                    <span className="ml-2 text-xs font-black text-black">
                                      x{item.qty}
                                    </span>
                                  </p>

                                  {opts && (
                                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-black">
                                      {opts}
                                    </p>
                                  )}

                                  {(item.created_at || order.created_at) && (
                                    <p className="mt-1 text-[11px] font-bold text-black">
                                      🕒 {formatTime(item.created_at || order.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <p className="shrink-0 text-sm font-black text-black">
                                {money(item.subtotal)}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#ccfbf1] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-black">
                          {order.table && (
                            <span className="rounded-full bg-[#ccfbf1] px-3 py-1 text-xs font-black text-black">
                              Table: {order.table.name}
                            </span>
                          )}

                          {order.payment_method && (
                            <span className="rounded-full bg-[#ccfbf1] px-3 py-1 text-xs font-black text-black">
                              {order.payment_method}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setReceiptOrder(order)}
                          className="rounded-2xl border border-[#99f6e4] bg-white px-5 py-2.5 text-sm font-black text-black shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ccfbf1] hover:shadow-md"
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
          </div>
        </section>
      </main>

      {receiptOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#134e4a]/70 p-4"
          onClick={() => setReceiptOrder(null)}
        >
          <div
            className="w-full max-w-sm animate-receiptPop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[2rem] border border-[#ccfbf1] bg-[#f0fdfa] p-3 shadow-[0_30px_80px_rgba(15,118,110,0.35)]">
              <Invoice order={receiptOrder} customer={customer} />

              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)] transition-all hover:shadow-[0_18px_40px_rgba(15,118,110,0.35)]"
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

