import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { calcDiscount, getPromotionLabel } from '../../utils/promotion.js'
import { mergeOrderItems } from '../../utils/helpers.js'

const WEBSITE_URL = 'https://pos-year4.vercel.app'

const getItemMergeKey = (item) =>
  `${item.product?.name ?? item.name}|${item.size?.name ?? ''}|${item.sugar_level?.name ?? ''}|${item.ice_level?.name ?? ''}|${(item.addons ?? []).map(a => a.addon?.name).sort().join(',')}|${item.promotion?.type ?? ''}`

export default function Invoice({ order, customer }) {
  const qrRef = useRef(null)
  const items = mergeOrderItems(order.items ?? [], getItemMergeKey)
  const customerName = customer?.name ?? order.customer?.name ?? 'Guest'
  const customerPhone = customer?.phone ?? order.customer?.phone ?? ''

  function printReceipt() {
    const w = window.open('', '_blank')
    const o = order
    const RATE = 4100
    const qrCanvas = qrRef.current
    let qrDataUrl = ''
    try { qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : '' } catch { qrDataUrl = '' }
    const shopName = 'VISAL CAFE'
    const shopLocation = ''
    const wifiName = ''
    const wifiPass = ''
    const shopPhone = ''
    const riel = (usd) => Math.round((usd * RATE) / 100) * 100
    const orderType = o.table ? 'DINE-IN' : 'TAKE-AWAY'
    const itemsHtml = items.map((item) => {
      const name = item.product?.name ?? item.name ?? 'Item'
      const qty = item.qty ?? 1
      const subtotal = Number(item.subtotal ?? 0)
      const price = item.unit_price ? Number(item.unit_price) : subtotal / qty
      const opts = [item.size?.name, item.sugar_level?.name, item.ice_level?.name, ...(item.addons?.map(a => a.addon?.name).filter(Boolean) ?? [])].filter(Boolean).join(', ')
      const promLabel = item.promotion && item.promotion.type !== 'combo_discount' && item.promotion.type !== 'combo' ? `<div class="sub2">(${getPromotionLabel(item.promotion)})</div>` : ''
      return `<tr>
        <td>${name}${opts ? '<div class="sub2">'+opts+'</div>' : ''}${promLabel}</td>
        <td class="c">${qty}</td>
        <td class="r">${price.toFixed(2)}</td>
        <td class="r">${subtotal.toFixed(2)}</td>
      </tr>`
    }).join('')
    const discountTotal = Number(o.discount ?? 0)
    const subtotalVal = Number(o.total ?? 0) + discountTotal
    const discountHtml = discountTotal > 0
      ? `<tr><td colspan="3" class="r" style="font-size:10px;color:#555">Subtotal</td><td class="r" style="font-size:10px;color:#555">${subtotalVal.toFixed(2)}</td></tr>`
        + `<tr><td colspan="3" class="r" style="font-size:10px">Promotion</td><td class="r" style="font-size:10px">-${discountTotal.toFixed(2)}</td></tr>`
      : ''
    w.document.write(`
      <html><head><title>Receipt ${o.id}</title>
      <style>
        body { font-family: 'Courier New', 'Khmer OS System', 'Noto Sans Khmer', monospace; font-size: 11px; margin: 0; padding: 10px; width: 72mm; color: #000; }
        .brand { font-family: 'Khmer OS Muol Light', 'Noto Serif Khmer', 'Khmer OS', Georgia, serif; font-size: 22px; font-weight: 900; letter-spacing: 1px; text-align: center; margin: 0; line-height: 1.2; }
        .brand-en { font-size: 14px; font-weight: 900; letter-spacing: 2px; text-align: center; margin: 2px 0 0; }
        .subkh { font-family: 'Khmer OS', 'Noto Sans Khmer', sans-serif; text-align: center; font-size: 13px; margin: 4px 0 8px; }
        .code { text-align: center; font-size: 11px; margin-bottom: 2px; }
        .type { font-size: 13px; font-weight: bold; margin: 8px 0 4px; }
        .meta { font-size: 11px; line-height: 1.6; }
        .meta b { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 2px; font-size: 10px; text-align: left; }
        th.r, td.r { text-align: right; }
        th.c, td.c { text-align: center; }
        td { padding: 4px 2px; font-size: 11px; vertical-align: top; }
        .sub2 { font-size: 8px; color: #555; }
        .grand td { border-top: 1px solid #000; font-weight: bold; font-size: 13px; padding-top: 6px; }
        .rate { font-size: 10px; }
        .dash { border-top: 1px dashed #888; margin: 8px 0; }
        .foot { text-align: center; font-size: 9px; margin-top: 10px; line-height: 1.6; }
        .qrbox { text-align: center; margin-top: 10px; }
        .qrcap { font-size: 9px; margin-top: 4px; line-height: 1.4; }
      </style></head><body>
      <div class="brand">${shopName}</div>
      <div style="height:6px"></div>
      <div class="code">No. #${o.id}</div>
      <div class="type">${orderType}</div>
      <div class="meta">
        Date&nbsp;&nbsp;&nbsp;&nbsp;: ${(o.created_at ?? '').slice(0, 10)}<br>
        Cashier&nbsp;: ${o.printed_by?.name || 'Staff'}<br>
        Customer: ${customerName}${customerPhone ? ' ('+customerPhone+')' : ''}<br>
        ${o.table ? 'Table&nbsp;&nbsp;&nbsp;: <b>'+o.table.name+'</b><br>' : ''}
        Trans No: ${o.id}
      </div>
      <table>
        <thead><tr><th>Description</th><th class="c">QTY</th><th class="r">Unit Price</th><th class="r">Amount</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          ${discountHtml}
          <tr class="grand"><td colspan="3" class="r">Grand total ($)</td><td class="r">${Number(o.total || 0).toFixed(2)}</td></tr>
          <tr><td colspan="3" class="r" style="font-size:11px">Grand total (R)</td><td class="r" style="font-size:11px">${riel(Number(o.total || 0)).toLocaleString()}</td></tr>
          <tr><td colspan="4" class="rate">Exchange rate 1 USD = ${RATE.toLocaleString()} R</td></tr>
          <tr><td colspan="4" style="padding-top:6px">${o.payment_method || 'Cash'} &middot; ${o.payment_status || 'Unpaid'}</td></tr>
        </tfoot>
      </table>
      <div class="dash"></div>
      <div class="foot">
        ${shopLocation ? shopLocation + '<br>' : ''}
        ${shopPhone ? 'Tel: ' + shopPhone + '<br>' : ''}
        ${wifiName ? 'WiFi: ' + wifiName + (wifiPass ? ' / ' + wifiPass : '') + '<br>' : ''}
        Thank you &mdash; See you again!
      </div>
        ${qrDataUrl ? `<div class="qrbox">
          <img src="${qrDataUrl}" width="120" height="120" alt="website" />
          <div class="qrcap">Scan to order online<br>${WEBSITE_URL}</div>
        </div>` : ''}
      <script>window.onload=function(){window.print();window.close();}</script>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="w-full overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-700 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Receipt #{order.id}</h2>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
              order.payment_status === 'Paid'
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'bg-red-500/20 text-red-200'
            }`}>
              {order.payment_status === 'Paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          <p className="mt-1 text-xs text-teal-100">{customerName}{customerPhone ? ` — ${customerPhone}` : ''}</p>
          <p className="text-[10px] text-teal-200/70">{order.created_at?.slice(0, 10) ?? ''}</p>
        </div>

        <div className="p-4">
          {/* Info row */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Status:</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {order.status || 'New'}
            </span>
            {order.payment_method && (
              <>
                <span className="text-teal-300">•</span>
                <span className="font-semibold text-slate-700">Payment:</span>
                <span className="capitalize text-slate-600">{order.payment_method}</span>
              </>
            )}
            {order.table && (
              <>
                <span className="text-teal-300">•</span>
                <span className="font-semibold text-slate-700">Table:</span>
                <span className="text-slate-600">{order.table.name}</span>
              </>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-teal-100 bg-teal-50 text-left font-bold text-teal-900">
                  <th className="py-2 pr-2">Item</th>
                  <th className="py-2 px-2">Options</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 pl-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
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
                    item.sugar_level?.name ? (item.sugar_note || item.sugar_level.name) : null,
                    item.ice_level?.name ? (item.ice_note || item.ice_level.name) : null,
                    ...(item.addons?.map(a => a.addon?.name).filter(Boolean) ?? []),
                  ].filter(Boolean)

                  return (
                    <tr key={i} className="border-b border-teal-100 hover:bg-teal-50/50">
                      <td className="py-2 pr-2 font-semibold text-slate-800">
                        {name}
                        {prom && prom.type !== 'combo_discount' && prom.type !== 'combo' && (
                          <span className="ml-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            {getPromotionLabel(prom)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {opts.length > 0 ? opts.join(' • ') : '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-700">{qty}</td>
                      <td className="py-2 px-2 text-right text-slate-600">${price.toFixed(2)}</td>
                      <td className="py-2 pl-2 text-right font-semibold text-slate-800">${subtotal.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="pt-3 text-right text-xs font-medium text-slate-500">Subtotal</td>
                  <td className="pt-3 text-right text-xs font-medium text-slate-500">${(Number(order.total ?? 0) + Number(order.discount ?? 0)).toFixed(2)}</td>
                </tr>
                {Number(order.discount ?? 0) > 0 && items.filter(i => i.promotion).length > 0 && items.filter(i => i.promotion).map((item, idx) => {
                  const prom = item.promotion
                  const price = item.unit_price ? Number(item.unit_price) : Number(item.subtotal ?? 0) / (item.qty ?? 1)
                  const d = calcDiscount(price, prom, item.qty ?? 1)
                  if (d <= 0) return null
                  const displayQty = prom?.type === 'buy_x_get_y' ? Math.round(d / price) : (item.qty ?? 1)
                  const name = item.product?.name ?? item.name ?? 'Item'
                  const sizeName = item.size?.name ?? ''
                  const label = name + (sizeName ? ` (${sizeName})` : '')
                  return (
                    <tr key={idx}>
                      <td colSpan={4} className="pt-1 text-right text-[10px] font-bold text-emerald-700">
                        {getPromotionLabel(prom)} &mdash; {label} x{displayQty}
                      </td>
                      <td className="pt-1 text-right text-[10px] font-bold text-emerald-700">-${d.toFixed(2)}</td>
                    </tr>
                  )
                })}
                {Number(order.discount ?? 0) > 0 && (
                  <tr>
                    <td colSpan={4} className="border-t border-dashed border-emerald-200 pt-2 text-right text-xs font-bold text-emerald-700">
                      {items.some(i => i.promotion) ? (() => { const pNames = [...new Set(items.filter(i=>i.promotion).map(i=>i.promotion.name).filter(Boolean))].join(', '); return `Total Discount${pNames ? ' ('+pNames+')' : ''}` })() : 'Promotion'}
                    </td>
                    <td className="border-t border-dashed border-emerald-200 pt-2 text-right text-xs font-bold text-emerald-700">-${Number(order.discount).toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="pt-3 text-right text-sm font-extrabold text-slate-900">Total</td>
                  <td className="pt-3 text-right text-sm font-extrabold text-teal-800">${Number(order.total || 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 border-t border-teal-100 pt-3 text-center text-[10px] text-slate-400">
            — Thank you for your visit! —
          </div>
          {/* Hidden QR used to embed the website link into the printed receipt */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }} aria-hidden="true">
            <QRCodeCanvas ref={qrRef} id="website-qr" value={WEBSITE_URL} size={140} level="M" />
          </div>
        </div>
      </div>

      <button
        onClick={printReceipt}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-teal-800 to-teal-700 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition-all hover:from-teal-700 hover:to-teal-600"
      >
        Print Receipt
      </button>
    </div>
  )
}
