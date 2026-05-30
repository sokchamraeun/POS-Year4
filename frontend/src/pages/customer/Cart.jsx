import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import CartItem from '../../components/customer/CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { calcFinalPrice } from '../../utils/promotion.js'

const API_URL = import.meta.env.VITE_API_URL

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const { customer, isLoggedIn } = useCustomerAuth()
  const [orderNote, setOrderNote] = useState('')
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [selectedTable, setSelectedTable] = useState('')
  const [tables, setTables] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('pay_later')
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (customer?.phone) {
      setPhone(customer.phone)
    }
  }, [customer])

  useEffect(() => {
    fetch(`${API_URL}/tables/available`)
      .then(r => r.json())
      .then(setTables)
      .catch(() => {})
  }, [])

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
            body: JSON.stringify({ phone: phone.trim(), name: name.trim() || phone.trim() }),
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
        const price = calcFinalPrice(c.unitPrice, c.promotion)
        return {
          product_id: c.id,
          size_id: sizeId,
          sugar_level_id: sugarId,
          ice_level_id: iceId,
          qty: c.qty,
          unit_price: price,
          subtotal: price * c.qty,
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

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => navigate('/products'), 3000)
      return () => clearTimeout(timer)
    }
  }, [done])

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24 sm:pb-0">
        <Navbar />
        <div className="text-center max-w-sm mx-auto px-4">
          <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl font-bold text-gray-800 mb-2">Order Placed!</p>
          <p className="text-sm text-gray-500 mb-6">Your order has been submitted.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l1 5h13l1-5h2M6 8l1.5 9h9L18 8M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <CartItem
                  key={item.key}
                  item={item}
                  onUpdateQty={updateQty}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <textarea
                placeholder="Add order note..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 space-y-3">
              {isLoggedIn ? (
                <div className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700">
                  {customer?.name} ({customer?.phone})
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
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
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60 active:scale-[0.98]"
              >
                {placing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
      <MobileBottomNav />
    </div>
  )
}
