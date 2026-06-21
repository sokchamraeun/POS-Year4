import { useState, useEffect, useRef } from 'react'
import CartItem from './CartItem.jsx'
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
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)
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
    if (open) {
      fetch(`${API_URL}/tables/available`)
        .then((r) => r.json())
        .then(setTables)
        .catch(() => {})
    }
  }, [open])

  const handleCloseRef = useRef(handleClose)
  handleCloseRef.current = handleClose

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => handleCloseRef.current(), 3000)
      return () => clearTimeout(timer)
    }
  }, [done])

  if (!open) return null

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

      const orderPayload = {
        customer_id: customerId,
        table_id: selectedTable || null,
        total: totalPrice,
        discount: discountTotal,
        status: 'New',
        payment_method: pm,
        payment_status: paymentMethod === 'cash' ? 'Paid' : 'Unpaid',
        items: orderItems,
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(orderPayload),
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

      setDone(true)
      setPlacing(false)
    } catch (err) {
      setPlacing(false)
      alert('Error: ' + (err.message || 'Check connection.'))
    }
  }

  const paymentOptions = [
    {
      key: 'pay_later',
      label: 'Later',
      icon: '',
      active: 'bg-amber-500 text-white border-amber-500',
    },
    {
      key: 'cash',
      label: 'Cash',
      icon: '',
      active: 'bg-emerald-500 text-white border-emerald-500',
    },
    {
      key: 'khqr',
      label: 'KHQR',
      icon: '',
      active: 'bg-red-500 text-white border-red-500',
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

        .animate-cartSlideIn {
          animation: cartSlideIn 0.25s ease-out;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[55] bg-black/35 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <aside className="fixed top-0 right-0 bottom-0 z-[60] w-full max-w-md bg-[#f8f4ee] shadow-2xl flex flex-col animate-cartSlideIn overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-orange-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest">
                Order Summary
              </p>

              <h2 className="text-xl font-black text-[#3d2817] mt-0.5">
                Cart
                <span className="ml-2 text-sm font-bold text-[#8a715c]">
                  ({totalItems})
                </span>
              </h2>
            </div>

            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-[#f8f4ee] text-[#8a715c] hover:bg-orange-100 hover:text-[#3d2817] flex items-center justify-center active:scale-95 transition-all"
            >
              <svg
                className="w-4.5 h-4.5"
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
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-white border border-orange-100 shadow-sm flex items-center justify-center mb-4">
                <svg
                  className="w-9 h-9 text-[#8a715c]"
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

              <h3 className="text-lg font-black text-[#3d2817]">
                Empty cart
              </h3>

              <p className="text-sm text-[#8a715c] mt-1">
                Add drinks to continue checkout.
              </p>

              <button
                onClick={handleClose}
                className="mt-5 rounded-full bg-[#3d2817] text-white text-xs font-black px-5 py-2.5 active:scale-95 transition-all"
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
          <div className="bg-white border-t border-orange-100 px-4 py-4 space-y-3 shadow-[0_-10px_30px_rgba(61,40,23,0.08)]">
            {/* Customer */}
            {isLoggedIn ? (
              <div className="bg-[#f8f4ee] border border-orange-100 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8a715c]">
                  Customer
                </p>
                <p className="text-sm font-black text-[#3d2817] mt-0.5">
                  {customer?.name}
                </p>
                <p className="text-xs text-[#8a715c]">{customer?.phone}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-orange-100 bg-[#f8f4ee] px-3 py-2.5 text-[#3d2817] placeholder:text-[#8a715c]/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs border border-orange-100 bg-[#f8f4ee] px-3 py-2.5 text-[#3d2817] placeholder:text-[#8a715c]/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            )}

            {/* Table */}
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full text-xs border border-orange-100 bg-[#f8f4ee] px-3 py-2.5 text-[#3d2817] focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">No table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Payment */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#8a715c] mb-2">
                Payment
              </p>

              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map((option) => {
                  const active = paymentMethod === option.key

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setPaymentMethod(option.key)}
                      className={`flex items-center justify-center gap-1.5 border px-2 py-2 text-xs font-black transition-all active:scale-95 ${
                        active
                          ? option.active
                          : 'bg-[#f8f4ee] text-[#8a715c] border-orange-100 hover:bg-orange-50'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Discount */}
            {discountTotal > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 px-3 py-2.5 space-y-1.5">
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
                  <span className="text-emerald-700 font-bold">
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

                  <span className="text-emerald-700 font-black">
                    -${discountTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Total + Small Checkout Button */}
            <div className="flex items-center justify-between gap-3 bg-[#3d2817] px-4 py-3">
              <div>
                {discountTotal > 0 && (
                  <p className="text-[11px] text-amber-100/60 line-through">
                    ${fullTotal.toFixed(2)}
                  </p>
                )}

                <p className="text-[11px] font-bold text-amber-100/70 uppercase tracking-wide">
                  Total
                </p>

                <p className="text-xl font-black text-white">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-[#3d2817] shadow-md hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-60"
              >
                {placing ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border-2 border-[#3d2817]/30 border-t-[#3d2817] animate-spin"></span>
                    Wait
                  </span>
                ) : (
                  'Checkout'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {done && (
          <div className="border-t border-orange-100 bg-white px-5 py-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg
                className="w-9 h-9 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.3}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="text-xl font-black text-[#3d2817]">
              Order Placed!
            </p>

            <p className="text-sm text-[#8a715c] mt-1 mb-5">
              Your order has been submitted.
            </p>

            <button
              onClick={handleClose}
              className="rounded-full bg-[#3d2817] text-white text-xs font-black px-5 py-2.5 active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </aside>
    </>
  )
}