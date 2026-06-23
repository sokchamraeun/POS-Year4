import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCcw,
  AlertCircle,
  Clock,
  TimerOff,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

// Fallback used until the backend tells us the real KHQR expiry window.
const DEFAULT_EXPIRY_SECONDS = 300

function formatCountdown(seconds) {
  const safe = Math.max(0, seconds)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  Accept: 'application/json',
})

export default function KhqrIframeModal({ orderId, total, onClose, onPaid }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paid, setPaid] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [expired, setExpired] = useState(false)

  const intervalRef = useRef(null)
  const expiresAtRef = useRef(null)
  const initiatedRef = useRef(false)

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fetchOrderAndFinish = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, { headers: headers() })
      const json = await res.json()
      const orderData = json.data ?? json
      if (onPaid) onPaid(orderData)
    } catch {
      if (onPaid) onPaid(orderId)
    }
  }, [orderId, onPaid])

  const startPolling = useCallback(() => {
    clearPolling()

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}`, { headers: headers() })
        const json = await res.json()
        const order = json.data ?? json
        if (String(order.payment_status).toLowerCase() === 'paid') {
          setPaid(true)
          clearPolling()
        }
      } catch {
        // retry silently
      }
    }, 3000)
  }, [orderId, clearPolling])

  const initiatePayment = useCallback(async () => {
    if (initiatedRef.current) return
    initiatedRef.current = true

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/orders/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({
          order_id: orderId,
          return_url: `${window.location.origin}/staff/menu-order`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'មិនអាចចាប់ផ្តើមការទូទាត់បានទេ')
        return
      }

      // khqr.cc / checkout.khqr.cc don't send X-Frame-Options, so the
      // checkout page can be embedded directly. The iframe follows the
      // gateway's 302 redirect to the hosted checkout SPA.
      const expirySeconds = Number(data.expires_in) || DEFAULT_EXPIRY_SECONDS
      expiresAtRef.current = Date.now() + expirySeconds * 1000
      setSecondsLeft(expirySeconds)
      setIframeUrl(data.checkout_url)
      startPolling()
    } catch {
      setError('បញ្ហាបណ្ដាញ! មិនអាចភ្ជាប់ទៅ KHQR បានទេ')
    } finally {
      setLoading(false)
    }
  }, [orderId, startPolling])

  // Allow the embedded khqr.cc / success page to notify us via postMessage.
  useEffect(() => {
    function onMessage(e) {
      const msg = typeof e.data === 'string' ? e.data : e.data?.type
      if (msg && /paid|success|completed/i.test(String(msg))) {
        setPaid(true)
        clearPolling()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [clearPolling])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time payment kickoff on mount
    initiatePayment()
    return () => clearPolling()
  }, [initiatePayment, clearPolling])

  // Redirect to the receipt shortly after the order is marked paid.
  useEffect(() => {
    if (!paid) return
    const timer = setTimeout(fetchOrderAndFinish, 1500)
    return () => clearTimeout(timer)
  }, [paid, fetchOrderAndFinish])

  // Countdown that follows the KHQR expiry window.
  useEffect(() => {
    if (!iframeUrl || paid || expired || !expiresAtRef.current) return

    const tick = () => {
      const remaining = Math.round((expiresAtRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        setSecondsLeft(0)
        setExpired(true)
        clearPolling()
      } else {
        setSecondsLeft(remaining)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [iframeUrl, paid, expired, clearPolling])

  function retry() {
    initiatedRef.current = false
    expiresAtRef.current = null
    setIframeUrl(null)
    setSecondsLeft(null)
    setExpired(false)
    initiatePayment()
  }

  async function markAsPaid() {
    setMarkingPaid(true)

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ payment_status: 'Paid' }),
      })

      if (res.ok) {
        setPaid(true)
        clearPolling()
      } else {
        setError('មិនអាចកំណត់ថាបានទូទាត់រួចបានទេ')
      }
    } catch {
      setError('បញ្ហាបណ្ដាញ ពេលកំណត់ការទូទាត់')
    } finally {
      setMarkingPaid(false)
    }
  }

  function handleClose() {
    clearPolling()
    if (paid) fetchOrderAndFinish()
    else if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm">
      <div className="flex h-[95vh] max-h-[860px] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-white/20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 px-4 py-4 text-white">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-bold">ទូទាត់តាម KHQR</h3>
                <p className="mt-0.5 text-xs text-teal-50">
                  ស្កេន QR ដើម្បីបង់ប្រាក់
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="rounded-xl p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/12 p-2.5 backdrop-blur">
              <p className="text-[11px] text-teal-50">លេខបញ្ជាទិញ</p>
              <p className="mt-0.5 text-sm font-semibold">#{orderId}</p>
            </div>

            <div className="rounded-2xl bg-white/12 p-2.5 backdrop-blur">
              <p className="text-[11px] text-teal-50">ចំនួនទឹកប្រាក់</p>
              <p className="mt-0.5 text-sm font-semibold">
                ${Number(total || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
          {loading && (
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>

              <h4 className="text-sm font-semibold text-slate-800">
                កំពុងភ្ជាប់ទៅ KHQR
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                ប្រព័ន្ធកំពុងបង្កើតទំព័រទូទាត់
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="px-4 py-5">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-700">
                      មានបញ្ហាក្នុងការទូទាត់
                    </h4>
                    <p className="mt-1 text-xs text-red-600">{error}</p>

                    <button
                      onClick={retry}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      ព្យាយាមម្ដងទៀត
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!paid && !loading && !error && !expired && iframeUrl && (
            <>
              {secondsLeft !== null && (
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold ${
                    secondsLeft <= 30
                      ? 'bg-red-50 text-red-600'
                      : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>QR ផុតកំណត់ក្នុង</span>
                  <span className="tabular-nums font-mono text-base">
                    {formatCountdown(secondsLeft)}
                  </span>
                </div>
              )}

              <div className="relative flex-1 bg-white">
                <iframe
                  src={iframeUrl}
                  title="KHQR Payment"
                  className="h-full min-h-[480px] w-full border-0"
                  allow="payment *; clipboard-write"
                />
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                <div className="mb-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>ពិនិត្យស្ថានភាពរៀងរាល់ 3 វិនាទី</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={markAsPaid}
                    disabled={markingPaid}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {markingPaid ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    បានទូទាត់រួច
                  </button>
                  <button
                    onClick={handleClose}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    បោះបង់
                  </button>
                </div>
              </div>
            </>
          )}

          {expired && !paid && (
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <TimerOff className="h-10 w-10 text-red-600" />
              </div>

              <h4 className="text-lg font-bold text-red-600">QR ផុតកំណត់ហើយ</h4>

              <p className="mt-1 text-xs text-slate-500">
                កូដ QR សម្រាប់ការបញ្ជាទិញ #{orderId} បានផុតកំណត់។
                សូមបង្កើតកូដថ្មីដើម្បីបន្ត។
              </p>

              <div className="mt-5 grid w-full max-w-xs grid-cols-2 gap-2">
                <button
                  onClick={retry}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  បង្កើតកូដថ្មី
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  បិទ
                </button>
              </div>
            </div>
          )}

          {paid && (
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
                <CheckCircle2 className="h-10 w-10 text-teal-600" />
              </div>

              <h4 className="text-lg font-bold text-teal-700">
                ទូទាត់បានជោគជ័យ
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                ការបញ្ជាទិញ #{orderId} បានទទួលប្រាក់រួចរាល់
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>កំពុងបើកវិក្កយបត្រ...</span>
              </div>

              <button
                onClick={handleClose}
                className="mt-5 rounded-2xl bg-teal-600 px-7 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                រួចរាល់
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
