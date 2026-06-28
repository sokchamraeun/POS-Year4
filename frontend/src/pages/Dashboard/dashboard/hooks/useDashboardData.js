import { useState, useEffect, useRef } from 'react'
import { fetchOrders, fetchProducts, fetchCustomers, fetchProfitToday, fetchIngredients } from '../utils/api'
import { calculateStats, processChartData, getTopProducts } from '../utils/helpers'

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [chartData, setChartData] = useState({ hourly: [], daily: [], monthly: [], yearly: [] })
  const [topProducts, setTopProducts] = useState([])
  const [products, setProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const fetching = useRef(false)
  const profitDataRef = useRef(null)

  function isVisibleOrder(o) {
    return !(o.payment_method === 'KHQR' && o.payment_status !== 'Paid')
  }

  const loadData = async () => {
    try {
      const [orders, allProducts, customers, profitData, allIngredients] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
        fetchProfitToday(),
        fetchIngredients(),
      ])
      profitDataRef.current = profitData

      const visible = orders.filter(isVisibleOrder)

      const lowStockIngredients = allIngredients.filter(
        i => Number(i.stock_quantity) > 0 && Number(i.stock_quantity) <= Number(i.reorder_level)
      )
      const lowStockCount = lowStockIngredients.length
      const lowStockValue = lowStockIngredients.reduce((sum, i) => sum + Number(i.cost_per_unit ?? 0) * Number(i.stock_quantity ?? 0), 0)

      setProducts(allProducts)
      setAllOrders(visible)
      setRecentOrders(visible.slice(0, 5))
      setStats(calculateStats(visible, allProducts, customers, lowStockCount, profitData, lowStockValue))
      setTopProducts(getTopProducts(visible, allProducts))
      
      setChartData({
        hourly: processChartData(visible, 'hourly'),
        daily: processChartData(visible, 'daily'),
        monthly: processChartData(visible, 'monthly'),
        yearly: processChartData(visible, 'yearly'),
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fetching.current) return
    fetching.current = true
    loadData()
  }, [])

  return {
    loading,
    stats,
    chartData,
    topProducts,
    products,
    recentOrders,
    allOrders,
    profitDataRef,
    setStats,
    setRecentOrders,
    setAllOrders,
    setChartData,
  }
}