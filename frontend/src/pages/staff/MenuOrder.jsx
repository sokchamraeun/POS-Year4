import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const sizes = ['Small', 'Medium', 'Large']
const sugarLevels = ['0%', '25%', '50%', '75%', '100%']

const menu = [
  { id: 1, name: 'Americano', price: 8.90, category: 'Coffee', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop', addOns: [{ name: 'Extra Shot', price: 2.00 }, { name: 'Whipped Cream', price: 1.50 }] },
  { id: 2, name: 'Caffe Latte', price: 10.90, category: 'Coffee', image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=400&fit=crop', addOns: [{ name: 'Extra Shot', price: 2.00 }, { name: 'Vanilla', price: 1.00 }] },
  { id: 3, name: 'Mocha', price: 12.50, category: 'Coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', addOns: [{ name: 'Whipped Cream', price: 1.50 }, { name: 'Chocolate Drizzle', price: 1.50 }] },
  { id: 4, name: 'Espresso', price: 7.50, category: 'Coffee', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=400&fit=crop', addOns: [{ name: 'Extra Shot', price: 2.00 }] },
  { id: 5, name: 'Cappuccino', price: 11.50, category: 'Coffee', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop', addOns: [{ name: 'Cinnamon', price: 1.00 }, { name: 'Whipped Cream', price: 1.50 }] },
  { id: 6, name: 'Caramel Macchiato', price: 13.90, category: 'Coffee', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop', addOns: [{ name: 'Caramel Drizzle', price: 1.50 }, { name: 'Extra Shot', price: 2.00 }] },
  { id: 7, name: 'Matcha Latte', price: 12.90, category: 'Tea', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop', addOns: [{ name: 'Vanilla', price: 1.00 }] },
  { id: 8, name: 'Cold Brew', price: 9.90, category: 'Coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', addOns: [{ name: 'Whipped Cream', price: 1.50 }, { name: 'Vanilla', price: 1.00 }] },
]

const categories = ['All', 'Coffee', 'Tea']

export default function MenuOrder() {
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState([])
  const [options, setOptions] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [tableNo, setTableNo] = useState('')
  const [success, setSuccess] = useState('')

  const filtered = category === 'All' ? menu : menu.filter((m) => m.category === category)

  const defaultOpt = { size: 'Medium', sugar: '50%', addOn: '' }

  function getOpt(id) { return options[id] || defaultOpt }

  function setOpt(id, field, value) {
    setOptions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || defaultOpt), [field]: value },
    }))
  }

  function addOnPrice(item, addOn) {
    if (!addOn) return 0
    const a = item.addOns.find((a) => a.name === addOn)
    return a ? a.price : 0
  }

  function addToCart(item) {
    const { size, sugar, addOn } = getOpt(item.id)
    const key = `${item.id}-${size}-${sugar}-${addOn}`
    const unitPrice = item.price + addOnPrice(item, addOn)
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key)
      if (existing) {
        return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c))
      }
      return [...prev, { ...item, key, size, sugar, addOn, unitPrice, qty: 1 }]
    })
  }

  function updateQty(key, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.key !== key))
    } else {
      setCart((prev) => prev.map((c) => (c.key === key ? { ...c, qty } : c)))
    }
  }

  function placeOrder() {
    const order = {
      id: `#${Date.now().toString().slice(-6)}`,
      customer: customerName || 'Guest',
      phone: phone || '-',
      table: tableNo || '-',
      items: cart.reduce((sum, c) => sum + c.qty, 0),
      total: total,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      payment: 'Unpaid',
      detail: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        price: c.unitPrice,
        size: c.size,
        sugar: c.sugar,
        addOn: c.addOn,
      })),
    }
    const existing = JSON.parse(localStorage.getItem('newOrders') || '[]')
    localStorage.setItem('newOrders', JSON.stringify([order, ...existing]))
    setCart([])
    setOptions({})
    setCategory('All')
    setCustomerName('')
    setPhone('')
    setTableNo('')
    setSuccess(`Order ${order.id} placed successfully!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const total = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gray-100 px-6 pt-6 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {success && (
            <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
              {success}
            </div>
          )}

          <div className="flex gap-6 px-6 pb-6 pt-4 flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => {
                  const opt = getOpt(item.id)
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                      <div className="p-3 pb-0">
                        <img src={item.image} alt={item.name} className="w-full aspect-square object-cover rounded-lg" />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                          <span className="text-sm font-bold text-blue-600">${item.price.toFixed(2)}</span>
                        </div>

                        <select value={opt.size} onChange={(e) => setOpt(item.id, 'size', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={opt.sugar} onChange={(e) => setOpt(item.id, 'sugar', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {sugarLevels.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={opt.addOn} onChange={(e) => setOpt(item.id, 'addOn', e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">No Add On</option>
                          {item.addOns.map((a) => <option key={a.name} value={a.name}>{a.name} (+${a.price.toFixed(2)})</option>)}
                        </select>

                        <button onClick={() => addToCart(item)}
                          className="mt-auto w-full bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Add to Order
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="w-80 shrink-0 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                <h2 className="text-base font-semibold text-gray-800 px-4 pt-4 pb-3 shrink-0 border-b border-gray-100">Current Order</h2>

                <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-gray-100">
                  <input type="text" placeholder="Customer Name" value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Phone Number" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Table No." value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-400">No items added yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {cart.map((c) => (
                        <div key={c.key} className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.size}, {c.sugar}{c.addOn ? `, +${c.addOn}` : ''}</p>
                            <p className="text-xs text-gray-500">${c.unitPrice.toFixed(2)} ea</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(c.key, c.qty - 1)}
                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors">-</button>
                              <span className="text-sm font-medium text-gray-800 w-5 text-center">{c.qty}</span>
                              <button onClick={() => updateQty(c.key, c.qty + 1)}
                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors">+</button>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">${(c.unitPrice * c.qty).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 px-4 py-4 shrink-0">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <button onClick={placeOrder} className="mt-3 w-full bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors">
                        Place Order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
