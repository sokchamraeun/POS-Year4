import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

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

const allOrders = [
  { id: '#1001', customer: 'Alice Johnson', phone: '012-345 6789', items: 3, total: 32.50, date: '2026-05-14', status: 'Completed', payment: 'Paid', detail: [
    { name: 'Americano', qty: 1, price: 8.90 },
    { name: 'Caffe Latte', qty: 1, price: 10.90 },
    { name: 'Mocha', qty: 1, price: 12.50 },
  ]},
  { id: '#1002', customer: 'Bob Smith', phone: '012-345 6790', items: 1, total: 8.90, date: '2026-05-14', status: 'Pending', payment: 'Unpaid', detail: [
    { name: 'Americano', qty: 1, price: 8.90 },
  ]},
  { id: '#1003', customer: 'Carol White', phone: '012-345 6791', items: 2, total: 21.80, date: '2026-05-13', status: 'Completed', payment: 'Paid', detail: [
    { name: 'Cappuccino', qty: 1, price: 11.50 },
    { name: 'Espresso', qty: 1, price: 7.50 },
    { name: 'Whipped Cream', qty: 1, price: 1.50 },
    { name: 'Caramel', qty: 1, price: 1.00 },
  ]},
  { id: '#1004', customer: 'David Lee', phone: '012-345 6792', items: 4, total: 45.60, date: '2026-05-13', status: 'Processing', payment: 'Paid', detail: [
    { name: 'Caramel Macchiato', qty: 2, price: 13.90 },
    { name: 'Cold Brew', qty: 1, price: 9.90 },
    { name: 'Vanilla', qty: 1, price: 1.00 },
  ]},
  { id: '#1005', customer: 'Eve Brown', phone: '012-345 6793', items: 2, total: 18.40, date: '2026-05-12', status: 'Completed', payment: 'Paid', detail: [
    { name: 'Matcha Latte', qty: 1, price: 12.90 },
    { name: 'Extra Shot', qty: 1, price: 2.00 },
  ]},
  { id: '#1006', customer: 'Frank Wilson', phone: '012-345 6794', items: 5, total: 62.30, date: '2026-05-12', status: 'Cancelled', payment: 'Refunded', detail: [
    { name: 'Mocha', qty: 2, price: 12.50 },
    { name: 'Caffe Latte', qty: 1, price: 10.90 },
    { name: 'Espresso', qty: 1, price: 7.50 },
    { name: 'Whipped Cream', qty: 2, price: 1.50 },
    { name: 'Chocolate Drizzle', qty: 1, price: 1.50 },
  ]},
  { id: '#1007', customer: 'Grace Kim', phone: '012-345 6795', items: 1, total: 12.50, date: '2026-05-11', status: 'Completed', payment: 'Paid', detail: [
    { name: 'Mocha', qty: 1, price: 12.50 },
  ]},
  { id: '#1008', customer: 'Henry Chen', phone: '012-345 6796', items: 3, total: 36.70, date: '2026-05-11', status: 'Pending', payment: 'Unpaid', detail: [
    { name: 'Americano', qty: 2, price: 8.90 },
    { name: 'Cappuccino', qty: 1, price: 11.50 },
    { name: 'Whipped Cream', qty: 1, price: 1.50 },
    { name: 'Caramel', qty: 1, price: 1.00 },
  ]},
]

const tabs = ['All', 'Completed', 'Processing', 'Pending', 'Cancelled']

const statusColors = {
  Completed: 'text-green-600 bg-green-100',
  Processing: 'text-blue-600 bg-blue-100',
  Pending: 'text-yellow-600 bg-yellow-100',
  Cancelled: 'text-red-600 bg-red-100',
}

const paymentColors = {
  Paid: 'text-green-600 bg-green-100',
  Unpaid: 'text-red-600 bg-red-100',
  Refunded: 'text-gray-600 bg-gray-100',
}

function loadOrders() {
  const stored = JSON.parse(localStorage.getItem('newOrders') || '[]')
  return [...stored, ...allOrders]
}

export default function Orders() {
  const [orders, setOrders] = useState(loadOrders)
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deductMsg, setDeductMsg] = useState('')

  useEffect(() => {
    if (deductMsg) {
      const t = setTimeout(() => setDeductMsg(''), 4000)
      return () => clearTimeout(t)
    }
  }, [deductMsg])

  const filtered = activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab)

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev))

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
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment: newPayment } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, payment: newPayment } : prev))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

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
                          <option value="Pending">Pending</option>
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
          </div>

          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">{selectedOrder.id} - Items</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Customer: <span className="text-gray-800 font-medium">{selectedOrder.customer}</span> &mdash; {selectedOrder.phone}{selectedOrder.table ? ` | Table: ${selectedOrder.table}` : ''}</span>
                    <span>{selectedOrder.date}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Payment:</span>
                      <select
                        value={selectedOrder.payment}
                        onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                        <th className="pb-2">Item</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.detail.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 text-gray-800">{item.name}</td>
                          <td className="py-2 text-gray-600">{item.qty}</td>
                          <td className="py-2 text-gray-600 text-right">${item.price.toFixed(2)}</td>
                          <td className="py-2 text-gray-800 text-right">${(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="pt-3 text-right font-semibold text-gray-800">Total</td>
                        <td className="pt-3 text-right font-semibold text-gray-800">${selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
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
