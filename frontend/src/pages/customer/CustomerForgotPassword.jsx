import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Coffee,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL


export default function CustomerForgotPassword() {
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!phone || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/customer/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Reset failed.')

      setSuccess('Password reset successfully. Redirecting to login...')
      setTimeout(() => navigate('/customer/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { opacity: .4; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.15); }
        }

        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: .8; }
          100% { opacity: 0; transform: translateY(-26px) scale(1.5); }
        }

        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .animate-fade-up { animation: fadeUp .85s ease forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-steam { animation: steam 2.4s ease-out infinite; }
        .image-zoom { animation: slowZoom 20s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images3.alphacoders.com/941/thumb-1920-94135.jpg"
            alt="Coffee shop background"
            className="h-full w-full object-cover image-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-orange-950/75 to-stone-950/90" />
        </div>

        {/* Glow Effects */}
        <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-amber-400/25 blur-3xl animate-glow" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-orange-700/20 blur-3xl animate-glow" />

        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-white/95 shadow-2xl border border-white/20 backdrop-blur-xl animate-fade-up">
          {/* Image Box */}
          <div className="hidden lg:block relative min-h-[620px] p-5 bg-[#2b160c]">
            <div className="relative h-full overflow-hidden rounded-[1.6rem]">
              <img
                src="https://images8.alphacoders.com/903/thumb-1920-903178.jpg"
                alt="Coffee"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-orange-950/40 to-black/60" />

              <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-md border border-white/20">
                    <div className="relative animate-float">
                      <Coffee size={28} />
                      <span className="animate-steam absolute -top-3 left-2 w-1 h-5 bg-white/70 rounded-full blur-[1px]" />
                      <span
                        className="animate-steam absolute -top-3 left-5 w-1 h-5 bg-white/50 rounded-full blur-[1px]"
                        style={{ animationDelay: '0.8s' }}
                      />
                    </div>

                    <div>
                      <p className="font-black leading-none">Visal Coffee</p>
                      <p className="text-xs text-amber-100 mt-1">
                        Customer Account
                      </p>
                    </div>
                  </div>

                  <h1 className="mt-12 text-4xl font-black leading-tight">
                    Reset password.
                    <br />
                    Continue your coffee order.
                  </h1>

                  <p className="mt-4 text-sm leading-7 text-amber-100 max-w-md">
                    Create a new password and get back to ordering your favorite
                    drinks faster.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['Secure', 'Fast', 'Easy'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-white/15 border border-white/15 p-4 backdrop-blur-md"
                    >
                      <p className="text-xl font-black">{item}</p>
                      <p className="text-xs text-amber-100 mt-1"></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Box */}
          <div className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-white via-orange-50 to-amber-50">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-16 h-16 rounded-3xl bg-gradient-to-br from-stone-950 via-orange-900 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-900/20 animate-float">
                <Coffee className="text-amber-200" size={30} />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-black text-orange-700">
                <ShieldCheck size={14} />
                Password Recovery
              </div>

              <h2 className="mt-4 text-3xl font-black text-stone-950">
                Reset Password
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Enter your phone number and new password.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-stone-800 mb-2">
                  Phone Number
                </label>

                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition" size={18} />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full rounded-2xl border border-orange-100 bg-white/90 pl-12 pr-4 py-3 text-sm text-stone-900 outline-none shadow-sm transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-800 mb-2">
                  New Password
                </label>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition" size={18} />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl border border-orange-100 bg-white/90 pl-12 pr-12 py-3 text-sm text-stone-900 outline-none shadow-sm transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-700 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-800 mb-2">
                  Confirm Password
                </label>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition" size={18} />

                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-2xl border border-orange-100 bg-white/90 pl-12 pr-4 py-3 text-sm text-stone-900 outline-none shadow-sm transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-stone-950 via-orange-950 to-orange-700 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="text-sm text-stone-500 text-center mt-6">
              Remember your password?{' '}
              <Link
                to="/customer/login"
                className="font-black text-orange-700 hover:text-stone-950 transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}