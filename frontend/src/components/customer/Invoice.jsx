import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { calcDiscount, getPromotionLabel } from '../../utils/promotion.js'

export default function Invoice({ order, customer }) {
  const receiptRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const items = order.items ?? []
  const customerName = customer?.name ?? order.customer?.name ?? 'Guest'
  const customerPhone = customer?.phone ?? order.customer?.phone ?? ''

  async function downloadPDF() {
    const el = receiptRef.current
    if (!el) return

    setLoading(true)
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fafaf9',
        onclone: (clonedDoc) => {
          const s = clonedDoc.createElement('style')
          s.textContent = `
            .text-gray-400 { color: #a8a29e !important; }
            .text-gray-500 { color: #78716c !important; }
            .text-gray-600 { color: #57534e !important; }
            .text-gray-700 { color: #44403c !important; }
            .text-gray-800 { color: #292524 !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-blue-800 { color: #1e40af !important; }
            .bg-blue-600 { background-color: #2563eb !important; }
            .bg-blue-700 { background-color: #1d4ed8 !important; }
            .bg-orange-50 { background-color: #fafaf9 !important; }
            .bg-white { background-color: #ffffff !important; }
            .border-gray-100 { border-color: #f3f4f6 !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .text-green-600 { color: #16a34a !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-yellow-700 { color: #a16207 !important; }
            .bg-green-100 { background-color: #dcfce7 !important; }
            .bg-red-100 { background-color: #fee2e2 !important; }
            .bg-blue-100 { background-color: #dbeafe !important; }
            .bg-yellow-100 { background-color: #fef9c3 !important; }
            .truncate {
              overflow: visible !important;
              white-space: normal !important;
              text-overflow: clip !important;
            }
          `
          clonedDoc.head.appendChild(s)
        },
      })

      const imgData = canvas.toDataURL('image/png')
      const imgW = 80
      const imgH = (canvas.height / canvas.width) * imgW
      const doc = new jsPDF({ unit: 'mm', format: [imgW, imgH] })
      doc.addImage(imgData, 'PNG', 0, 0, imgW, imgH)
      doc.save('receipt-' + order.id + '.pdf')
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto" style={{ fontFamily: "'Courier New', 'Noto Sans Khmer', monospace" }}>
      <div ref={receiptRef} className="w-full bg-[#fafaf9] shadow-xl rounded-none border border-gray-300 overflow-hidden">
        
        {/* HEADER */}
        <div className="text-center px-4 pt-5 pb-3" style={{ borderBottom: '1px dashed #ccc' }}>
          <div className="text-lg font-black tracking-wide">VISAL CAFE</div>
          <div className="text-xs text-gray-500 mt-1">#{order.id}</div>

          <div className="text-xs mt-2 text-gray-700">
            {customerName}{customerPhone ? ' — ' + customerPhone : ''}
          </div>

          <div className="text-[10px] text-gray-500 mt-1">
            {order.created_at
              ? new Date(order.created_at).toLocaleString('en-US', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                  hour12: false, timeZone: 'Asia/Phnom_Penh',
                })
              : ''}
          </div>

          <div className="text-[10px] mt-1 text-gray-600">
            Status: {order.status || 'New'} | Payment: {order.payment_status || 'Unpaid'}
          </div>

          {order.printed_by?.name && (
            <div className="text-[10px] mt-1 text-gray-600">
              Staff: {order.printed_by.name}
            </div>
          )}

          <div className="text-[10px] mt-2 text-gray-500">Free WIFI</div>
          <div className="text-[10px] text-gray-500">Username: Visal</div>
          <div className="text-[10px] text-gray-500">Password: 12345678</div>
        </div>

        {/* TABLE HEADER */}
        <div className="grid grid-cols-[14px_auto_24px_52px_50px] text-[10px] font-bold px-5 pt-5 pb-3" style={{ borderBottom: '1px dashed #ccc' }}>
          <span className="text-center">No</span>
          <span>Item</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Price</span>
          <span className="mx-3 text-right">Subtotal</span>
        </div>

        {/* ITEMS */}
        <div className="px-3">
          {items.map((item, i) => {
            const name = item.product?.name ?? item.name ?? 'Item'
            const qty = item.qty ?? 1
            const subtotal = Number(item.subtotal ?? 0)
            const price = item.unit_price
              ? Number(item.unit_price)
              : subtotal / qty
            const prom = item.promotion ?? item.product?.promotion

            const opts = [
              item.size?.name,
              item.sugar_level?.name,
              item.ice_level?.name,
              ...(item.addons?.map(a => a.addon?.name).filter(Boolean) ?? []),
            ]
              .filter(Boolean)
              .join(' | ')

            return (
              <div key={i} className="py-1" style={{ borderBottom: i < items.length - 1 ? '1px dashed #e5e5e5' : 'none' }}>
                <div className="grid grid-cols-[14px_auto_24px_52px_50px] text-[11px] py-2">
                  <span className="text-center text-gray-400">{i + 1}</span>
                  <span className="truncate text-gray-800 font-medium">{name}</span>
                  <span className="text-center text-gray-700">{qty}</span>
                  <span className="text-right text-gray-600">${price.toFixed(2)}</span>
                  <span className="text-right text-gray-800 font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {opts && (
                  <div className="text-[9px] text-gray-400 ml-7 mt-0.5 mb-1">
                    {opts}
                  </div>
                )}
                {prom && prom.type !== 'combo_discount' && prom.type !== 'combo' && (
                  <div className="text-[9px] text-green-600 ml-7 mb-1 font-medium">
                    {getPromotionLabel(prom)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SUBTOTAL */}
        <div className="grid grid-cols-[14px_auto_24px_52px_50px] gap-0 text-[11px] px-10 py-1" style={{ borderTop: '1px solid #ccc' }}>
          <span />
          <span className="text-right col-span-3 text-gray-500">Subtotal</span>
          <span className="text-right text-gray-500">${(Number(order.total ?? 0) + Number(order.discount ?? 0)).toFixed(2)}</span>
        </div>

        {/* PROMOTION DISCOUNT */}
        {Number(order.discount ?? 0) > 0 && items.filter(i => i.promotion).length > 0 && (
          <>
            {items.filter(i => i.promotion).map((item, idx) => {
            const prom = item.promotion
              const price = item.unit_price ? Number(item.unit_price) : Number(item.subtotal ?? 0) / (item.qty ?? 1)
              const d = calcDiscount(price, prom, item.qty ?? 1)
              if (d <= 0) return null
              const displayQty = prom?.type === 'buy_x_get_y' ? Math.round(d / price) : (item.qty ?? 1)
              const name = item.product?.name ?? item.name ?? 'Item'
              const sizeName = item.size?.name ?? ''
              const label = name + (sizeName ? ` (${sizeName})` : '')
              return (
                <div key={idx} className="grid grid-cols-[14px_auto_24px_52px_50px] gap-0 text-[9px] px-10 py-0.5">
                  <span />
                  <span className="text-right col-span-3 text-green-600 font-medium">{getPromotionLabel(prom)} &mdash; {label} x{displayQty}</span>
                  <span className="text-right text-green-600 font-medium">-${d.toFixed(2)}</span>
                </div>
              )
            })}
            <div className="grid grid-cols-[14px_auto_24px_52px_50px] gap-0 text-[11px] px-10 py-1" style={{ borderTop: '1px dashed #ccc' }}>
              <span />
              <span className="text-right col-span-3 text-green-600 font-semibold">Total Discount{(() => { const pNames = [...new Set(items.filter(i=>i.promotion).map(i=>i.promotion.name).filter(Boolean))].join(', '); return pNames ? ' ('+pNames+')' : '' })()}</span>
              <span className="text-right text-green-600 font-semibold">-${Number(order.discount).toFixed(2)}</span>
            </div>
          </>
        )}
        {Number(order.discount ?? 0) > 0 && items.filter(i => i.promotion).length === 0 && (
          <div className="grid grid-cols-[14px_auto_24px_52px_50px] gap-0 text-[11px] px-10 py-1" style={{ borderTop: '1px dashed #ccc' }}>
            <span />
            <span className="text-right col-span-3 text-green-600 font-medium">Promotion</span>
            <span className="text-right text-green-600 font-medium">-${Number(order.discount).toFixed(2)}</span>
          </div>
        )}

        {/* TOTAL */}
        <div className="grid grid-cols-[14px_auto_24px_52px_50px] gap-0 text-[11px] font-bold px-10 py-2" style={{ borderTop: '2px solid #333' }}>
          <span />
          <span className="text-right col-span-3 text-gray-800">TOTAL</span>
          <span className="text-right text-gray-800">${Number(order.total || 0).toFixed(2)}</span>
        </div>

        {/* FOOTER */}
        <div className="text-center text-[10px] text-gray-500 pb-4 pt-2" style={{ borderTop: '1px dashed #ccc' }}>
          — Thank you for your visit! —
        </div>
      </div>

      {/* DOWNLOAD */}
      <button
        onClick={downloadPDF}
        disabled={loading}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm"
      >
        {loading ? 'Generating...' : 'Download PDF'}
      </button>
    </div>
  )
}
