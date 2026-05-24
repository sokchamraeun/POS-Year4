// src/pages/staff/dashboard/components/RecentOrdersTable.jsx
import { statusColors, paymentColors } from '../utils/constants'

export default function RecentOrdersTable({ 
  recentOrders, 
  newOrderAlert, 
  onStatusChange, 
  onPaymentChange, 
  onViewDetail 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        {newOrderAlert && (
          <span className="animate-pulse px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-red-500 shadow-lg">
            New Order!
          </span>
        )}
      </div>
      
      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                <th className="pb-2 pr-2">Order ID</th>
                <th className="pb-2 pr-2">Customer</th>
                <th className="pb-2 pr-2">Items</th>
                <th className="pb-2 pr-2">Total</th>
                <th className="pb-2 pr-2">Payment</th>
                <th className="pb-2 pr-2">Status</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-2 font-medium text-gray-800">#{o.id}</td>
                  <td className="py-2.5 pr-2 text-gray-600">{o.customer?.name ?? 'Guest'}</td>
                  <td className="py-2.5 pr-2 text-gray-600">{(o.items ?? []).reduce((s, i) => s + (i.qty ?? 1), 0)}</td>
                  <td className="py-2.5 pr-2 text-gray-800 font-medium">${Number(o.total ?? 0).toFixed(2)}</td>
                  <td className="py-2.5 pr-2">
                    <select
                      value={o.payment_status ?? 'Unpaid'}
                      onChange={(e) => onPaymentChange(o.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${paymentColors[o.payment_status ?? 'Unpaid']}`}
                      style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-2.5 pr-2">
                    <select
                      value={o.status ?? 'New'}
                      onChange={(e) => onStatusChange(o.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[o.status ?? 'New']}`}
                      style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                    >
                      <option value="New">New</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-2.5 text-right">
                    <button 
                      onClick={() => onViewDetail(o)} 
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No orders yet.</p>
      )}
    </div>
  )
}