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

  function publishNewCount(orders) {
    const count = orders.filter(o => o.status === 'New').length
    localStorage.setItem('newOrdersCount', count)
    window.dispatchEvent(new CustomEvent('newOrdersCountChanged', { detail: count }))
  }

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
        const res = await fetch(`${API_URL}/orders?per_page=50`, { headers: headers() })
        const json = await res.json()
        const orders = json.data ?? []
        if (!mounted || orders.length === 0) return

        publishNewCount(orders)

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
    poll()
    interval = setInterval(poll, 8000)
    return () => {
      mounted = false
      clearInterval(interval)
      clearTimeout(alertTimeoutRef.current)
    }
  }, [token])

  if (!token) return null

  if (!newOrderAlert) return null

  return (
    <>
      <style>{`
        @keyframes dropBanner {
          from { transform: translateY(-120%) translateX(-50%); opacity: 0; }
          to   { transform: translateY(0%)    translateX(-50%); opacity: 1; }
        }
        @keyframes ping-once {
          0%   { transform: scale(1);   opacity: 1; }
          60%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <div
        className="fixed top-4 left-1/2 z-[9999]"
        style={{ animation: 'dropBanner .5s cubic-bezier(.22,1,.36,1)', transform: 'translateX(-50%)' }}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl border border-green-100 flex items-center gap-4 px-5 py-4 min-w-[340px] max-w-sm overflow-hidden">

          {/* Left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-600 rounded-l-2xl" />

          {/* Ping icon */}
          <div className="relative shrink-0 ml-1">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" style={{ animation: 'ping-once 1s ease-out .2s' }} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 leading-none mb-1">New Order</p>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {latestOrder?.id ? `Order #${latestOrder.id}` : 'New Order Received!'}
            </p>
            {(latestOrder?.table?.name || latestOrder?.total_price) && (
              <p className="text-xs text-slate-400 mt-1 truncate">
                {latestOrder?.table?.name ? `Table ${latestOrder.table.name}` : ''}
                {latestOrder?.table?.name && latestOrder?.total_price ? ' · ' : ''}
                {latestOrder?.total_price ? `$${Number(latestOrder.total_price).toFixed(2)}` : ''}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => { setNewOrderAlert(false); navigate('/staff/orders') }}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              View
            </button>
            <button
              onClick={() => setNewOrderAlert(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
