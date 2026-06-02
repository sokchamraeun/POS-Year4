import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import ProductCard from './components/ProductCard.jsx'
import CartSidebar from './components/CartSidebar.jsx'
import { calcFinalPrice, calcComboCart, calcBuyXGetYGrouped } from '../../../utils/promotion.js'

const API_URL = import.meta.env.VITE_API_URL
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

export default function MenuOrder() {
  const [category, setCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState([])
  const [cart, setCart] = useState([])
  const [options, setOptions] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [tableId, setTableId] = useState('')
  const [tables, setTables] = useState([])
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('not_yet')
  const [productSearch, setProductSearch] = useState('')
  const [placing, setPlacing] = useState(false)
  const [success, setSuccess] = useState('')


  const filteredCustomers = customers.filter((c) =>
    (c.name ?? '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone ?? '').includes(customerSearch)
  )

  useEffect(() => {
    async function fetchAll() {
      try {
        const [prodRes, catRes, tblRes, custRes, recRes] = await Promise.all([
          fetch(`${API_URL}/products?per_page=200`, { headers: headers() }).then((r) => r.json()),
          fetch(`${API_URL}/categories?per_page=100`, { headers: headers() }).then((r) => r.json()),
          fetch(`${API_URL}/tables/available`, { headers: headers() }).then((r) => r.json()),
          fetch(`${API_URL}/customers?per_page=200`, { headers: headers() }).then((r) => r.json()),
          fetch(`${API_URL}/recipes?per_page=500`, { headers: headers() }).then((r) => r.json()),
        ])
        setProducts(prodRes.data ?? [])
        const cats = [...new Set((catRes.data ?? catRes).map((c) => c.name))]
        setCategories(['All', ...cats])
        setTables(tblRes.data ?? tblRes ?? [])
        setCustomers(custRes.data ?? custRes ?? [])
        setRecipes(recRes.data ?? recRes ?? [])
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = (category === 'All' ? products : products.filter((p) => p.category?.name === category))
    .filter((p) => p.status)
    .filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))

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
  function addOnPrice(product, addOnName, sizeName) {
    if (!addOnName) return 0
    const a = product.addons?.find((a) => a.name === addOnName)
    if (!a) return 0
    const size = product.sizes?.find((s) => s.name === sizeName)
    if (!size) return Number(a.price) || 0
    const sp = a.size_prices?.find((sp) => sp.size_id === size.id)
    return sp ? Number(sp.price) : (Number(a.price) || 0)
  }

  function addToCart(product) {
    const opt = { ...getDefaultOpt(product), ...getOpt(product.id) }
    const { size, sugar, ice, addOn } = opt

    const sizeObj = product.sizes?.find((s) => s.name === size)
    const sizeId = sizeObj?.id
    if (!sizeId || !recipes.some((r) => r.product_id === product.id && r.size_id === sizeId)) {
      alert('No recipe defined for this product size. Cannot add to order.')
      return
    }

    const key = `${product.id}-${sizeId}-${sugar}-${ice}-${addOn}`
    const unitPrice = getBasePrice(product, size) + addOnPrice(product, addOn, size)
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

  async function placeOrder() {
    setPlacing(true)
    try {
      let finalCustomerId = customerId

      if (!finalCustomerId && customerName) {
        const custRes = await fetch(`${API_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers() },
          body: JSON.stringify({ name: customerName, phone: phone || null }),
        })
        if (custRes.ok) {
          const newCust = await custRes.json()
          finalCustomerId = newCust.id ?? newCust.data?.id
        }
      }

      const items = cart.map((c) => {
        const product = products.find((p) => p.id === c.id)
        const size = product?.sizes?.find((s) => s.name === c.size)
        const sugar = product?.sugar_levels?.find((s) => s.name === c.sugar)
        const ice = product?.ice_levels?.find((i) => i.name === c.ice)
        const addon = product?.addons?.find((a) => a.name === c.addOn)
        return {
          product_id: c.id,
          size_id: size?.id ?? null,
          sugar_level_id: sugar?.id ?? null,
          ice_level_id: ice?.id ?? null,
          qty: c.qty,
          unit_price: c.unitPrice,
          subtotal: c.unitPrice * c.qty,
          addons: addon ? [{ addon_id: addon.id, price: Number(addon.price ?? 0) }] : [],
          promotion_snapshot: product?.promotion ?? null,
        }
      })

      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({
          customer_id: finalCustomerId || null,
          table_id: tableId || null,
          total,
          discount: discountTotal,
          status: 'New',
          payment_method: paymentMethod === 'not_yet' ? null : paymentMethod,
          payment_status: paymentMethod === 'not_yet' ? 'Unpaid' : (paymentMethod === 'KHQR' ? 'Unpaid' : 'Paid'),
          items,
        }),
      })

      if (!orderRes.ok) {
        const errData = await orderRes.json()
        setSuccess(`Error: ${errData.message || 'Failed to place order'}`)
        setTimeout(() => setSuccess(''), 4000)
        setPlacing(false)
        return
      }

      const createdOrder = await orderRes.json()
      const dbOrderId = createdOrder.id ?? null
      const orderTotal = total

      const localOrder = {
        id: `#${Date.now().toString().slice(-6)}`,
        customer: customerName || 'Guest',
        phone: phone || '-',
        table: tables.find((t) => t.id === Number(tableId))?.name || tableId || '-',
        items: cart.reduce((sum, c) => sum + c.qty, 0),
        total,
        date: new Date().toISOString().slice(0, 10),
        status: 'New',
        payment: paymentMethod === 'not_yet' ? 'Unpaid' : (paymentMethod === 'KHQR' ? 'Unpaid' : 'Paid'),
        paymentMethod: paymentMethod === 'not_yet' ? null : paymentMethod,
        detail: cart.map((c) => {
          const cur = products.find((p) => p.id === c.id)
          return {
            name: c.name,
            qty: c.qty,
            price: c.unitPrice,
            size: c.size,
            sugar: c.sugar,
            ice: c.ice,
            addOn: c.addOn,
            promotion: cur?.promotion ?? null,
          }
        }),
      }
      const existing = JSON.parse(localStorage.getItem('newOrders') || '[]')
      localStorage.setItem('newOrders', JSON.stringify([localOrder, ...existing]))

      setCart([])
      setOptions({})
      setCategory('All')
      setCustomerName('')
      setPhone('')
      setCustomerId('')
      setCustomerSearch('')
      setTableId('')
      setPlacing(false)

      if (paymentMethod === 'KHQR' && dbOrderId) {
        try {
          const initRes = await fetch(`${API_URL}/orders/payment/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers() },
            body: JSON.stringify({
              order_id: dbOrderId,
              return_url: window.location.origin + '/staff/menu-order',
            }),
          })
          const initData = await initRes.json()
          if (initData.checkout_url) {
            window.location.href = initData.checkout_url
          }
        } catch {
          // fallback silently
        }
      }

      setSuccess(`Order placed successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setPlacing(false)
      setSuccess('Failed to place order. Check connection.')
      setTimeout(() => setSuccess(''), 4000)
    }
  }

  const fullTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)
  const comboResult = useMemo(() => calcComboCart(cart, products), [cart, products])
  const buyXGetYResult = useMemo(() => calcBuyXGetYGrouped(cart), [cart])
  const total = cart.reduce((sum, c) => {
    const cur = products.find((p) => p.id === c.id)
    const baseFinal = cur?.promotion?.type === 'buy_x_get_y' ? c.unitPrice : calcFinalPrice(c.unitPrice, cur?.promotion, c.qty)
    const comboDisc = (comboResult.itemDiscounts[c.key] || 0) / c.qty
    const bxgyDisc = (buyXGetYResult.itemDiscounts[c.key] || 0) / c.qty
    return sum + (baseFinal - comboDisc - bxgyDisc) * c.qty
  }, 0)
  const discountTotal = fullTotal - total

  function handleCustomerSearchChange(value) {
    setCustomerSearch(value)
    setShowCustomerDropdown(true)
    setCustomerId('')
    setCustomerName(value)
    if (!value) {
      setPhone('')
    }
  }

  function handleCustomerSelect(c) {
    setCustomerId(c.id)
    setCustomerName(c.name)
    setPhone(c.phone ?? '')
    setCustomerSearch(c.name)
    setShowCustomerDropdown(false)
  }

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
          <CategoryFilter
            categories={categories}
            category={category}
            onSelect={setCategory}
            search={productSearch}
            onSearchChange={setProductSearch}
            onSearchClear={() => setProductSearch('')}
          />

          {success && (
            <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
              {success}
            </div>
          )}

          <div className="flex gap-6 px-6 pb-6 pt-4 flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product) => {
                  const opt = { ...getDefaultOpt(product), ...getOpt(product.id) }
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      opt={opt}
                      onSetOpt={setOpt}
                      onAddToCart={addToCart}
                    />
                  )
                })}
                {filtered.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No products found.
                  </div>
                )}
              </div>
            </div>

            <CartSidebar
              cart={cart}
              products={products}
              fullTotal={fullTotal}
              total={total}
              discountTotal={discountTotal}
              placing={placing}
              onUpdateQty={updateQty}
              onPlaceOrder={placeOrder}
              comboResult={comboResult}
              buyXGetYResult={buyXGetYResult}
              customerSearch={customerSearch}
              showCustomerDropdown={showCustomerDropdown}
              filteredCustomers={filteredCustomers}
              onCustomerSearchChange={handleCustomerSearchChange}
              onCustomerSelect={handleCustomerSelect}
              phone={phone}
              onPhoneChange={setPhone}
              tableId={tableId}
              onTableChange={setTableId}
              tables={tables}
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
