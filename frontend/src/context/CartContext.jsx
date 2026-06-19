import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { calcFinalPrice, calcDiscount, calcComboCart, calcBuyXGetYGrouped } from '../utils/promotion.js'

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

  function updateItem(oldKey, { size, sugar, ice, addOn, unitPrice, promotion, qty }) {
    setItems((prev) => {
      const current = prev.find((i) => i.key === oldKey)
      if (!current) return prev

      const newQty = qty ?? current.qty
      const newKey = `${current.id}-${size}-${sugar}-${ice}-${addOn}`

      // If another line already matches the new options, merge quantities into it
      const duplicate = prev.find((i) => i.key === newKey && i.key !== oldKey)
      if (duplicate) {
        return prev
          .filter((i) => i.key !== oldKey)
          .map((i) =>
            i.key === newKey ? { ...i, qty: i.qty + newQty } : i
          )
      }

      return prev.map((i) =>
        i.key === oldKey
          ? { ...i, key: newKey, size, sugar, ice, addOn, unitPrice, promotion, qty: newQty }
          : i
      )
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
  const fullTotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
  const comboResult = useMemo(() => calcComboCart(items, []), [items])
  const buyXGetYResult = useMemo(() => calcBuyXGetYGrouped(items), [items])

  const discountTotal = items.reduce((sum, i) => {
    if (i.promotion?.type === 'buy_x_get_y') return sum
    return sum + calcDiscount(i.unitPrice, i.promotion, i.qty)
  }, 0) + comboResult.totalDiscount + buyXGetYResult.totalDiscount

  const totalPrice = items.reduce((sum, i) => {
    const baseFinal = i.promotion?.type === 'buy_x_get_y' ? i.unitPrice : calcFinalPrice(i.unitPrice, i.promotion, i.qty)
    const comboDisc = (comboResult.itemDiscounts[i.key] || 0) / i.qty
    const bxgyDisc = (buyXGetYResult.itemDiscounts[i.key] || 0) / i.qty
    return sum + (baseFinal - comboDisc - bxgyDisc) * i.qty
  }, 0)

  const promotions = useMemo(() => {
    const map = {}
    for (const i of items) {
      if (i.promotion?.type === 'buy_x_get_y') continue
      if (i.promotion) {
        const key = i.promotion.id || i.promotion.type + i.unitPrice
        if (!map[key]) {
          map[key] = { ...i.promotion, discount: 0, unitPrice: i.unitPrice }
        }
        map[key].discount += calcDiscount(i.unitPrice, i.promotion, i.qty)
      }
    }
    const bxgyMap = {}
    for (const i of items) {
      if (i.promotion?.type !== 'buy_x_get_y') continue
      const pid = i.promotion.id || i.promotion.type + i.unitPrice
      if (!bxgyMap[pid]) {
        bxgyMap[pid] = { ...i.promotion, discount: 0, unitPrice: i.unitPrice }
      }
    }
    for (const [key, disc] of Object.entries(buyXGetYResult.itemDiscounts)) {
      const item = items.find(i => i.key === key)
      if (item) {
        const pid = item.promotion.id || item.promotion.type + item.unitPrice
        if (bxgyMap[pid]) bxgyMap[pid].discount += disc
      }
    }
    return [...Object.values(map), ...Object.values(bxgyMap)]
  }, [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, updateQty, removeItem, clearCart, totalItems, fullTotal, discountTotal, totalPrice, promotions, comboResult }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
