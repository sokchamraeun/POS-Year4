import { useCallback, useEffect, useRef, useState } from 'react'
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
  const ordersRef = useRef(allOrders)

  useEffect(() => {
    ordersRef.current = allOrders
  }, [allOrders])

  useSocketConnect()

  const recalc = useCallback((orders) => {
    setAllOrders(orders)
    setRecentOrders(orders.slice(0, 5))
    setStats(calculateStats(orders, [], []))
    setChartData({
      daily: processChartData(orders, 'daily'),
      monthly: processChartData(orders, 'monthly'),
      yearly: processChartData(orders, 'yearly'),
    })
  }, [setAllOrders, setRecentOrders, setStats, setChartData])

  useEffect(() => {
    if (allOrders.length > 0) {
      lastOrderIdRef.current = Math.max(...allOrders.map(o => o.id))
    }
  }, [allOrders])

  useSocket('order:created', useCallback((order) => {
    const orderId = Number(order.id)
    if (orderId <= lastOrderIdRef.current) return
    lastOrderIdRef.current = orderId

    const updated = [order, ...ordersRef.current]
    recalc(updated)

    setNewOrderAlert(true)
    setTimeout(() => setNewOrderAlert(false), 5000)
    playNotificationSound()
  }, [recalc, playNotificationSound]))

  useSocket('order:updated', useCallback((order) => {
    const updated = ordersRef.current.map(o => o.id === Number(order.id) ? order : o)
    recalc(updated)
  }, [recalc]))

  return { newOrderAlert, setNewOrderAlert }
}
