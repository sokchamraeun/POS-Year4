import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchOrders, fetchProducts, fetchCustomers } from '../utils/api'
import { calculateStats, processChartData } from '../utils/helpers'
import { useSocket, useSocketConnect } from '../../../../hooks/useSocket'

export function useOrderPolling(
  allOrders,
  setAllOrders,
  setStats,
  setChartData,
  setProducts,
  setRecentOrders,
  playNotificationSound
) {
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const lastOrderIdRef = useRef(0)

  useSocketConnect()

  const refreshAll = useCallback(async () => {
    try {
      const [orders, productsData, customersData] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchCustomers(),
      ])

      setAllOrders(orders)
      setProducts(productsData)
      setRecentOrders(orders.slice(0, 5))
      setStats(calculateStats(orders, productsData, customersData))
      setChartData({
        daily: processChartData(orders, 'daily'),
        monthly: processChartData(orders, 'monthly'),
        yearly: processChartData(orders, 'yearly'),
      })
    } catch {
      // ignore
    }
  }, [setAllOrders, setProducts, setRecentOrders, setStats, setChartData])

  useEffect(() => {
    if (allOrders.length > 0) {
      lastOrderIdRef.current = Math.max(...allOrders.map(o => o.id))
    }
  }, [allOrders])

  useSocket('order:created', useCallback((order) => {
    const orderId = Number(order.id)
    if (orderId <= lastOrderIdRef.current) return
    lastOrderIdRef.current = orderId

    setNewOrderAlert(true)
    setTimeout(() => setNewOrderAlert(false), 5000)
    playNotificationSound()
    refreshAll()
  }, [refreshAll, playNotificationSound]))

  useSocket('order:updated', useCallback(() => {
    refreshAll()
  }, [refreshAll]))

  return { newOrderAlert, setNewOrderAlert }
}
