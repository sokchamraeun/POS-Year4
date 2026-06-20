import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Coffee, Mail, Lock, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function CartoonWelcome() {
  return (
    <div className="relative mx-auto mb-7 h-44 w-full overflow-hidden rounded-[2rem] border border-[#eadfd2] bg-[#f8f4ee]">
      {/* Background */}
      <div className="absolute -top-14 right-8 h-40 w-40 rounded-full bg-amber-300/35 blur-3xl animate-soft-glow" />
      <div
        className="absolute -bottom-16 left-6 h-44 w-44 rounded-full bg-[#3d2817]/15 blur-3xl animate-soft-glow"
        style={{ animationDelay: "0.8s" }}
      />

      {/* Speech bubble */}
      <div className="absolute right-5 top-5 z-20 rounded-3xl bg-white px-4 py-3 text-[#2a160c] shadow-lg animate-bubble-pop">
        <p className="text-[10px] font-black uppercase tracking-wide text-[#8a5b37]">
          Welcome!
        </p>
        <p className="text-sm font-black leading-tight">Ready for work?</p>
        <span className="absolute -bottom-2 left-7 h-4 w-4 rotate-45 bg-white"></span>
      </div>

      {/* Cartoon coffee cup */}
      <div className="absolute bottom-5 left-12 z-10 animate-cartoon-bob">
        {/* Steam */}
        <span className="absolute -top-11 left-8 h-8 w-1.5 rounded-full bg-[#3d2817]/60 blur-[1px] animate-steam" />
        <span
          className="absolute -top-12 left-13 h-9 w-1.5 rounded-full bg-amber-500/60 blur-[1px] animate-steam"
          style={{ animationDelay: "0.55s" }}
        />
        <span
          className="absolute -top-10 left-18 h-7 w-1.5 rounded-full bg-orange-400/50 blur-[1px] animate-steam"
          style={{ animationDelay: "1s" }}
        />

        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 h-5 w-32 -translate-x-1/2 rounded-full bg-[#3d2817]/15 blur-sm"></div>

        {/* Cup */}
        <div className="relative h-24 w-28 rounded-b-[2rem] rounded-t-[1.1rem] border-[3px] border-white bg-gradient-to-br from-white via-[#fff7ed] to-amber-100 shadow-xl shadow-[#3d2817]/15">
          {/* Coffee top */}
          <div className="absolute -top-4 left-1/2 h-8 w-24 -translate-x-1/2 rounded-full border-[3px] border-white bg-gradient-to-r from-[#2a160c] via-[#5b3a29] to-[#2a160c] shadow-inner">
            <div className="absolute left-5 top-2 h-2 w-7 rounded-full bg-white/20"></div>
          </div>

          {/* Handle */}
          <div className="absolute right-[-25px] top-8 h-11 w-9 rounded-r-full border-[3px] border-l-0 border-white bg-transparent"></div>

          {/* Eyes */}
          <div className="absolute left-1/2 top-10 flex -translate-x-1/2 items-center gap-4">
            <div className="h-3.5 w-3.5 rounded-full bg-[#2a160c] animate-cartoon-blink"></div>
            <div
              className="h-3.5 w-3.5 rounded-full bg-[#2a160c] animate-cartoon-blink"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          {/* Smile */}
          <div className="absolute left-1/2 top-[60px] h-4 w-8 -translate-x-1/2 rounded-b-full border-b-4 border-[#2a160c]"></div>

          {/* Cheeks */}
          <div className="absolute left-5 top-[56px] h-3 w-5 rounded-full bg-orange-300/70 animate-sparkle"></div>
          <div
            className="absolute right-5 top-[56px] h-3 w-5 rounded-full bg-orange-300/70 animate-sparkle"
            style={{ animationDelay: "0.7s" }}
          ></div>

          {/* Small badge */}
          <div className="absolute bottom-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#3d2817] text-amber-200">
            <Coffee size={14} />
          </div>
        </div>

        {/* Waving hand */}
        <div className="absolute -left-7 top-10 origin-bottom-right animate-cartoon-wave">
          <div className="h-5 w-8 rounded-full border-2 border-white bg-amber-100"></div>
          <div className="absolute -left-2 top-0 h-3 w-3 rounded-full border-2 border-white bg-amber-100"></div>
        </div>

        {/* Sparkles */}
        <span className="absolute -right-7 top-0 h-2.5 w-2.5 rounded-full bg-amber-400 animate-sparkle"></span>
        <span
          className="absolute -left-7 top-3 h-2 w-2 rounded-full bg-orange-400 animate-sparkle"
          style={{ animationDelay: "0.8s" }}
        ></span>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-5 right-5 text-right">
        <p className="text-xs font-black uppercase tracking-wide text-[#3d2817]">
          Coffee POS
        </p>
        <p className="text-[11px] font-bold text-[#8a715c]">
          Staff Dashboard
        </p>
      </div>
    </div>
  );
}

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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes coffeeFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes softGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }

        @keyframes steam {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.85);
          }
          35% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translateY(-26px) scale(1.45);
          }
        }

        @keyframes lineMove {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes rotateRing {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reverseRing {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes iconPop {
          0%, 100% {
            transform: translateY(-50%) scale(1);
          }
          50% {
            transform: translateY(-50%) scale(1.12);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes colorPulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(245, 158, 11, 0);
          }
          50% {
            box-shadow: 0 0 28px rgba(245, 158, 11, 0.45);
          }
        }

        @keyframes cartoonBob {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-2deg);
          }
        }

        @keyframes cartoonWave {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(24deg);
          }
        }

        @keyframes cartoonBlink {
          0%, 88%, 100% {
            transform: scaleY(1);
          }
          92%, 96% {
            transform: scaleY(0.15);
          }
        }

        @keyframes bubblePop {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.85);
          }
          70% {
            opacity: 1;
            transform: translateY(-4px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.75s ease forwards;
        }

        .animate-coffee-float {
          animation: coffeeFloat 3.6s ease-in-out infinite;
        }

        .animate-soft-glow {
          animation: softGlow 4s ease-in-out infinite;
        }

        .animate-steam {
          animation: steam 2.4s ease-out infinite;
        }

        .animate-line-move {
          animation: lineMove 1s ease-in-out;
        }

        .animate-rotate-ring {
          animation: rotateRing 16s linear infinite;
        }

        .animate-reverse-ring {
          animation: reverseRing 11s linear infinite;
        }

        .animate-icon-pop {
          animation: iconPop 1.8s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.8s ease-in-out infinite;
        }

        .animate-color-pulse {
          animation: colorPulse 2.8s ease-in-out infinite;
        }

        .animate-cartoon-bob {
          animation: cartoonBob 3.8s ease-in-out infinite;
        }

        .animate-cartoon-wave {
          animation: cartoonWave 1.2s ease-in-out infinite;
        }

        .animate-cartoon-blink {
          animation: cartoonBlink 3.2s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-bubble-pop {
          animation: bubblePop 0.85s ease forwards;
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#120b07] px-4 py-8 flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(120,53,15,0.45),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(61,40,23,0.65),transparent_36%),linear-gradient(135deg,#120b07,#1c100a,#2a160c)]" />

        <div className="absolute top-10 left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl animate-soft-glow" />
        <div
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-[#5b3a29]/45 blur-3xl animate-soft-glow"
          style={{ animationDelay: "1.2s" }}
        />

        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 w-full max-w-6xl animate-fade-in-up">
          <div className="grid overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left Dark Coffee Panel */}
            <div className="relative hidden min-h-[640px] overflow-hidden bg-[#1a0f09] p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31"
                alt="Coffee workspace"
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-[#120b07]/95 via-[#1f130c]/85 to-[#3d2817]/80" />

              <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-soft-glow" />
              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#5b3a29]/50 blur-3xl animate-soft-glow" />

              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-amber-100 to-orange-200 text-[#2a160c] shadow-xl shadow-amber-950/25 animate-coffee-float animate-color-pulse">
                    <div className="absolute -inset-2 rounded-[1.3rem] border border-amber-300/60 animate-rotate-ring" />
                    <div className="absolute -inset-3 rounded-[1.5rem] border border-white/20 border-t-white/70 animate-reverse-ring" />

                    <Coffee size={27} className="relative z-10" />

                    <span className="absolute -top-3 left-5 h-5 w-1 rounded-full bg-white/80 blur-[1px] animate-steam" />
                    <span
                      className="absolute -top-3 left-8 h-5 w-1 rounded-full bg-amber-100/70 blur-[1px] animate-steam"
                      style={{ animationDelay: "0.75s" }}
                    />

                    <span className="absolute -right-1 top-1 h-2 w-2 rounded-full bg-amber-400 animate-sparkle" />
                    <span
                      className="absolute -bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-orange-400 animate-sparkle"
                      style={{ animationDelay: "0.8s" }}
                    />
                  </div>

                  <div>
                    <p className="text-base font-black leading-none">
                      Coffee POS
                    </p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                      Staff Dashboard
                    </p>
                  </div>
                </div>

                <div className="mt-20">
                  <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/80 backdrop-blur">
                    Dark Coffee Theme
                  </p>

                  <h1 className="max-w-xl text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                    Login and manage your coffee shop faster.
                  </h1>

                  <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                    A clean staff portal for orders, tables, products, stock,
                    payments, reports, and daily coffee shop operations.
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-3 gap-4">
                {[
                  ["01", "Orders"],
                  ["02", "Stock"],
                  ["03", "Sales"],
                ].map(([num, text], index) => (
                  <div
                    key={num}
                    className="group rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#2a160c] shadow-lg transition group-hover:scale-110 group-hover:bg-amber-200">
                      <span className="text-xs font-black">{num}</span>
                    </div>

                    <p className="text-lg font-black text-white">{text}</p>
                    <p className="mt-1 text-xs font-bold text-white/50">
                      {index === 0
                        ? "Live order"
                        : index === 1
                          ? "Track stock"
                          : "Daily report"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right White Login Panel */}
            <div className="relative bg-white px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#120b07] via-[#3d2817] to-[#120b07]" />

              <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-[#3d2817]/10 blur-3xl" />
              <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#120b07]/10 blur-3xl" />

              <div className="relative mx-auto max-w-md">
                {/* Cartoon is now inside right box */}
                <CartoonWelcome />

                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f4ee] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#3d2817] ring-1 ring-[#3d2817]/10">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Staff Login
                  </div>

                  <h2 className="mt-5 text-4xl font-black text-[#120b07]">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#8a715c]">
                    Sign in to continue to your coffee POS dashboard.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-black text-[#1c100a]">
                      Email Address
                    </label>

                    <div className="group relative">
                      <span className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-[#eadfd2] bg-white text-[#8a715c] transition-all duration-300 group-focus-within:border-[#3d2817] group-focus-within:bg-gradient-to-br group-focus-within:from-[#1c100a] group-focus-within:to-[#5b3a29] group-focus-within:text-amber-200 group-focus-within:animate-icon-pop">
                        <Mail size={18} />
                      </span>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full rounded-2xl border border-[#eadfd2] bg-[#f8f4ee] px-4 py-4 pl-14 text-sm font-medium text-[#1c100a] outline-none transition focus:border-[#3d2817] focus:bg-white focus:ring-4 focus:ring-[#3d2817]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-[#1c100a]">
                      Password
                    </label>

                    <div className="group relative">
                      <span className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-[#eadfd2] bg-white text-[#8a715c] transition-all duration-300 group-focus-within:border-[#3d2817] group-focus-within:bg-gradient-to-br group-focus-within:from-[#1c100a] group-focus-within:to-[#5b3a29] group-focus-within:text-amber-200 group-focus-within:animate-icon-pop">
                        <Lock size={18} />
                      </span>

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded-2xl border border-[#eadfd2] bg-[#f8f4ee] px-4 py-4 pl-14 pr-12 text-sm font-medium text-[#1c100a] outline-none transition focus:border-[#3d2817] focus:bg-white focus:ring-4 focus:ring-[#3d2817]/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a715c] transition hover:rotate-6 hover:scale-110 hover:text-[#1c100a]"
                      >
                        {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <label className="flex items-center gap-2 font-bold text-[#8a715c]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#d9c6b5] text-[#3d2817] focus:ring-[#3d2817]"
                      />
                      Remember me
                    </label>

                    <span className="font-black text-[#3d2817]">
                      Secure login
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#120b07] via-[#3d2817] to-[#8a5b37] px-5 py-4 text-sm font-black text-white shadow-xl shadow-[#1c100a]/25 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#3d2817]/30 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-line-move" />

                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Login to Dashboard
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#3d2817]">
                            <ArrowRight size={15} />
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="mt-7 rounded-3xl border border-[#eadfd2] bg-[#f8f4ee] p-4 text-center">
                  <p className="text-sm text-[#8a715c]">
                    Don't have an account?{" "}
                    <Link
                      to="/staff/register"
                      className="font-black text-[#1c100a] transition hover:text-[#5b3a29]"
                    >
                      Register here
                    </Link>
                  </p>
                </div>

                <p className="mt-6 text-center text-xs font-medium text-[#8a715c]/70">
                  Coffee POS System © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}