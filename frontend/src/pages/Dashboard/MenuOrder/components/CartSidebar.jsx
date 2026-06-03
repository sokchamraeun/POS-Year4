import CustomerSearch from './CustomerSearch.jsx'
import TableSelector from './TableSelector.jsx'
import CartItem from './CartItem.jsx'
import PaymentSelector from './PaymentSelector.jsx'
import { Trash2 } from 'lucide-react'

import { calcFinalPrice, getPromotionLabel } from '../../../../utils/promotion.js'

export default function CartSidebar({
  cart,
  products,
  fullTotal,
  total,
  discountTotal,
  placing,
  onUpdateQty,
  onPlaceOrder,
  customerSearch,
  showCustomerDropdown,
  filteredCustomers,
  onCustomerSearchChange,
  onCustomerSelect,
  phone,
  onPhoneChange,
  tableId,
  onTableChange,
  tables,
  paymentMethod,
  onPaymentChange,
  comboResult,
  buyXGetYResult,
}) {
  const handleDeleteItem = (key) => {
    onUpdateQty(key, 0)
  }

  return (
    <div className="w-96 shrink-0 flex flex-col">
      <div className="bg-white border-l-2 border-teal-100 shadow-sm rounded-tl-2xl mt-3 mr-3 mb-3 rounded-br-2xl rounded-bl-2xl rounded-tr-2xl flex flex-col flex-1 overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 px-4 pt-4 pb-3 shrink-0 border-b border-gray-100">
          Current Order
        </h2>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">No items added yet.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((c) => {
                const cur = products?.find(p => p.id === c.id)
                const isBogo = cur?.promotion?.type === 'buy_x_get_y'
                
                return (
                  <div key={c.key} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow">
                    {/* Product Name + Total Price */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        {isBogo && cur?.promotion && (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            Buy {cur.promotion.buy_qty} Get {cur.promotion.free_qty} Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-800">${(c.unitPrice * c.qty).toFixed(2)}</p>
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.size && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{c.size}</span>}
                      {c.sugar && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{c.sugar}</span>}
                      {c.ice && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{c.ice}</span>}
                      {c.addOn && <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">+{c.addOn}</span>}
                    </div>

                    {/* Unit Price + Qty + Delete */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const hasPromo = cur?.promotion && !['combo', 'combo_discount'].includes(cur.promotion.type)
                          const discPrice = hasPromo ? calcFinalPrice(c.unitPrice, cur.promotion, 1) : c.unitPrice
                          if (hasPromo && discPrice !== c.unitPrice) {
                            return <><span className="text-[10px] text-gray-400 line-through">${c.unitPrice.toFixed(2)}</span><span className="text-sm font-semibold text-teal-600 ml-1">${discPrice.toFixed(2)}</span></>
                          }
                          return <span className="text-sm font-semibold text-teal-600">${c.unitPrice.toFixed(2)}</span>
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                          <button onClick={() => onUpdateQty(c.key, Math.max(1, c.qty - 1))} className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-white rounded-md transition-colors">-</button>
                          <span className="w-6 text-center text-sm font-medium text-gray-800">{c.qty}</span>
                          <button onClick={() => onUpdateQty(c.key, c.qty + 1)} className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-white rounded-md transition-colors">+</button>
                        </div>
                        <button onClick={() => handleDeleteItem(c.key)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-t border-gray-100">
              <CustomerSearch
                customerSearch={customerSearch}
                showDropdown={showCustomerDropdown}
                filteredCustomers={filteredCustomers}
                onSearchChange={onCustomerSearchChange}
                onSelect={onCustomerSelect}
                phone={phone}
                onPhoneChange={onPhoneChange}
              />
              <TableSelector tableId={tableId} onChange={onTableChange} tables={tables} />
            </div>

            <div className="border-t border-gray-200 px-4 py-4 shrink-0">
              {discountTotal > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wide">Promotions</p>
                  {/* Regular non-buy_x_get_y promotions */}
                  {cart.map(c => {
                    const cur = products?.find(p => p.id === c.id)
                    const rows = []
                    if (cur?.promotion && cur.promotion.type !== 'buy_x_get_y' && cur.promotion.type !== 'combo_discount' && cur.promotion.type !== 'combo') {
                      const d = c.unitPrice * c.qty - calcFinalPrice(c.unitPrice, cur.promotion, c.qty) * c.qty
                      if (d > 0) {
                        rows.push(
                          <div key={c.key + '-reg'} className="flex items-center justify-between text-[10px] text-green-600 mb-0.5">
                            <span className="truncate flex-1 mr-2">{getPromotionLabel(cur.promotion)} &mdash; {c.name}</span>
                            <span className="font-medium">-${d.toFixed(2)}</span>
                          </div>
                        )
                      }
                    }
                    return rows
                  })}
                  {/* Grouped Buy X Get Y promotions */}
                  {buyXGetYResult?.totalDiscount > 0 && (() => {
                    const items = cart.filter(c => buyXGetYResult.itemDiscounts[c.key])
                    if (items.length === 0) return null
                    const prom = items[0]?.promotion
                    return (
                      <div key="bxgy-total" className="flex items-center justify-between text-[10px] text-green-600 mb-0.5">
                        <span className="truncate flex-1 mr-2">{getPromotionLabel(prom)}</span>
                        <span className="font-medium">-${buyXGetYResult.totalDiscount.toFixed(2)}</span>
                      </div>
                    )
                  })()}
                  {comboResult?.totalDiscount > 0 && (() => {
                    const comboKeys = Object.keys(comboResult.itemDiscounts)
                    const comboItems = cart.filter(c => comboKeys.includes(c.key))
                    const promo = comboItems[0]?.promotion
                    const names = [...new Set(comboItems.map(c => c.name))]
                    const label = names.join(' + ') + (promo?.value ? ` = $${Number(promo.value).toFixed(2)}` : '')
                    return (
                      <div key="combo-total" className="flex items-center justify-between text-[10px] text-green-600 mb-0.5">
                        <span className="truncate flex-1 mr-2">{label}</span>
                        <span className="font-medium">-${comboResult.totalDiscount.toFixed(2)}</span>
                      </div>
                    )
                  })()}
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-gray-800 mb-3">
                <span>Total</span>
                <span className="text-base font-bold text-teal-600">${total.toFixed(2)}</span>
              </div>
              <PaymentSelector value={paymentMethod} onChange={onPaymentChange} />
              <button
                onClick={onPlaceOrder}
                disabled={placing}
                className="mt-3 w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-medium py-2.5 rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {placing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}