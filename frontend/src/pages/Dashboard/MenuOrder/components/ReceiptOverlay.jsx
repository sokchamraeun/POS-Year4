import { useState, useEffect } from 'react'
import { X, Printer, CheckCircle2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

export default function ReceiptOverlay({ order: initialOrder, onClose }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof initialOrder === 'object' && initialOrder?.items) {
      setOrder(initialOrder)
      setLoading(false)
    } else if (typeof initialOrder === 'number') {
      fetchOrder(initialOrder)
    } else {
      setLoading(false)
    }
  }, [initialOrder])

  async function fetchOrder(id) {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { headers: headers() })
      const json = await res.json()
      setOrder(json.data ?? json)
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  function printReceipt() {
    window.print()
  }

  const now = new Date()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 py-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-800">Payment Receipt</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400">Loading receipt...</p>
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
              <div className="text-center border-b border-dashed border-slate-200 pb-3 mb-3">
                <p className="text-sm font-bold text-slate-800">POS Store</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Receipt</p>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 mb-3">
                <span>Order #{order?.id ?? order}</span>
                <span>{now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-2 space-y-2">
                {order?.items?.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-medium text-slate-800">
                      <span>{item.qty}x {item.product?.name}</span>
                      <span>${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-400 mt-0.5">
                      {item.size?.name && <span>{item.size.name}</span>}
                      {item.sugar_level?.name && <span>• {item.sugar_note || item.sugar_level.name}</span>}
                      {item.ice_level?.name && <span>• {item.ice_note || item.ice_level.name}</span>}
                      {item.addons?.map((a) => (
                        <span key={a.id}>• +{a.addon?.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-200 mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span>${Number(order?.total ?? 0).toFixed(2)}</span>
                </div>
                {Number(order?.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Discount</span>
                    <span>-${Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-teal-700 pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span>${Number(order?.total ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center border-t border-dashed border-slate-200 mt-3 pt-3">
                <p className="text-[10px] text-slate-400">Payment: KHQR • Paid</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Thank you!</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={printReceipt}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
