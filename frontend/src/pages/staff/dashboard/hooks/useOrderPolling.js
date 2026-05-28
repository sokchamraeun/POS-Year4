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

  function isVisibleOrder(o) {
    return !(o.payment_method === 'KHQR' && o.payment_status !== 'Paid')
  }

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
    const visible = orders.filter(isVisibleOrder)
    setAllOrders(visible)
    setRecentOrders(visible.slice(0, 5))
    setStats(calculateStats(visible, [], []))
    setChartData({
      daily: processChartData(visible, 'daily'),
      monthly: processChartData(visible, 'monthly'),
      yearly: processChartData(visible, 'yearly'),
    })
  }, [setAllOrders, setRecentOrders, setStats, setChartData])

  useSocket('order:created', useCallback((order) => {
    if (!isVisibleOrder(order)) return
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
    const arr = ordersRef.current
    const idx = arr.findIndex(o => o.id === Number(order.id))
    if (idx >= 0) {
      const updated = arr.map(o => o.id === Number(order.id) ? order : o)
      recalc(updated)
    } else if (isVisibleOrder(order)) {
      recalc([order, ...arr])
      setNewOrderAlert(true)
      setTimeout(() => setNewOrderAlert(false), 5000)
      playNotificationSound()
    }
  }, [recalc, playNotificationSound, setNewOrderAlert]))

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
      } catch {
            // Silently ignore polling errors
          }
    }, 8000)
    return () => {
      clearInterval(interval)
      clearTimeout(alertTimeout)
    }
  }, [recalc, playNotificationSound])

  return { newOrderAlert, setNewOrderAlert }
}