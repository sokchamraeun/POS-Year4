// src/pages/staff/dashboard/components/OrderDetailModal.jsx
import { statusColors, paymentColors } from '../utils/constants'
import { formatKhmerTime } from '../utils/helpers'
import { markOrderPrinted } from '../utils/api'

export default function OrderDetailModal({ order, onClose, onStatusChange, onPaymentChange }) {
  const handlePrint = async () => {
    await markOrderPrinted(order.id)
    
    const w = window.open('', '_blank')
    const itemsHtml = (order.items ?? []).map((item, idx) => {
      const name = item.product?.name ?? item.name ?? 'Unknown'
      const qty = item.qty ?? 1
      const price = Number(item.unit_price ?? item.price ?? 0)
      const size = item.size?.name ?? ''
      const sugar = item.sugar_level?.name ?? ''
      const ice = item.ice_level?.name ?? ''
      const addOn = (item.addons ?? []).map(a => a.addon?.name).filter(Boolean).join(', ')
      const vars = [size, sugar, ice, addOn].filter(Boolean).join('|')
      
      return `<tr><td style="padding:4px 4px;text-align:center;font-size:10px">${idx + 1}</td><td style="padding:4px 4px;font-size:10px">${name}${vars ? '<br><span style="color:#666;font-size:8px">'+vars+'</span>' : ''}</td><td style="padding:4px 4px;text-align:center;font-size:10px">${qty}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${price.toFixed(2)}</td><td style="padding:4px 4px;text-align:right;font-size:10px">$${(qty * price).toFixed(2)}</td></tr>`
    }).join('')

    w.document.write(`
      <html>
        <head>
          <title>Receipt #${order.id}</title>
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
          </style>
        </head>
        <body>
          <h1>Visal Cafe</h1>
          <div class="info">
            Receipt #${order.id}<br>
            ${order.customer?.name ?? 'Guest'}${order.customer?.phone ? ' &mdash; '+order.customer.phone : ''}${order.table ? ' | Table: '+(order.table?.name??order.table) : ''}<br>
            ${formatKhmerTime(order.created_at)}<br>
            Status: ${order.status ?? 'New'} | Payment: ${order.payment_status ?? 'Unpaid'}<br>
            Free WIFI<br>Username: Visal<br>Password: 12345678
          </div>
          <hr>
          <table>
            <thead>
              <tr>
                <th style="text-align:center">No.</th>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th class="right">Price</th>
                <th class="right">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr class="total">
                <td colspan="4" style="text-align:right">Total</td>
                <td style="text-align:right">$${Number(order.total ?? 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <hr>
          <div class="footer">Thank you for your visit!</div>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Order #{order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span><span className="text-gray-400">Customer:</span> <span className="text-gray-800 font-medium">{order.customer?.name ?? 'Guest'}</span></span>
              {order.customer?.phone && <><span className="text-gray-300">|</span><span>{order.customer.phone}</span></>}
              {order.table && <><span className="text-gray-300">|</span><span>Table: <span className="text-gray-800 font-medium">{order.table?.name ?? order.table}</span></span></>}
            </div>
            <span className="text-gray-400">{formatKhmerTime(order.created_at)}</span>
          </div>
          
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={order.status ?? 'New'}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[order.status ?? 'New']?.split(' ')[0] || 'text-gray-600'}`}
              >
                <option value="New">New</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Payment:</span>
              <select
                value={order.payment_status ?? 'Unpaid'}
                onChange={(e) => onPaymentChange(order.id, e.target.value)}
                className={`text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${paymentColors[order.payment_status ?? 'Unpaid']?.split(' ')[0] || 'text-gray-600'}`}
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <span className="text-sm text-gray-400 ml-auto">Method: <span className="text-gray-700 font-medium capitalize">{order.payment_method ?? '-'}</span></span>
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
              {(order.items ?? []).map((item, i) => {
                const name = item.product?.name ?? item.name ?? 'Unknown'
                const price = Number(item.unit_price ?? item.price ?? 0)
                const qty = item.qty ?? 1
                const size = item.size?.name ?? ''
                const sugar = item.sugar_level?.name ?? ''
                const ice = item.ice_level?.name ?? ''
                const addOn = (item.addons ?? []).map(a => a.addon?.name).filter(Boolean).join(', ')
                return (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-800 font-medium">{name}</td>
                    <td className="py-2.5 text-gray-600">{size || '-'}</td>
                    <td className="py-2.5 text-gray-600">{sugar || '-'}</td>
                    <td className="py-2.5 text-gray-600">{ice || '-'}</td>
                    <td className="py-2.5 text-gray-600">{addOn || '-'}</td>
                    <td className="py-2.5 text-gray-600">{qty}</td>
                    <td className="py-2.5 text-gray-600 text-right">${price.toFixed(2)}</td>
                    <td className="py-2.5 text-gray-800 text-right font-medium">${(qty * price).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="pt-3 text-right font-semibold text-gray-800">Total</td>
                <td className="pt-3 text-right font-semibold text-gray-800">${Number(order.total ?? 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}