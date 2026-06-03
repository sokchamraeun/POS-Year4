import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Coffee,
  Phone,
  Lock,
  ArrowRight,
  Home,
  UserPlus,
  Sparkles,
} from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const { login } = useCustomerAuth()

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!phone || !password) {
      setError('Please fill in all fields.')
      return
    }

    setError('')
    setLoading(true)

    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      await login(phone, password)
      navigate('/')
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
          50% { transform: translateY(-12px); }
        }

        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          35% { opacity: .85; }
          100% { opacity: 0; transform: translateY(-30px) scale(1.6); }
        }

        @keyframes glow {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.15); }
        }

        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .login-fade-up { animation: fadeUp .85s ease forwards; }
        .login-float { animation: float 3.3s ease-in-out infinite; }
        .login-steam { animation: steam 2.5s ease-out infinite; }
        .login-glow { animation: glow 4s ease-in-out infinite; }
        .image-zoom { animation: slowZoom 20s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8 bg-stone-950">
        <div className="absolute inset-0">
          <img
            src="https://images8.alphacoders.com/129/thumb-1920-1291678.jpg"
            alt="Coffee shop"
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-orange-950/75 to-stone-950/90" />
        </div>

        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-orange-400/25 blur-3xl login-glow" />
        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl login-glow" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl login-glow" />

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl login-fade-up lg:grid-cols-[1.05fr_.95fr]">
          
          {/* Left Side - Image Box with Text Overlay */}
          <div className="relative hidden overflow-hidden lg:block">
            {/* Background Image with Zoom Animation */}
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80"
              alt="Fresh coffee being poured"
              className="absolute inset-0 h-full w-full object-cover image-zoom"
            />
            
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            
            {/* Coffee Steam Effect */}
            <div className="absolute top-1/4 left-1/3">
              <div className="login-steam h-16 w-3 rounded-full bg-white/20 blur-sm absolute -top-4 left-0" />
              <div className="login-steam h-20 w-3 rounded-full bg-white/15 blur-sm absolute -top-6 left-6" style={{ animationDelay: '0.6s' }} />
              <div className="login-steam h-12 w-3 rounded-full bg-white/25 blur-sm absolute -top-2 left-12" style={{ animationDelay: '1.2s' }} />
            </div>

            {/* Content Overlay on Image */}
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              {/* Logo */}
              <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-black/30 px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="relative login-float">
                  <Coffee size={30} />
                  <span className="login-steam absolute -top-3 left-2 h-5 w-1 rounded-full bg-white/70 blur-[1px]" />
                  <span
                    className="login-steam absolute -top-3 left-4 h-5 w-1 rounded-full bg-white/50 blur-[1px]"
                    style={{ animationDelay: '0.7s' }}
                  />
                  <span
                    className="login-steam absolute -top-3 left-6 h-5 w-1 rounded-full bg-white/40 blur-[1px]"
                    style={{ animationDelay: '1.3s' }}
                  />
                </div>
                <span className="text-lg font-black tracking-wide">Visal Coffee</span>
              </div>

              {/* Main Hero Text */}
              <div className="mb-16">
                <h1 className="text-5xl font-black leading-tight drop-shadow-2xl">
                  Fresh coffee,<br />
                  <span className="text-amber-300">fast order,</span><br />
                  easy login.
                </h1>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full bg-amber-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-amber-400/30">
                      Premium Beans
                  </div>
                  <div className="rounded-full bg-amber-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-amber-400/30">
                    ⚡ Fast Service
                  </div>
                  <div className="rounded-full bg-amber-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-amber-400/30">
                    💳 Easy Payment
                  </div>
                </div>

                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80">
                  Login to save your favorite drinks, order faster, and track your
                  coffee orders from your account.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '', title: 'Fast', text: 'Order' },
                  { icon: '', title: 'QR', text: 'Table' },
                  { icon: '', title: 'Save', text: 'Favorite' },
                ].map(({ icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-black/40"
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="mt-1 text-lg font-black">{title}</p>
                    <p className="text-xs text-white/70">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative bg-gradient-to-br from-white via-orange-50 to-amber-50 p-6 sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 hidden rounded-full bg-orange-100 p-3 text-orange-700 sm:block login-float">
              <Sparkles size={20} />
            </div>

            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-stone-950 via-orange-900 to-amber-700 shadow-lg shadow-orange-900/20 lg:mx-0 login-float">
                <Coffee className="text-amber-200" size={30} />
              </div>

              <div className="mt-6 inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-black text-orange-700">
                Customer Login
              </div>

              <h2 className="mt-4 text-3xl font-black text-stone-950">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Sign in to continue your coffee order.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 login-fade-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-stone-800">
                  Phone Number
                </label>

                <div className="group relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition group-focus-within:text-orange-700"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full rounded-2xl border border-orange-100 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-stone-900 shadow-sm outline-none transition duration-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-stone-800">
                  Password
                </label>

                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition group-focus-within:text-orange-700"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-orange-100 bg-white/90 py-3.5 pl-12 pr-12 text-sm text-stone-900 shadow-sm outline-none transition duration-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-orange-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="mt-2 text-right">
                  <Link
                    to="/customer/forgot-password"
                    className="text-xs font-black text-orange-700 transition hover:text-stone-950"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-stone-950 via-orange-950 to-orange-700 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-orange-900/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={18}
                        className="transition group-hover:translate-x-1"
                      />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-7 space-y-3 text-center">
              <p className="text-sm text-stone-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/customer/register"
                  className="inline-flex items-center gap-1 font-black text-orange-700 transition hover:text-stone-950"
                >
                  <UserPlus size={14} />
                  Register here
                </Link>
              </p>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-stone-400 transition hover:text-orange-700"
              >
                <Home size={14} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}