import { useState, useEffect, useRef } from 'react'
import { fetchOrders, fetchProducts, fetchCustomers, fetchProfitToday } from '../utils/api'
import { calculateStats, processChartData, getTopProducts } from '../utils/helpers'

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [chartData, setChartData] = useState({ daily: [], monthly: [], yearly: [] })
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
      const [orders, allProducts, customers, profitData] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
        fetchProfitToday(),
      ])
      profitDataRef.current = profitData

      const visible = orders.filter(isVisibleOrder)

      const lowStockCount = allProducts.filter(
        p => Number(p.stock ?? p.quantity ?? p.qty ?? 0) <= 5
      ).length

      setProducts(allProducts)
      setAllOrders(visible)
      setRecentOrders(visible.slice(0, 5))
      setStats(calculateStats(visible, allProducts, customers, lowStockCount, profitData))
      setTopProducts(getTopProducts(visible, allProducts))
      
      setChartData({
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