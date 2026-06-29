import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import CartItem from './CartItem.jsx'
import Invoice from './Invoice.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { getPromotionLabel } from '../../utils/promotion.js'

const API_URL = import.meta.env.VITE_API_URL

export default function CartSidebar({ open, onClose }) {
  const {
    items,
    totalItems,
    fullTotal,
    discountTotal,
    totalPrice,
    clearCart,
    comboResult,
  } = useCart()

  const { customer, isLoggedIn } = useCustomerAuth()
  const [searchParams] = useSearchParams()

  const qrToken = (() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) {
      sessionStorage.setItem('qr_token', fromUrl)
      return fromUrl
    }
    return sessionStorage.getItem('qr_token') || ''
  })()

  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [selectedTable, setSelectedTable] = useState('')
  const [tables, setTables] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('pay_later')

  useEffect(() => {
    if (customer?.name) setName(customer.name)
    if (customer?.phone) setPhone(customer.phone)
  }, [customer])

  function handleClose() {
    setDone(false)
    setName(customer?.name || '')
    setPhone(customer?.phone || '')
    setSelectedTable('')
    setPaymentMethod('pay_later')
    onClose()
  }

  useEffect(() => {
    if (open && !qrToken) {
      fetch(`${API_URL}/tables/available`)
        .then((r) => r.json())
        .then(setTables)
        .catch(() => {})
    }
  }, [open, qrToken])

  const handleCloseRef = useRef(handleClose)
  handleCloseRef.current = handleClose

  if (!open && !done) return null

  async function placeOrder() {
    if (!isLoggedIn) {
      if (!name.trim()) {
        setPlacing(false)
        alert('Please enter your name')
        return
      }

      if (!phone.trim()) {
        setPlacing(false)
        alert('Please enter your phone number')
        return
      }
    }

    setPlacing(true)

    try {
      let customerId = customer?.id || null

      if (!customerId && phone.trim()) {
        const custRes = await fetch(
          `${API_URL}/customers?phone=${encodeURIComponent(phone.trim())}`,
          {
            headers: { Accept: 'application/json' },
          }
        )

        const custData = await custRes.json()
        const existing = custData.data?.find((c) => c.phone === phone.trim())

        if (existing) {
          customerId = existing.id

          if (name.trim() && existing.name !== name.trim()) {
            await fetch(`${API_URL}/customers/${existing.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({ name: name.trim() }),
            })
          }
        } else {
          const createRes = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              phone: phone.trim(),
              name: name.trim() || phone.trim(),
            }),
          })

          if (createRes.ok) {
            const created = await createRes.json()
            customerId = created.id
          }
        }
      }

      const orderItems = items.map((c) => {
        const sizeId = c.sizes?.find((s) => s.name === c.size)?.id ?? null
        const sugarId =
          (c.sugar_levels || c.sugarLevels)?.find((s) => s.name === c.sugar)
            ?.id ?? null
        const iceId =
          (c.ice_levels || c.iceLevels)?.find((i) => i.name === c.ice)?.id ??
          null
        const addonObj = c.addons?.find((a) => a.name === c.addOn)

        return {
          product_id: c.id,
          size_id: sizeId,
          sugar_level_id: sugarId,
          sugar_note: c.sugarNote || null,
          ice_level_id: iceId,
          ice_note: c.iceNote || null,
          qty: c.qty,
          unit_price: c.unitPrice,
          subtotal: c.unitPrice * c.qty,
          addons: addonObj ? [{ addon_id: addonObj.id, price: 0 }] : [],
        }
      })

      const pm =
        paymentMethod === 'khqr'
          ? 'KHQR'
          : paymentMethod === 'cash'
            ? 'Cash'
            : null

      const res = qrToken
        ? await fetch(`${API_URL}/tables/${qrToken}/order-items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ customer_id: customerId, items: orderItems }),
          })
        : await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              customer_id: customerId,
              table_id: selectedTable || null,
              total: totalPrice,
              discount: discountTotal,
              status: 'New',
              payment_method: pm,
              payment_status: paymentMethod === 'cash' ? 'Paid' : 'Unpaid',
              items: orderItems,
            }),
          })

      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Failed to place order')
        setPlacing(false)
        return
      }

      const createdOrder = await res.json()
      const dbOrderId = createdOrder.id ?? null

      clearCart()

      if (paymentMethod === 'khqr' && dbOrderId) {
        const initRes = await fetch(`${API_URL}/orders/payment/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ order_id: dbOrderId }),
        })

        const initData = await initRes.json()

        if (initData.checkout_url) {
          window.location.href = initData.checkout_url
          return
        }

        alert(initData.message || 'KHQR payment initiation failed')
        setPlacing(false)
        return
      }

      setPlacedOrder(createdOrder.data ?? createdOrder)
      setDone(true)
      setPlacing(false)
      onClose()

      const orderId = createdOrder.id ?? createdOrder.data?.id ?? null
      if (orderId) {
        try {
          const detailRes = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: { Accept: 'application/json' },
          })

          if (detailRes.ok) {
            const detailData = await detailRes.json()
            setPlacedOrder(detailData.data ?? detailData)
          }
        } catch {}
      }
    } catch (err) {
      setPlacing(false)
      alert('Error: ' + (err.message || 'Check connection.'))
    }
  }

  const paymentOptions = [
    {
      key: 'pay_later',
      label: 'Later',
      icon: '⏳',
      active: 'bg-[#0f766e] text-white border-[#0f766e] shadow-md shadow-teal-900/15',
    },
    {
      key: 'cash',
      label: 'Cash',
      icon: '💵',
      active: 'bg-[#16a34a] text-white border-[#16a34a] shadow-md shadow-emerald-900/15',
    },
    {
      key: 'khqr',
      label: 'KHQR',
      icon: '▣',
      active: 'bg-[#dc2626] text-white border-[#dc2626] shadow-md shadow-red-900/15',
    },
  ]

  return (
    <>
      <style>{`
        @keyframes cartSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-cartSlideIn {
          animation: cartSlideIn 0.25s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out 0.15s both;
        }
      `}</style>

      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/35 backdrop-blur-sm"
          onClick={handleClose}
        ></div>
      )}

      {open && (
        <aside className="fixed top-0 right-0 bottom-0 z-[60] flex w-full max-w-md animate-cartSlideIn flex-col overflow-hidden bg-[#f0fdfa] shadow-2xl">
          {/* Header */}
          <div className="border-b border-[#ccfbf1] bg-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-teal-500">
                  Order Summary
                </p>

                <h2 className="mt-0.5 text-xl font-black text-[#134e4a]">
                  Cart
                  <span className="ml-2 text-sm font-bold text-[#0d9488]">
                    ({totalItems})
                  </span>
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0fdfa] text-[#0d9488] transition-all hover:bg-teal-100 hover:text-[#134e4a] active:scale-95"
              >
                <svg
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.4}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#ccfbf1] bg-white shadow-sm">
                  <svg
                    className="h-9 w-9 text-[#0d9488]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-black text-[#134e4a]">
                  Empty cart
                </h3>

                <p className="mt-1 text-sm text-[#0d9488]">
                  Add drinks to continue checkout.
                </p>

                <button
                  onClick={handleClose}
                  className="mt-5 rounded-full bg-[#134e4a] px-5 py-2.5 text-xs font-black text-white transition-all active:scale-95"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItem key={item.key} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && !done && (
            <div className="space-y-3 border-t border-[#ccfbf1] bg-white px-4 py-4 shadow-[0_-10px_30px_rgba(15,118,110,0.08)]">
              <div className="rounded-[28px] border border-[#b7f3ea] bg-gradient-to-b from-[#f0fdfa] to-white p-4">
                {/* Customer */}
                {isLoggedIn ? (
                  <div className="rounded-2xl border border-[#ccfbf1] bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#0d9488]">
                      Customer
                    </p>
                    <p className="mt-0.5 text-sm font-black text-[#134e4a]">
                      {customer?.name}
                    </p>
                    <p className="text-xs font-semibold text-[#0d9488]">
                      {customer?.phone}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 w-full rounded-2xl border border-[#b7f3ea] bg-white px-4 text-xs font-bold text-[#134e4a] shadow-sm outline-none placeholder:text-[#0d9488]/50 focus:border-[#14b8a6] focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 w-full rounded-2xl border border-[#b7f3ea] bg-white px-4 text-xs font-bold text-[#134e4a] shadow-sm outline-none placeholder:text-[#0d9488]/50 focus:border-[#14b8a6] focus:ring-4 focus:ring-teal-500/10"
                      />
                    </div>
                  </div>
                )}

                {!qrToken && (
                  <div className="mt-2">
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="h-11 w-full rounded-2xl border border-[#b7f3ea] bg-white px-4 text-xs font-bold text-[#134e4a] shadow-sm outline-none focus:border-[#14b8a6] focus:ring-4 focus:ring-teal-500/10"
                    >
                      <option value="">No table</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Payment */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#0d9488]">
                      Payment
                    </p>

                    <p className="text-[10px] font-bold text-[#0d9488]/70">
                      Choose method
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {paymentOptions.map((option) => {
                      const active = paymentMethod === option.key

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setPaymentMethod(option.key)}
                          className={`flex h-11 items-center justify-center gap-1.5 rounded-2xl border px-2 text-xs font-black transition-all active:scale-95 ${
                            active
                              ? option.active
                              : 'border-[#b7f3ea] bg-white text-[#0d9488] shadow-sm hover:bg-teal-50'
                          }`}
                        >
                          <span className="text-sm">{option.icon}</span>
                          <span>{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Discount */}
                {discountTotal > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    {comboResult?.totalDiscount > 0 &&
                      (() => {
                        const comboKeys = Object.keys(
                          comboResult.itemDiscounts || {}
                        )
                        const comboItems = items.filter((i) =>
                          comboKeys.includes(i.key)
                        )
                        const promo = comboItems[0]?.promotion
                        const names = [...new Set(comboItems.map((i) => i.name))]
                        const label =
                          names.join(' + ') +
                          (promo?.value
                            ? ` = $${Number(promo.value).toFixed(2)}`
                            : '')

                        return (
                          <div className="flex items-center justify-between text-xs text-emerald-700">
                            <span className="font-bold">{label}</span>
                            <span className="font-black">
                              -${comboResult.totalDiscount.toFixed(2)}
                            </span>
                          </div>
                        )
                      })()}

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700">
                        Discount
                        {items
                          .map((i) =>
                            i.promotion &&
                            i.promotion.type !== 'combo_discount' &&
                            i.promotion.type !== 'combo'
                              ? getPromotionLabel(i.promotion)
                              : ''
                          )
                          .filter(Boolean)
                          .map((label, idx) => (
                            <span
                              key={idx}
                              className="ml-1 text-[10px] text-emerald-600/80"
                            >
                              ({label})
                            </span>
                          ))}
                      </span>

                      <span className="font-black text-emerald-700">
                        -${discountTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total + Checkout */}
              <div className="rounded-[28px] bg-[#134e4a] p-4 shadow-lg shadow-teal-950/15">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {discountTotal > 0 && (
                      <p className="text-[11px] text-teal-100/60 line-through">
                        ${fullTotal.toFixed(2)}
                      </p>
                    )}

                    <p className="text-[11px] font-black uppercase tracking-wider text-teal-100/70">
                      Total
                    </p>

                    <p className="text-2xl font-black leading-none text-white">
                      ${totalPrice.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="shrink-0 rounded-2xl bg-[#2dd4bf] px-5 py-3 text-xs font-black text-[#134e4a] shadow-md transition-all hover:bg-[#5eead4] active:scale-95 disabled:opacity-60"
                  >
                    {placing ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#134e4a]/30 border-t-[#134e4a]"></span>
                        Wait
                      </span>
                    ) : (
                      'Checkout'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Receipt modal */}
      {done && (
        <div className="fixed inset-0 z-[70] flex animate-fadeIn items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-[95vw] animate-scaleIn flex-col rounded-2xl bg-white sm:max-w-md">
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-md hover:bg-slate-100"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="shrink-0 p-4 pb-0 text-center sm:p-5 sm:pb-0">
              <div className="mx-auto mb-2 flex h-10 w-10 animate-bounceIn items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="animate-slideUp text-lg font-black text-[#134e4a]">
                Order Successful!
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-5">
              {placedOrder ? (
                <Invoice order={placedOrder} customer={customer} />
              ) : (
                <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600"></div>
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Loading receipt...
                  </p>
                </div>
              )}
            </div>

            <div className="shrink-0 p-4 pt-3 sm:p-5 sm:pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}