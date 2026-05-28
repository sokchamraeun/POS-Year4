import { useState, useEffect } from 'react'
import { fetchOrders, fetchProducts, fetchCustomers } from '../utils/api'
import { calculateStats, processChartData, getTopProducts } from '../utils/helpers'

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [chartData, setChartData] = useState({ daily: [], monthly: [], yearly: [] })
  const [topProducts, setTopProducts] = useState([])
  const [products, setProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])

  const loadData = async () => {
    try {
      const [orders, allProducts, customers] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
      ])

      setProducts(allProducts)
      setAllOrders(orders)
      setRecentOrders(orders.slice(0, 5))
      setStats(calculateStats(orders, allProducts, customers))
      setTopProducts(getTopProducts(orders, allProducts))
      
      setChartData({
        daily: processChartData(orders, 'daily'),
        monthly: processChartData(orders, 'monthly'),
        yearly: processChartData(orders, 'yearly'),
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    setStats,
    setRecentOrders,
    setAllOrders,
    setChartData,
  }
}