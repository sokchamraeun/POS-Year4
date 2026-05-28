import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateStats, processChartData } from '../utils/helpers'
import { fetchOrders } from '../utils/api'
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

  useEffect(() => {
    if (allOrders.length > 0) {
      lastOrderIdRef.current = Math.max(...allOrders.map(o => o.id))
    }
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

  useEffect(() => {
    let alertTimeout
    const interval = setInterval(async () => {
      try {
        const orders = await fetchOrders()
        if (orders.length === 0) return
        const prevMax = lastOrderIdRef.current
        const newMax = Math.max(...orders.map(o => o.id))
        if (newMax > prevMax) {
          lastOrderIdRef.current = newMax
          recalc(orders)
          setNewOrderAlert(true)
          clearTimeout(alertTimeout)
          alertTimeout = setTimeout(() => setNewOrderAlert(false), 5000)
          playNotificationSound()
        }
      } catch {}
    }, 8000)
    return () => {
      clearInterval(interval)
      clearTimeout(alertTimeout)
    }
  }, [recalc, playNotificationSound])

  return { newOrderAlert, setNewOrderAlert }
}