import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'

const API_URL = import.meta.env.VITE_API_URL

function safeParseUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function History() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(false)
  const [mode, setMode] = useState('phone')

  const loggedUser = safeParseUser()

  useEffect(() => {
    if (loggedUser?.email && mode === 'email') {
      fetchOrdersByEmail(loggedUser.email)
    }
  }, [mode])

  async function fetchOrdersByEmail(email) {
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${API_URL}/orders/user-history?email=${encodeURIComponent(email)}`, {
        headers: { 'Accept': 'application/json' },
      })
      const data = await res.json()
      setOrders(data.data ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrdersByPhone() {
    if (!phone.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${API_URL}/orders/history?phone=${encodeURIComponent(phone.trim())}`, {
        headers: { 'Accept': 'application/json' },
      })
      const data = await res.json()
      setOrders(data.data ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 mt-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order History</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('phone')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === 'phone'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              By Phone
            </button>
            {loggedUser?.email && (
              <button
                onClick={() => setMode('email')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === 'email'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                By Email ({loggedUser.email})
              </button>
            )}
          </div>

          {mode === 'phone' && (
            <div className="flex gap-3">
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrdersByPhone()}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchOrdersByPhone}
                disabled={loading || !phone.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        )}

        {!loading && searched && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">No orders found</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-gray-800">Order #{order.id}</span>
                    <span className="text-xs text-gray-400 ml-3">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status || 'New'}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-700">{item.product?.name}</span>
                        <span className="text-gray-400 ml-2">
                          x{item.qty}
                          {item.size && <span className="ml-1">({item.size.name})</span>}
                        </span>
                      </div>
                      <span className="text-gray-600">${Number(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {order.payment_status === 'Paid' ? (
                      <span className="text-green-600 font-medium">Paid</span>
                    ) : (
                      <span className="text-red-600 font-medium">Unpaid</span>
                    )}
                    {order.table && <span className="ml-3">Table: {order.table.name}</span>}
                  </span>
                  <span className="text-lg font-bold text-blue-600">${Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
