import CustomerSearch from './CustomerSearch.jsx'
import TableSelector from './TableSelector.jsx'
import CartItem from './CartItem.jsx'
import PaymentSelector from './PaymentSelector.jsx'

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
  return (
    <div className="w-96 shrink-0 flex flex-col">
      <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
        <h2 className="text-base font-semibold text-gray-800 px-4 pt-4 pb-3 shrink-0 border-b border-gray-100">
          Current Order
        </h2>

        <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-gray-100">
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

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">No items added yet.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((c) => (
                <CartItem key={c.key} item={c} products={products} onUpdateQty={onUpdateQty} />
              ))}
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