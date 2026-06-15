import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateStats, processChartData } from '../utils/helpers'
import { fetchOrders, fetchProfitToday } from '../utils/api'
import { useSocket, useSocketConnect } from '../../../../hooks/useSocket'

export function useOrderPolling(
  allOrders,
  setAllOrders,
  setStats,
  setChartData,
  setProducts,
  setRecentOrders,
  profitDataRef
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

  const recalc = useCallback((orders, freshProfitData) => {
    const visible = orders.filter(isVisibleOrder)
    const profit = freshProfitData !== undefined ? freshProfitData : (profitDataRef?.current ?? null)
    setAllOrders(visible)
    setRecentOrders(visible.slice(0, 5))
    setStats(calculateStats(visible, [], [], 0, profit))
    setChartData({
      daily: processChartData(visible, 'daily'),
      monthly: processChartData(visible, 'monthly'),
      yearly: processChartData(visible, 'yearly'),
    })
  }, [setAllOrders, setRecentOrders, setStats, setChartData, profitDataRef])

  useSocket('order:created', useCallback((order) => {
    if (!isVisibleOrder(order)) return
    const orderId = Number(order.id)
    if (orderId <= lastOrderIdRef.current) return
    lastOrderIdRef.current = orderId
    const updated = [order, ...ordersRef.current]
    recalc(updated)
    setNewOrderAlert(true)
    setTimeout(() => setNewOrderAlert(false), 5000)
  }, [recalc]))

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
    }
  }, [recalc, setNewOrderAlert]))

  useEffect(() => {
    let alertTimeout
    const interval = setInterval(async () => {
      try {
        const [orders, freshProfit] = await Promise.all([fetchOrders(), fetchProfitToday()])
        if (orders.length === 0) return
        if (profitDataRef) profitDataRef.current = freshProfit
        const prevMax = lastOrderIdRef.current
        const newMax = Math.max(...orders.map(o => o.id))
        if (newMax > prevMax) {
          lastOrderIdRef.current = newMax
          recalc(orders, freshProfit)
          if (orders.some(o => o.id > prevMax && isVisibleOrder(o))) {
            setNewOrderAlert(true)
            clearTimeout(alertTimeout)
            alertTimeout = setTimeout(() => setNewOrderAlert(false), 5000)
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 8000)
    return () => {
      clearInterval(interval)
      clearTimeout(alertTimeout)
    }
  }, [recalc, profitDataRef])

  return { newOrderAlert, setNewOrderAlert }
}