import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSocket, useSocketConnect } from '../../hooks/useSocket'

const API_URL = import.meta.env.VITE_API_URL
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

export default function GlobalOrderNotification() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const [latestOrder, setLatestOrder] = useState(null)
  const audioRef = useRef(null)
  const unlockedRef = useRef(false)
  const lastOrderIdRef = useRef(0)
  const seenIdsRef = useRef(new Set())
  const alertTimeoutRef = useRef(null)
  const token = localStorage.getItem('token')
  const isStaffPageRef = useRef(pathname.startsWith('/staff'))
  isStaffPageRef.current = pathname.startsWith('/staff')

  const audioCtxRef = useRef(null)

  useEffect(() => {
    if (!token) return
    const audio = new Audio('/sound.mp3')
    audio.volume = 0.5
    audio.load()
    audioRef.current = audio

    function unlock() {
      if (unlockedRef.current) return
      unlockedRef.current = true
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
      }).catch(() => {})
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        if (ctx.state === 'suspended') ctx.resume()
        audioCtxRef.current = ctx
      } catch {}
    }

    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })

    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
      audioCtxRef.current?.close()
    }
  }, [token])

  function beep(count = 3) {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      let b = 0
      function next() {
        if (b >= count) return
        b++
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.35)
        osc.addEventListener('ended', next, { once: true })
      }
      next()
    } catch {}
  }

  function playSound() {
    const audio = audioRef.current
    if (!audio) { beep(); return }
    let played = 0
    function play() {
      if (played >= 3) return
      played++
      audio.currentTime = 0
      audio.play().catch(() => { beep(); return })
      audio.addEventListener('ended', play, { once: true })
    }
    play()
  }

  function onNewOrder(order) {
    const id = Number(order.id)
    if (seenIdsRef.current.has(id)) return
    seenIdsRef.current.add(id)
    if (id > lastOrderIdRef.current) {
      lastOrderIdRef.current = id
    }
    if (isStaffPageRef.current) {
      setLatestOrder(order)
      setNewOrderAlert(true)
      clearTimeout(alertTimeoutRef.current)
      alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(false), 5000)
      playSound()
    }
  }

  useSocketConnect()

  useSocket('order:created', (order) => {
    if (order?.id) onNewOrder(order)
  })

  useSocket('order:updated', () => {})

  useEffect(() => {
    if (!token) return
    let interval
    let mounted = true
    async function initMaxId() {
      try {
        const res = await fetch(`${API_URL}/orders?per_page=1`, { headers: headers() })
        const json = await res.json()
        const orders = json.data ?? []
        if (orders.length > 0) {
          lastOrderIdRef.current = Math.max(...orders.map(o => o.id))
        }
      } catch {}
    }
    initMaxId()
    async function poll() {
      try {
        const res = await fetch(`${API_URL}/orders?per_page=20`, { headers: headers() })
        const json = await res.json()
        const orders = json.data ?? []
        if (!mounted || orders.length === 0) return
        const prevMax = lastOrderIdRef.current
        const newMax = Math.max(...orders.map(o => o.id))
        if (newMax > prevMax) {
          lastOrderIdRef.current = newMax
          const newOrders = orders.filter(o => o.id > prevMax && !seenIdsRef.current.has(o.id))
          newOrders.forEach(o => seenIdsRef.current.add(o.id))
          if (newOrders.length > 0) {
            if (isStaffPageRef.current) {
              setLatestOrder(newOrders[newOrders.length - 1])
              setNewOrderAlert(true)
              clearTimeout(alertTimeoutRef.current)
              alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(false), 5000)
              playSound()
            }
          }
        }
      } catch {}
    }
    interval = setInterval(poll, 8000)
    return () => {
      mounted = false
      clearInterval(interval)
      clearTimeout(alertTimeoutRef.current)
    }
  }, [token])

  if (!token) return null

  return (
    <>
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-[9999] cursor-pointer" onClick={() => { setNewOrderAlert(false); navigate('/staff/orders') }} style={{ animation: 'slideDownGlobal .4s ease-out' }}>
          <style>{`@keyframes slideDownGlobal{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{latestOrder?.id ? `Order #${latestOrder.id}` : 'New Order Received!'}</p>
              <p className="text-white/80 text-xs mt-0.5">Check orders page</p>
            </div>
            <button
              onClick={() => setNewOrderAlert(false)}
              className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
