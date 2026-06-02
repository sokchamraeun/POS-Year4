export function calcFinalPrice(unitPrice, promotion, qty = 1) {
  if (!promotion) return unitPrice

  switch (promotion.type) {
    case 'percentage':
      return unitPrice - (unitPrice * Number(promotion.value)) / 100

    case 'fixed_amount':
      return Math.max(0, unitPrice - Number(promotion.value))

    case 'buy_x_get_y': {
      const buy = Number(promotion.buy_qty) || 1
      const free = Number(promotion.free_qty) || 0
      const bundleSize = buy + free
      if (qty < bundleSize) return unitPrice
      const fullBundles = Math.floor(qty / bundleSize)
      const remaining = qty % bundleSize
      const paidQty = fullBundles * buy + remaining
      return (unitPrice * paidQty) / qty
    }

    case 'combo':
      return unitPrice

    case 'combo_discount':
      return unitPrice

    default:
      return unitPrice
  }
}

export function calcDiscount(unitPrice, promotion, qty = 1) {
  if (!promotion) return 0
  if (promotion.type === 'buy_x_get_y') {
    const buy = Number(promotion.buy_qty) || 1
    const free = Number(promotion.free_qty) || 0
    const bundleSize = buy + free
    const fullBundles = Math.floor(qty / bundleSize)
    return fullBundles * free * unitPrice
  }
  if (promotion.type === 'combo_discount' || promotion.type === 'combo') return 0
  return unitPrice * qty - calcFinalPrice(unitPrice, promotion) * qty
}

export function getPromotionLabel(promotion) {
  if (!promotion) return ''
  switch (promotion.type) {
    case 'buy_x_get_y':
      return `Buy ${promotion.buy_qty} Get ${promotion.free_qty} Free`
    case 'percentage':
      return `${promotion.value}% Off`
    case 'fixed_amount':
      return `-$${Number(promotion.value).toFixed(2)}`
    case 'combo':
      return `Combo $${Number(promotion.value).toFixed(2)}`
    case 'combo_discount':
      if (promotion.combo_discount_type === 'percentage') return `${promotion.value}% Combo Discount`
      if (promotion.combo_discount_type === 'fixed_price') return `Combo $${Number(promotion.value).toFixed(2)}`
      return `$${Number(promotion.value).toFixed(2)} Off Combo`
    default:
      return 'Promotion'
  }
}

