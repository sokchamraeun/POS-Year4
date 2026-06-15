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
    <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-amber-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Recent Orders</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Latest transactions needing attention</p>
        </div>
        {newOrderAlert && (
          <span className="ml-auto animate-pulse px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-600 to-amber-800 shadow-lg shadow-amber-900/40">
            New Order!
          </span>
        )}
      </div>
      
      {recentOrders.length > 0 ? (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-amber-800/20">
                <th className="pb-3 pr-4 pl-2">Order ID</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4 text-center">Items</th>
                <th className="pb-3 pr-4 text-right">Total</th>
                <th className="pb-3 pr-4 text-center">Payment</th>
                <th className="pb-3 pr-4 text-center">Status</th>
                <th className="pb-3 pl-2 text-right">Action</th>
               </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="group border-b border-amber-800/10 hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-amber-100/30 transition-colors last:border-0">
                  <td className="py-4 pr-4 pl-2 font-bold text-gray-900 whitespace-nowrap">
                    #{o.id}
                   </td>
                  <td className="py-4 pr-4 font-medium text-gray-600 whitespace-nowrap">
                    {o.customer?.name ?? 'Guest'}
                   </td>
                  <td className="py-4 pr-4 text-gray-500 font-semibold text-center whitespace-nowrap">
                    {(o.items ?? []).reduce((s, i) => s + (i.qty ?? 1), 0)}
                   </td>
                  <td className="py-4 pr-4 text-gray-900 font-bold text-right whitespace-nowrap">
                    ${Number(o.total ?? 0).toFixed(2)}
                   </td>
                  <td className="py-4 pr-4 text-center whitespace-nowrap">
                    <div className="inline-block relative">
                      <select
                        value={o.payment_status ?? 'Unpaid'}
                        onChange={(e) => onPaymentChange(o.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer shadow-sm ring-1 ring-inset ring-amber-700/30 hover:ring-amber-700/50 focus:ring-2 focus:ring-teal-600 transition-all ${paymentColors[o.payment_status ?? 'Unpaid']}`}
                        style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                   </td>
                  <td className="py-4 pr-4 text-center whitespace-nowrap">
                    <div className="inline-block relative">
                      <select
                        value={o.status ?? 'New'}
                        onChange={(e) => onStatusChange(o.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer shadow-sm ring-1 ring-inset ring-amber-700/30 hover:ring-amber-700/50 focus:ring-2 focus:ring-teal-600 transition-all ${statusColors[o.status ?? 'New']}`}
                        style={{ borderRadius: '9999px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none' }}
                      >
                        <option value="New">New</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                   </td>
                  <td className="py-4 pl-2 text-right whitespace-nowrap">
                    <button 
                      onClick={() => onViewDetail(o)} 
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all opacity-80 group-hover:opacity-100"
                    >
                      View
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-amber-800/15 rounded-2xl bg-gradient-to-br from-amber-50/20 to-white">
          <svg className="w-12 h-12 text-amber-600/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 font-medium">No orders yet.</p>
          <p className="text-xs text-amber-600/60 mt-1">When customers place orders, they will appear here.</p>
        </div>
      )}
    </div>
  )
}