import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function MenuOrder() {
  const [category, setCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [options, setOptions] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [tableId, setTableId] = useState('')
  const [tables, setTables] = useState([])
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchAll() {
      try {
        const [firstPage, catRes, tblRes] = await Promise.all([
          fetch(`${API_URL}/products?page=1`).then((r) => r.json()),
          fetch(`${API_URL}/categories`).then((r) => r.json()),
          fetch(`${API_URL}/tables/available`).then((r) => r.json()),
        ])
        let allProducts = firstPage.data ?? []
        const lastPage = firstPage.last_page ?? 1
        const pages = []
        for (let p = 2; p <= lastPage; p++) {
          pages.push(
            fetch(`${API_URL}/products?page=${p}`)
              .then((r) => r.json())
              .then((j) => j.data ?? [])
          )
        }
        const rest = await Promise.all(pages)
        for (const arr of rest) allProducts = allProducts.concat(arr)

        setProducts(allProducts)
        const cats = (catRes.data ?? catRes).map((c) => c.name)
        setCategories(['All', ...cats])
        setTables(tblRes.data ?? tblRes ?? [])
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered =
    category === 'All'
      ? products
      : products.filter((p) => p.category?.name === category)

  function getDefaultOpt(product) {
    return {
      size: product.sizes?.[0]?.name || '',
      sugar: product.sugar_levels?.[0]?.name || '',
      ice: product.ice_levels?.[0]?.name || '',
      addOn: '',
    }
  }

  function getOpt(id) {
    return options[id]
  }

  function setOpt(id, field, value) {
    setOptions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }))
  }

  function getBasePrice(product, sizeName) {
    const size = product.sizes?.find((s) => s.name === sizeName)
    return size ? Number(size.pivot?.price ?? 0) : 0
  }
  function addOnPrice(product, addOnName) {
    if (!addOnName) return 0
    const a = product.addons?.find((a) => a.name === addOnName)
    return a ? Number(a.price) : 0
  }

  function addToCart(product) {
    const opt = getOpt(product.id) || getDefaultOpt(product)
    const { size, sugar, ice, addOn } = opt
    const key = `${product.id}-${size}-${sugar}-${ice}-${addOn}`
    const unitPrice = getBasePrice(product, size) + addOnPrice(product, addOn)
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key)
      if (existing) {
        return prev.map((c) =>
          c.key === key ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [
        ...prev,
        { ...product, key, size, sugar, ice, addOn, unitPrice, qty: 1 },
      ]
    })
  }

  function updateQty(key, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.key !== key))
    } else {
      setCart((prev) =>
        prev.map((c) => (c.key === key ? { ...c, qty } : c))
      )
    }
  }

  function placeOrder() {
    const order = {
      id: `#${Date.now().toString().slice(-6)}`,
      customer: customerName || 'Guest',
      phone: phone || '-',
      table: tables.find((t) => t.id === Number(tableId))?.name || tableId || '-',
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
        ice: c.ice,
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
    setTableId('')
    setSuccess(`Order ${order.id} placed successfully!`)
    setTimeout(() => setSuccess(''), 3000)
  }

  const total = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading menu...</p>
          </main>
        </div>
      </div>
    )
  }

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
                    category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
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
                {filtered.map((product) => {
                  const opt = getOpt(product.id) || getDefaultOpt(product)
                  const price = getBasePrice(product, opt.size)
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="p-3 pb-0">
                        {product.image ? (
                          <img
                            src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`}
                            alt={product.name}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-800">
                            {product.name}
                          </h3>
                          <span className="text-sm font-bold text-blue-600">
                            ${price.toFixed(2)}
                          </span>
                        </div>

                        <select
                          value={opt.size}
                          onChange={(e) =>
                            setOpt(product.id, 'size', e.target.value)
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {product.sizes?.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name} (${Number(s.pivot?.price ?? 0).toFixed(2)})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1.5 mb-1.5">
                          <select
                            value={opt.ice}
                            onChange={(e) =>
                              setOpt(product.id, 'ice', e.target.value)
                            }
                            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {product.ice_levels?.map((l) => (
                              <option key={l.id} value={l.name}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={opt.sugar}
                            onChange={(e) =>
                              setOpt(product.id, 'sugar', e.target.value)
                            }
                            className="flex-1 text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {product.sugar_levels?.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <select
                          value={opt.addOn}
                          onChange={(e) =>
                            setOpt(product.id, 'addOn', e.target.value)
                          }
                          className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Add On</option>
                          {product.addons?.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name} (+${Number(a.price).toFixed(2)})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => addToCart(product)}
                          className="mt-auto w-full bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No products found.
                  </div>
                )}
              </div>
            </div>

            <div className="w-80 shrink-0 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
                <h2 className="text-base font-semibold text-gray-800 px-4 pt-4 pb-3 shrink-0 border-b border-gray-100">
                  Current Order
                </h2>

                <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Table</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
                    ))}
                  </select>
                </div>

                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-400">
                      No items added yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {cart.map((c) => (
                        <div
                          key={c.key}
                          className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {c.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {c.size}, {c.sugar}, {c.ice}
                              {c.addOn ? `, +${c.addOn}` : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${c.unitPrice.toFixed(2)} ea
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQty(c.key, c.qty - 1)}
                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium text-gray-800 w-5 text-center">
                                {c.qty}
                              </span>
                              <button
                                onClick={() => updateQty(c.key, c.qty + 1)}
                                className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              ${(c.unitPrice * c.qty).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 px-4 py-4 shrink-0">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="mt-3 w-full bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                      >
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
