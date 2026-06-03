import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Coffee, Mail, Lock, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (!data.user?.role) {
        setError("Your account has no role assigned. Contact an administrator.");
        return;
      }

      if (data.must_change_password) {
        navigate("/staff/change-password");
      } else {
        navigate("/staff/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(45px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glow {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .75; transform: scale(1.12); }
        }

        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: .8; }
          100% { opacity: 0; transform: translateY(-26px) scale(1.5); }
        }

        .animate-slide-in { animation: slideIn .8s ease forwards; }
        .animate-fade-in { animation: fadeIn .9s ease forwards; }
        .animate-float { animation: float 3.5s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotateSlow 18s linear infinite; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .animate-steam { animation: steam 2.5s ease-out infinite; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#120b07] flex items-center justify-center px-4 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#7c2d12_0%,transparent_35%),radial-gradient(circle_at_bottom_right,#92400e_0%,transparent_35%)]" />

        <div className="absolute top-20 left-16 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl animate-glow" />
        <div className="absolute bottom-10 right-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl animate-glow" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-white/10 rounded-full animate-rotate-slow" />

        <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.05fr_.95fr] rounded-[2rem] overflow-hidden border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl animate-fade-in">
          <div className="relative hidden lg:flex flex-col justify-between min-h-[640px] p-10 text-white overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1511920170033-f8396924c348"
              alt="Coffee shop"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-stone-950/65 to-amber-950/70" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 border border-white/15 px-5 py-3 backdrop-blur-md">
                <div className="relative w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center animate-float shadow-lg shadow-amber-900/30">
                  <Coffee size={23} />

                  <span className="animate-steam absolute -top-3 left-4 w-1 h-5 bg-white/70 rounded-full blur-[1px]" />
                  <span
                    className="animate-steam absolute -top-3 left-6 w-1 h-5 bg-white/50 rounded-full blur-[1px]"
                    style={{ animationDelay: "0.8s" }}
                  />
                </div>

                <div>
                  <p className="font-bold leading-none">Visal Coffee POS</p>
                  <p className="text-xs text-amber-100 mt-1">Staff Management</p>
                </div>
              </div>

              <h1 className="mt-16 text-5xl font-black leading-tight tracking-tight">
                Fast login.
                <br />
                Smooth coffee orders.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-stone-200">
                Manage orders, tables, payments, products, staff, and live dashboard updates.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-4">
              {[
                ["01", "Login"],
                ["02", "Take Order"],
                ["03", "Track Sales"],
              ].map(([num, text]) => (
                <div
                  key={num}
                  className="rounded-3xl bg-white/10 border border-white/10 p-5 backdrop-blur-md hover:bg-white/15 hover:-translate-y-1 transition"
                >
                  <p className="text-3xl font-black">{num}</p>
                  <p className="mt-2 text-xs text-stone-200">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10 lg:p-14 animate-slide-in">
            <div className="max-w-md mx-auto">
              <div className="mb-10">
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-stone-950 to-orange-900 flex items-center justify-center shadow-xl shadow-orange-950/20 animate-float">
                  <Coffee className="text-amber-300" size={30} />

                  <span className="animate-steam absolute -top-3 left-6 w-1 h-5 bg-amber-400/70 rounded-full blur-[1px]" />
                  <span
                    className="animate-steam absolute -top-3 left-9 w-1 h-5 bg-orange-400/60 rounded-full blur-[1px]"
                    style={{ animationDelay: "0.8s" }}
                  />
                </div>

                <div className="mt-7 inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700">
                  Staff Login Portal
                </div>

                <h2 className="mt-4 text-4xl font-black text-stone-950">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm text-stone-500">
                  Sign in to continue to your POS dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">
                    Email Address
                  </label>

                  <div className="relative group">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 pl-12 text-sm text-stone-900 outline-none transition focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">
                    Password
                  </label>

                  <div className="relative group">
                    <Lock
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-700 transition"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 pl-12 pr-12 text-sm text-stone-900 outline-none transition focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-700 transition"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-stone-950 via-orange-950 to-orange-800 px-5 py-4 text-sm font-black text-white shadow-xl shadow-orange-950/20 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700" />

                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-stone-500">
                  Don't have an account?{" "}
                  <Link
                    to="/staff/register"
                    className="font-black text-orange-700 hover:text-stone-950 transition"
                  >
                    Register here
                  </Link>
                </p>

                <p className="mt-4 text-xs text-stone-400">
                  Visal POS System © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}