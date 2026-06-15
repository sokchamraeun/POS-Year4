// src/pages/staff/dashboard/utils/helpers.js

export const formatKhmerTime = (dateString) => {
  const d = new Date(dateString ?? '')
  if (isNaN(d)) return ''
  const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  return kh.toISOString().slice(0, 19).replace('T', ' ')
}

export const getTodayDate = () => {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export const calculateStats = (orders, products, customers, lowStockCount = 0, profitData = null) => {
  const today = getTodayDate()
  const ordersToday = orders.filter(o => {
    const d = new Date(o.created_at ?? '')
    if (isNaN(d)) return false
    const kh = new Date(d.getTime() + 7 * 60 * 60 * 1000)
    return kh.toISOString().slice(0, 10) === today
  })

  const paidToday      = ordersToday.filter(o => o.payment_status === 'Paid')
  const unpaidToday    = ordersToday.filter(o => o.payment_status !== 'Paid' && o.payment_status !== 'Refunded')
  const pendingToday   = ordersToday.filter(o => o.status === 'New' || o.status === 'Processing')
  const completedToday = ordersToday.filter(o => o.status === 'Completed')

  const totalRevenue  = ordersToday.reduce((s, o) => s + Number(o.total ?? 0), 0)
  const paidRevenue   = paidToday.reduce((s, o) => s + Number(o.total ?? 0), 0)
  const unpaidAmount  = unpaidToday.reduce((s, o) => s + Number(o.total ?? 0), 0)

  return [
    { label: 'Total Revenue Today', value: `$${totalRevenue.toFixed(2)}`,  change: `${ordersToday.length} orders today`,      type: 'revenue' },
    { label: 'Paid Revenue',        value: `$${paidRevenue.toFixed(2)}`,   change: `${paidToday.length} paid orders`,         type: 'paid' },
    { label: 'Unpaid Amount',       value: `$${unpaidAmount.toFixed(2)}`,  change: `${unpaidToday.length} unpaid orders`,     type: 'unpaid' },
    { label: 'Orders Today',        value: String(ordersToday.length),     change: `$${totalRevenue.toFixed(2)} total`,       type: 'orders' },
    { label: 'Pending Orders',      value: String(pendingToday.length),    change: 'New + Processing',                        type: 'pending' },
    { label: 'Completed Orders',    value: String(completedToday.length),  change: 'Completed today',                         type: 'completed' },
    { label: 'Products',            value: String(products.length),        change: `${products.filter(p => p.status).length} active`, type: 'products' },
    { label: 'Low Stock Items',     value: String(lowStockCount),          change: lowStockCount > 0 ? 'Check inventory' : 'All stocked', type: 'stock' },
    { label: 'Customers',           value: String(customers.length),       change: 'Total registered',                        type: 'customers' },
    { label: 'Profit Today',
      value:  profitData !== null ? `$${Number(profitData.profit).toFixed(2)}` : `$${paidRevenue.toFixed(2)}`,
      change: (() => {
        if (!profitData) return `${paidToday.length} paid`
        const rev = Number(profitData.revenue)
        const margin = rev > 0 ? ((Number(profitData.profit) / rev) * 100).toFixed(1) : '0.0'
        return `Margin ${margin}% · COGS $${Number(profitData.cogs).toFixed(2)}`
      })(),
      type: 'profit' },
  ]
}

export const processChartData = (orders, period) => {
  const byPeriod = {}
  
  for (const o of orders) {
    let key
    switch(period) {
      case 'daily':
        key = (o.created_at ?? '').slice(0, 10)
        break
      case 'monthly':
        key = (o.created_at ?? '').slice(0, 7)
        break
      case 'yearly':
        key = (o.created_at ?? '').slice(0, 4)
        break
      default:
        key = (o.created_at ?? '').slice(0, 10)
    }
    
    if (key) {
      if (!byPeriod[key]) byPeriod[key] = { revenue: 0, orders: 0 }
      if (o.payment_status === 'Paid') byPeriod[key].revenue += Number(o.total ?? 0)
      byPeriod[key].orders += 1
    }
  }
  
  const sorted = Object.keys(byPeriod).sort()
  const slice = period === 'daily' ? sorted.slice(-7) : 
                 period === 'monthly' ? sorted.slice(-6) : sorted
  
  return slice.length > 0 
    ? slice.map(key => ({ 
        label: period === 'yearly' ? key : key.slice(5), 
        revenue: byPeriod[key].revenue, 
        orders: byPeriod[key].orders 
      }))
    : [{ label: 'No data', revenue: 0, orders: 0 }]
}

export const getTopProducts = (orders, allProducts) => {
  const orderItems = orders.flatMap(o => 
    (o.items ?? []).map(i => ({ ...i, date: o.created_at }))
  )
  
  const prodData = {}
  for (const i of orderItems) {
    const name = i.product?.name ?? i.name ?? 'Unknown'
    if (!prodData[name]) {
      prodData[name] = { qty: 0, image: i.product?.image ?? '' }
    }
    prodData[name].qty += Number(i.qty ?? 1)
  }
  
  const sorted = Object.entries(prodData)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5)
    .map(([name, data]) => ({ name, qty: data.qty, image: data.image }))
  
  return sorted.length > 0 ? sorted : allProducts.slice(0, 5).map(p => ({ name: p.name, qty: 0, image: p.image ?? '' }))
}

export const calculateCustomDateRange = (orders, fromDate, toDate) => {
  const filtered = orders.filter(o => {
    const d = (o.created_at ?? '').slice(0, 10)
    return d >= fromDate && d <= toDate
  })
  
  const byDate = {}
  for (const o of filtered) {
    const date = (o.created_at ?? '').slice(0, 10)
    if (date) {
      if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 }
      if (o.payment_status === 'Paid') byDate[date].revenue += Number(o.total ?? 0)
      byDate[date].orders += 1
    }
  }
  
  const sorted = Object.keys(byDate).sort()
  return sorted.length > 0
    ? sorted.map(d => ({ label: d.slice(5), revenue: byDate[d].revenue, orders: byDate[d].orders }))
    : [{ label: 'No data', revenue: 0, orders: 0 }]
}