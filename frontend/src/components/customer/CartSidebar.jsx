import { useState, useEffect } from 'react'
import CartItem from './CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function CartSidebar({ open, onClose }) {
  const { items, totalItems, totalPrice, clearCart } = useCart()
  const { customer, isLoggedIn } = useCustomerAuth()
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)
  const [phone, setPhone] = useState(customer?.phone || '')
  const [selectedTable, setSelectedTable] = useState('')
  const [tables, setTables] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('pay_later')

  useEffect(() => {
    if (customer?.phone) {
      setPhone(customer.phone)
    }
  }, [customer])

  function handleClose() {
    setDone(false)
    setPhone('')
    setSelectedTable('')
    setPaymentMethod('pay_later')
    onClose()
  }

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/tables/available`)
        .then(r => r.json())
        .then(setTables)
        .catch(() => {})
    }
  }, [open])

  if (!open) return null

  async function placeOrder() {
    setPlacing(true)
    try {
      let customerId = customer?.id || null
      if (!customerId && phone.trim()) {
        const custRes = await fetch(`${API_URL}/customers?phone=${encodeURIComponent(phone.trim())}`, {
          headers: { 'Accept': 'application/json' },
        })
        const custData = await custRes.json()
        const existing = custData.data?.find(c => c.phone === phone.trim())
        if (existing) {
          customerId = existing.id
        } else {
          const createRes = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ phone: phone.trim(), name: phone.trim() }),
          })
          if (createRes.ok) {
            const created = await createRes.json()
            customerId = created.id
          }
        }
      }

      const orderItems = items.map((c) => {
        const sizeId = c.sizes?.find(s => s.name === c.size)?.id ?? null
        const sugarId = (c.sugar_levels || c.sugarLevels)?.find(s => s.name === c.sugar)?.id ?? null
        const iceId = (c.ice_levels || c.iceLevels)?.find(i => i.name === c.ice)?.id ?? null
        const addonObj = c.addons?.find(a => a.name === c.addOn)

        return {
          product_id: c.id,
          size_id: sizeId,
          sugar_level_id: sugarId,
          ice_level_id: iceId,
          qty: c.qty,
          unit_price: c.unitPrice,
          subtotal: c.unitPrice * c.qty,
          addons: addonObj ? [{ addon_id: addonObj.id, price: 0 }] : [],
        }
      })

      const pm = paymentMethod === 'khqr' ? 'KHQR' : paymentMethod === 'cash' ? 'Cash' : null
      const orderPayload = {
        customer_id: customerId,
        table_id: selectedTable || null,
        total: totalPrice,
        status: 'New',
        payment_method: pm,
        payment_status: paymentMethod === 'cash' ? 'Paid' : 'Unpaid',
        items: orderItems,
      }

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

  return (
    <>
    <style>{`
      @keyframes slideLeft {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .animate-slideLeft {
        animation: slideLeft 0.25s ease-out;
      }
    `}</style>
    <div className="fixed top-0 right-0 bottom-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col animate-slideLeft">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Your Cart ({totalItems})</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <p className="text-gray-400 text-sm">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && !done && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3">
            {isLoggedIn ? (
              <div className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700">
                {customer?.name} ({customer?.phone})
              </div>
            ) : (
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pay_later')}
                className={`flex-1 text-sm font-medium py-2 rounded-xl transition-colors ${
                  paymentMethod === 'pay_later'
                    ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Pay Later
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 text-sm font-medium py-2 rounded-xl transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('khqr')}
                className={`flex-1 text-sm font-medium py-2 rounded-xl transition-colors ${
                  paymentMethod === 'khqr'
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-400'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                KHQR
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Total</span>
              <span className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-60"
            >
              {placing ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        )}

        {done && (
          <div className="border-t border-gray-200 px-5 py-8 text-center">
            <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-bold text-gray-800 mb-1">Order Placed!</p>
            <p className="text-sm text-gray-500 mb-4">Your order has been submitted.</p>
            <button onClick={handleClose} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Close</button>
          </div>
        )}
    </div>
    </>
  )
}
