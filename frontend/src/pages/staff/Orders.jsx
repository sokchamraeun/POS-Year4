import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import { useSocket, useSocketConnect } from '../../hooks/useSocket'

const API_URL = import.meta.env.VITE_API_URL
const token = localStorage.getItem('token')
const authHeaders = { Authorization: `Bearer ${token}` }

function mapOrder(o) {
  return {
    id: `#${o.id}`,
    customer: o.customer?.name ?? 'Guest',
    phone: o.customer?.phone ?? '-',
    table: o.table?.name ?? '-',
    items: o.items?.reduce((s, i) => s + i.qty, 0) ?? 0,
    total: Number(o.total ?? 0),
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
    })),
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
  Completed: 'text-green-600 bg-green-100',
  Processing: 'text-blue-600 bg-blue-100',
  New: 'text-yellow-600 bg-yellow-100',
  Cancelled: 'text-red-600 bg-red-100',
}

const paymentColors = {
  Paid: 'text-green-600 bg-green-100',
  Unpaid: 'text-red-600 bg-red-100',
  Refunded: 'text-gray-600 bg-gray-100',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deductMsg, setDeductMsg] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  function loadOrders() {
    setLoading(true)
    fetch(`${API_URL}/orders?page=${page}`, { headers: authHeaders })
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
    if (deductMsg) {
      const t = setTimeout(() => setDeductMsg(''), 4000)
      return () => clearTimeout(t)
    }
  }, [deductMsg])

  const filtered = activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab)

  function handleStatusChange(orderId, newStatus) {
    const numericId = orderId.startsWith('#') ? orderId.slice(1) : orderId
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev))

    fetch(`${API_URL}/orders/${numericId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
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
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ payment_status: newPayment }),
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
            <button
              onClick={clearLocal}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Clear Local
            </button>
          </div>

          {deductMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-700">{deductMsg}</span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 font-medium">
                      <th className="px-6 py-3">Order</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Table</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3">Method</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                        <td className="px-6 py-4 text-gray-600">{order.customer}</td>
                        <td className="px-6 py-4 text-gray-500">{order.phone}</td>
                        <td className="px-6 py-4 text-gray-500">{order.table || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{order.items}</td>
                        <td className="px-6 py-4 text-gray-800">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status]}`}
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
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${paymentColors[order.payment]}`}
                            style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-gray-600 capitalize">{order.paymentMethod}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {lastPage > 1 && !loading && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">Page {page} of {lastPage} ({total} orders)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
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
                        <span key={`e${i}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${item === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= lastPage}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page >= lastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">{selectedOrder.id}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 overflow-y-auto">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span><span className="text-gray-400">Customer:</span> <span className="text-gray-800 font-medium">{selectedOrder.customer}</span></span>
                      <span className="text-gray-300">|</span>
                      <span>{selectedOrder.phone}</span>
                      {selectedOrder.table && selectedOrder.table !== '-' ? <><span className="text-gray-300">|</span><span>Table: <span className="text-gray-800 font-medium">{selectedOrder.table}</span></span></> : null}
                    </div>
                    <span className="text-gray-400">{selectedOrder.datetime}</span>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">Method:</span>
                      <span className="text-sm text-gray-700 font-medium capitalize">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[selectedOrder.status]?.split(' ')[0] || 'text-gray-600'}`}
                      >
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">Payment:</span>
                      <select
                        value={selectedOrder.payment}
                        onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value)}
                        className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${paymentColors[selectedOrder.payment]?.split(' ')[0] || 'text-gray-600'}`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 font-medium border-b border-gray-200">
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
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2.5 text-gray-800 font-medium">{item.name}</td>
                            <td className="py-2.5 text-gray-600">{item.size || '-'}</td>
                            <td className="py-2.5 text-gray-600">{item.sugar || '-'}</td>
                            <td className="py-2.5 text-gray-600">{item.ice || '-'}</td>
                            <td className="py-2.5 text-gray-600">{item.addOn || '-'}</td>
                            <td className="py-2.5 text-gray-600">{item.qty}</td>
                            <td className="py-2.5 text-gray-600 text-right">${item.price.toFixed(2)}</td>
                            <td className="py-2.5 text-gray-800 text-right font-medium">${(item.qty * item.price).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} className="pt-3 text-right font-semibold text-gray-800">Total</td>
                        <td className="pt-3 text-right font-semibold text-gray-800">${selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>


                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center gap-2">
                  <button
                    onClick={() => {
                      const numericId = selectedOrder.id.startsWith('#') ? selectedOrder.id.slice(1) : selectedOrder.id
                      fetch(`${API_URL}/orders/${numericId}/mark-printed`, { method: 'POST', headers: authHeaders }).catch(() => {})
                      const w = window.open('', '_blank')
                      const o = selectedOrder
                      const itemsHtml = o.detail.map((item, idx) => {
                        const vars = [item.size, item.sugar, item.ice, item.addOn].filter(Boolean).join('|')
                        return `<tr><td style="padding:4px 4px;text-align:center;font-size:10px">${idx + 1}</td><td style="padding:4px 4px;font-size:10px">${item.name}${vars ? '<br><span style="color:#666;font-size:8px">'+vars+'</span>' : ''}</td><td style="padding:4px 4px;text-align:center;font-size:10px">${item.qty}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${item.price.toFixed(2)}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${(item.qty * item.price).toFixed(2)}</td></tr>`
                      }).join('')
                      w.document.write(`
                        <html><head><title>Receipt ${o.id}</title>
                        <style>
                          body { font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 8px; width: 58mm; font-weight: bold; }
                          h1 { font-size: 14px; text-align: center; margin-bottom: 4px; }
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
                          Status: ${o.status} | Payment: ${o.payment}<br>Free WIFI<br>Username: Visal<br>Password: 12345678
                        </div>
                        <hr>
                        <table>
                          <thead><tr><th style="text-align:center">No.</th><th>Item</th><th style="text-align:center">Qty</th><th class="right">Price</th><th class="right">Subtotal</th></tr></thead>
                          <tbody>${itemsHtml}</tbody>
                          <tfoot><tr class="total"><td colspan="4" style="text-align:right">Total</td><td style="text-align:right">$${o.total.toFixed(2)}</td></tr></tfoot>
                        </table>
                        <hr>
                        <div class="footer">Thank you for your visit!</div>
                        <script>window.print();window.close();</script>
                        </body></html>
                      `)
                      w.document.close()
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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
