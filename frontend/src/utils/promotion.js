export function calcFinalPrice(unitPrice, promotion) {
  if (!promotion) return unitPrice

  switch (promotion.type) {
    case 'percentage':
      return unitPrice - (unitPrice * Number(promotion.value)) / 100

    case 'fixed_amount':
      return Math.max(0, unitPrice - Number(promotion.value))

    case 'buy_x_get_y': {
      const buy = Number(promotion.buy_qty) || 1
      const free = Number(promotion.free_qty) || 0
      return (unitPrice * buy) / (buy + free)
    }

    case 'combo':
      return Number(promotion.value) || unitPrice

    default:
      return unitPrice
  }
}

export function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`
}