export function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`
}

// Group items by (product id + size) and calculate Buy X Get Y across the group
// so sugar/ice differences don't break the promotion count
export function calcBuyXGetYGrouped(cartItems) {
  const groups = {}

  for (const item of cartItems) {
    if (item.promotion?.type !== 'buy_x_get_y') continue
    const groupKey = `${item.id}-${item.size}`
    if (!groups[groupKey]) {
      groups[groupKey] = { items: [], promotion: item.promotion }
    }
    groups[groupKey].items.push(item)
  }

  const result = { totalDiscount: 0, itemDiscounts: {} }

  for (const { items, promotion } of Object.values(groups)) {
    const totalQty = items.reduce((sum, i) => sum + i.qty, 0)
    const buy = Number(promotion.buy_qty) || 1
    const free = Number(promotion.free_qty) || 0
    const bundleSize = buy + free
    const fullBundles = Math.floor(totalQty / bundleSize)
    const freeItems = fullBundles * free

    if (freeItems === 0) continue

    // discount cheapest items first
    const sorted = [...items].sort((a, b) => a.unitPrice - b.unitPrice)
    let remaining = freeItems
    for (const item of sorted) {
      if (remaining <= 0) break
      const take = Math.min(remaining, item.qty)
      const disc = take * item.unitPrice
      result.itemDiscounts[item.key] = (result.itemDiscounts[item.key] || 0) + disc
      remaining -= take
    }

    result.totalDiscount += freeItems * sorted[0].unitPrice
  }

  return result
}

function itemMatchesGroup(item, group) {
  if (group.products?.includes(item.id)) return true
  if (group.categories?.includes(item.category_id)) return true
  return false
}

export function calcComboCart(cartItems, products) {
  const itemsWithPromo = []

  for (const c of cartItems) {
    const product = products?.find(p => p.id === c.id)
    const promo = c.promotion || product?.promotion
    if (promo?.type === 'combo_discount' || promo?.type === 'combo') {
      itemsWithPromo.push({ ...c, promotion: promo })
    }
  }

  const byPromo = {}
  for (const item of itemsWithPromo) {
    const id = item.promotion.id
    if (!byPromo[id]) byPromo[id] = { promotion: item.promotion, items: [] }
    byPromo[id].items.push(item)
  }

  const result = { totalDiscount: 0, itemDiscounts: {} }

  for (const { promotion, items } of Object.values(byPromo)) {
    const groups = promotion.combo_groups || []
    const units = items.flatMap(i =>
      Array.from({ length: i.qty }, () => ({ ...i, qty: 1 }))
    )
    let pairedUnits = []
    let numCombos = 1

    if (groups.length > 0) {
      const groupMatches = groups.map(group =>
        units.filter(u => itemMatchesGroup(u, group))
      )
      if (groupMatches.some(matches => matches.length === 0)) continue
      numCombos = Math.min(...groupMatches.map(m => m.length))
      pairedUnits = [...new Map(
        groupMatches.map(m => m.slice(0, numCombos)).flat().map(u => [u.key, u])
      ).values()]
    } else {
      if (units.length < 2) continue
      const byProd = {}
      for (const u of units) {
        if (!byProd[u.id]) byProd[u.id] = []
        byProd[u.id].push(u)
      }
      const pIds = Object.keys(byProd)
      if (pIds.length < 2) continue
      pIds.sort((a, b) => byProd[b].length - byProd[a].length)
      numCombos = Math.min(byProd[pIds[0]].length, byProd[pIds[1]].length)
      for (let i = 0; i < numCombos; i++) {
        pairedUnits.push(byProd[pIds[0]][i])
        pairedUnits.push(byProd[pIds[1]][i])
      }
    }

    if (pairedUnits.length === 0) continue

    const value = Number(promotion.value) || 0
    const totalPrice = pairedUnits.reduce((s, u) => s + u.unitPrice, 0)
    const totalDiscAmount = Math.max(0, totalPrice - value * numCombos)
    const itemDiscs = {}

    if (promotion.combo_discount_type === 'fixed_price' || promotion.type === 'combo') {
      for (const u of pairedUnits) {
        const proportion = totalPrice > 0 ? u.unitPrice / totalPrice : 0
        itemDiscs[u.key] = (itemDiscs[u.key] || 0) + totalDiscAmount * proportion
      }
    } else switch (promotion.combo_apply_to) {
      case 'cheapest': {
        const cheapest = pairedUnits.reduce((a, b) =>
          a.unitPrice < b.unitPrice ? a : b
        )
        const disc = promotion.combo_discount_type === 'percentage'
          ? cheapest.unitPrice * value / 100
          : Math.min(value, cheapest.unitPrice)
        itemDiscs[cheapest.key] = (itemDiscs[cheapest.key] || 0) + disc
        break
      }
      case 'each': {
        for (const u of pairedUnits) {
          const disc = promotion.combo_discount_type === 'percentage'
            ? u.unitPrice * value / 100
            : Math.min(value, u.unitPrice)
          itemDiscs[u.key] = (itemDiscs[u.key] || 0) + disc
        }
        break
      }
      case 'total': {
        const tPrice = pairedUnits.reduce((s, u) => s + u.unitPrice, 0)
        const tDisc = promotion.combo_discount_type === 'percentage'
          ? tPrice * value / 100
          : Math.min(value, tPrice)
        for (const u of pairedUnits) {
          const proportion = tPrice > 0 ? u.unitPrice / tPrice : 0
          itemDiscs[u.key] = (itemDiscs[u.key] || 0) + tDisc * proportion
        }
        break
      }
    }

    const totalDisc = Object.values(itemDiscs).reduce((s, v) => s + v, 0)
    result.totalDiscount += totalDisc
    for (const [key, disc] of Object.entries(itemDiscs)) {
      result.itemDiscounts[key] = (result.itemDiscounts[key] || 0) + disc
    }
  }

  return result
}
