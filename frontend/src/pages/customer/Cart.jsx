import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import CartItem from '../../components/customer/CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQty, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const [orderNote, setOrderNote] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l1 5h13l1-5h2M6 8l1.5 9h9L18 8M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <CartItem
                  key={item.key}
                  item={item}
                  onUpdateQty={updateQty}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <textarea
                placeholder="Add order note..."
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Items ({totalItems})</span>
                <span className="text-gray-800 font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
      <MobileBottomNav />
    </div>
  )
}
