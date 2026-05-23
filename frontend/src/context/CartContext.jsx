import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

function getKey(product, size, sugar, ice, addOn) {
  return `${product.id}-${size}-${sugar}-${ice}-${addOn}`
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('customerCart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('customerCart', JSON.stringify(items))
  }, [items])

  function addItem(product, { size, sugar, ice, addOn, qty, unitPrice }) {
    const key = getKey(product, size, sugar, ice, addOn)
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { ...product, key, size, sugar, ice, addOn, unitPrice, qty }]
    })
  }

  function updateQty(key, qty) {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.key !== key))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.key === key ? { ...i, qty } : i))
      )
    }
  }

  function removeItem(key) {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
