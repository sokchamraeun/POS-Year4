import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Coffee,
  User,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name || !email || !password || !confirm) {
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
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.message ||
            data.errors?.[Object.keys(data.errors)[0]]?.[0] ||
            'Registration failed.'
        )
        return
      }

      navigate('/staff/login')
    } catch {
      setError('Network error. Please try again.')
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

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-35px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: .8; }
          100% { opacity: 0; transform: translateY(-26px) scale(1.5); }
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: .45; }
          50% { transform: scale(1.15); opacity: .75; }
        }

        .animate-fade-up { animation: fadeUp .85s ease forwards; }
        .animate-slide-left { animation: slideLeft .85s ease forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-steam { animation: steam 2.4s ease-out infinite; }
        .animate-gradient-move {
          background-size: 240% 240%;
          animation: gradientMove 9s ease infinite;
        }
        .animate-pulse-soft { animation: pulseSoft 4s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#f7efe5] flex items-center justify-center px-4 py-8">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
            alt="Coffee shop"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/80 via-orange-950/70 to-black/80" />
        </div>

        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-400/25 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl animate-pulse-soft" />

        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl border border-white/40 animate-fade-up">
          <div className="hidden lg:flex flex-col justify-between p-10 animate-gradient-move bg-gradient-to-br from-stone-950 via-orange-950 to-amber-900 text-white">
            <div className="animate-slide-left">
              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="relative animate-float">
                  <Coffee size={28} />

                  <span className="animate-steam absolute -top-3 left-2 w-1 h-5 bg-white/60 rounded-full blur-[1px]" />
                  <span
                    className="animate-steam absolute -top-3 left-4 w-1 h-5 bg-white/50 rounded-full blur-[1px]"
                    style={{ animationDelay: '0.7s' }}
                  />
                  <span
                    className="animate-steam absolute -top-3 left-6 w-1 h-5 bg-white/40 rounded-full blur-[1px]"
                    style={{ animationDelay: '1.3s' }}
                  />
                </div>

                <span className="font-bold text-lg">Visal Coffee POS</span>
              </div>

              <h1 className="mt-10 text-4xl font-black leading-tight">
                Create your staff account.
              </h1>

              <p className="mt-4 text-amber-100 text-sm leading-6 max-w-md">
                Register staff members, manage coffee orders, track sales, and keep your shop running smoothly.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Fast staff access',
                'Secure POS account',
                'Coffee shop dashboard',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-md hover:bg-white/15 hover:-translate-y-1 transition"
                >
                  <CheckCircle2 size={20} className="text-amber-200" />
                  <span className="text-sm text-amber-50">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-white via-orange-50/60 to-amber-50">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto lg:mx-0 w-16 h-16 rounded-3xl bg-gradient-to-br from-stone-950 via-orange-900 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-900/20 animate-float">
                <div className="relative">
                  <Coffee className="text-amber-200" size={30} />

                  <span className="animate-steam absolute -top-3 left-2 w-1 h-5 bg-amber-300/70 rounded-full blur-[1px]" />
                  <span
                    className="animate-steam absolute -top-3 left-4 w-1 h-5 bg-orange-300/60 rounded-full blur-[1px]"
                    style={{ animationDelay: '0.8s' }}
                  />
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700">
                <ShieldCheck size={14} />
                Staff Registration
              </div>

              <h2 className="mt-4 text-3xl font-black text-stone-950">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Register as a staff member for your POS system
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-fade-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                {
                  label: 'Full Name',
                  type: 'text',
                  value: name,
                  setValue: setName,
                  placeholder: 'Enter your name',
                  Icon: User,
                },
                {
                  label: 'Email Address',
                  type: 'email',
                  value: email,
                  setValue: setEmail,
                  placeholder: 'staff@visal.com',
                  Icon: Mail,
                },
                {
                  label: 'Password',
                  type: 'password',
                  value: password,
                  setValue: setPassword,
                  placeholder: 'Min. 6 characters',
                  Icon: Lock,
                },
                {
                  label: 'Confirm Password',
                  type: 'password',
                  value: confirm,
                  setValue: setConfirm,
                  placeholder: 'Re-enter your password',
                  Icon: Lock,
                },
              ].map(({ label, type, value, setValue, placeholder, Icon }) => (
                <div key={label}>
                  <label className="block text-sm font-bold text-stone-800 mb-2">
                    {label}
                  </label>

                  <div className="relative group">
                    <Icon
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition"
                    />

                    <input
                      type={type}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-2xl border border-orange-100 bg-white/90 pl-12 pr-4 py-3 text-sm text-stone-900 outline-none shadow-sm transition duration-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-stone-950 via-orange-950 to-orange-700 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-orange-900/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="text-sm text-stone-500 text-center mt-6">
              Already have an account?{' '}
              <Link
                to="/staff/login"
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