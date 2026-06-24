import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx'
import { Coffee, User, Phone, Lock, Eye, EyeOff, ArrowRight, Home, UserPlus, Sparkles, CheckCircle } from 'lucide-react'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const { register } = useCustomerAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasSpecial: false,
  })

  const checkPasswordStrength = (pwd) => {
    setPasswordStrength({
      length: pwd.length >= 6,
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    })
  }

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setPassword(pwd)
    checkPasswordStrength(pwd)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !phone || !password || !confirm) {
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
    setLoading(true)
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      await register(name, phone, password)
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

        @keyframes slowZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .register-fade-up { animation: fadeUp .85s ease forwards; }
        .register-float { animation: float 3.3s ease-in-out infinite; }
        .register-steam { animation: steam 2.5s ease-out infinite; }
        .register-glow { animation: glow 4s ease-in-out infinite; }
        .image-zoom { animation: slowZoom 20s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-8 bg-teal-950">
        <div className="absolute inset-0">
          <img
            src="https://images3.alphacoders.com/941/thumb-1920-94135.jpg"
            alt="Coffee shop"
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-teal-950/75 to-teal-950/90" />
        </div>

        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl register-glow" />
        <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl register-glow" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl register-glow" />

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl register-fade-up lg:grid-cols-[1.05fr_.95fr]">
          
          {/* Left Side - Image Box with Text Overlay */}
          <div className="relative hidden overflow-hidden lg:block">
            <img
              src="https://images2.alphacoders.com/743/thumb-1920-743380.jpg"
              alt="Fresh coffee being prepared"
              className="absolute inset-0 h-full w-full object-cover image-zoom"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            
            {/* Coffee Steam Effect */}
            <div className="absolute top-1/4 left-1/3">
              <div className="register-steam h-16 w-3 rounded-full bg-white/20 blur-sm absolute -top-4 left-0" />
              <div className="register-steam h-20 w-3 rounded-full bg-white/15 blur-sm absolute -top-6 left-6" style={{ animationDelay: '0.6s' }} />
              <div className="register-steam h-12 w-3 rounded-full bg-white/25 blur-sm absolute -top-2 left-12" style={{ animationDelay: '1.2s' }} />
            </div>

            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-black/30 px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="relative register-float">
                  <Coffee size={30} />
                  <span className="register-steam absolute -top-3 left-2 h-5 w-1 rounded-full bg-white/70 blur-[1px]" />
                  <span
                    className="register-steam absolute -top-3 left-4 h-5 w-1 rounded-full bg-white/50 blur-[1px]"
                    style={{ animationDelay: '0.7s' }}
                  />
                  <span
                    className="register-steam absolute -top-3 left-6 h-5 w-1 rounded-full bg-white/40 blur-[1px]"
                    style={{ animationDelay: '1.3s' }}
                  />
                </div>
                <span className="text-lg font-black tracking-wide">Visal Coffee</span>
              </div>

              <div className="mb-16">
                <h1 className="text-5xl font-black leading-tight drop-shadow-2xl">
                  Join our<br />
                  <span className="text-teal-300">coffee family</span><br />
                  today!
                </h1>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-full bg-teal-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-teal-400/30">
                    Welcome Bonus
                  </div>
                  <div className="rounded-full bg-teal-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-teal-400/30">
                    Loyalty Points
                  </div>
                  <div className="rounded-full bg-teal-500/20 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold border border-teal-400/30">
                    Fast Checkout
                  </div>
                </div>

                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80">
                  Create your account and enjoy exclusive offers, track your orders, and get rewards with every purchase.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '', title: 'Free', text: 'Welcome Drink' },
                  { icon: '', title: 'Earn', text: 'Reward Points' },
                  { icon: '', title: 'Easy', text: 'Mobile Order' },
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

          {/* Right Side - Registration Form */}
          <div className="relative bg-gradient-to-br from-white via-teal-50 to-[#ccfbf1] p-6 sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 hidden rounded-full bg-teal-100 p-3 text-teal-700 sm:block register-float">
              <Sparkles size={20} />
            </div>

            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 shadow-lg shadow-teal-900/20 lg:mx-0 register-float">
                <UserPlus className="text-teal-200" size={30} />
              </div>

              <div className="mt-6 inline-flex rounded-full bg-teal-100 px-4 py-2 text-xs font-black text-teal-700">
                New Customer
              </div>

              <h2 className="mt-4 text-3xl font-black text-teal-950">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-teal-500">
                Join us and start your coffee journey
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 register-fade-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-teal-800">
                  Full Name
                </label>
                <div className="group relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 transition group-focus-within:text-teal-700"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-[#ccfbf1] bg-white/90 py-3.5 pl-12 pr-4 text-sm text-teal-900 shadow-sm outline-none transition duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-2 block text-sm font-bold text-teal-800">
                  Phone Number
                </label>
                <div className="group relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 transition group-focus-within:text-teal-700"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full rounded-2xl border border-[#ccfbf1] bg-white/90 py-3.5 pl-12 pr-4 text-sm text-teal-900 shadow-sm outline-none transition duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-bold text-teal-800">
                  Password
                </label>
                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 transition group-focus-within:text-teal-700"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl border border-[#ccfbf1] bg-white/90 py-3.5 pl-12 pr-12 text-sm text-teal-900 shadow-sm outline-none transition duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 transition hover:text-teal-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength.hasSpecial ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.length && <CheckCircle size={10} />} 6+ chars
                      </span>
                      <span className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.hasNumber && <CheckCircle size={10} />} Number
                      </span>
                      <span className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                        {passwordStrength.hasSpecial && <CheckCircle size={10} />} Special
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-bold text-teal-800">
                  Confirm Password
                </label>
                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 transition group-focus-within:text-teal-700"
                  />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-2xl border border-[#ccfbf1] bg-white/90 py-3.5 pl-12 pr-12 text-sm text-teal-900 shadow-sm outline-none transition duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 transition hover:text-teal-700"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="mt-2 text-xs text-red-500">Passwords do not match</p>
                )}
                {confirm && password === confirm && password.length >= 6 && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-950 to-teal-700 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-900/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-teal-900/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 mt-6"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-7 space-y-3 text-center">
              <p className="text-sm text-teal-500">
                Already have an account?{' '}
                <Link
                  to="/customer/login"
                  className="inline-flex items-center gap-1 font-black text-teal-700 transition hover:text-teal-950"
                >
                  Sign in
                </Link>
              </p>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-teal-400 transition hover:text-teal-700"
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