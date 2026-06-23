import Sidebar from '../staff/Sidebar.jsx'
import Topbar from '../staff/Topbar.jsx'

const BrandLogo = ({ className = 'w-6 h-6 text-teal-900' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="48" rx="16" fill="#f0fdfa" />
    <path d="M20 28h22v9a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8v-9Z" fill="#0f172a" />
    <path d="M42 31h3a5 5 0 0 1 0 10h-3" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
    <path d="M22 49h24" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
    <path d="M24 17c0 3-3 3-3 6" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 17c0 3-3 3-3 6" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 17c0 3-3 3-3 6" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export default function Loader({
  text = 'Loading Coffee POS',
  subtitle = 'Preparing orders, menu, inventory, reports, cashier tools, and payments.',
  page = true,
}) {
  const content = (
    <div className="loader-fade-up relative w-full max-w-4xl mx-auto">
      <div className="relative grid grid-cols-1 md:grid-cols-2 bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="relative p-6 md:p-10 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-sm rounded-[2rem] bg-slate-900/95 border border-teal-600/25 shadow-2xl p-6 overflow-hidden">

            {/* Animated Scan Line */}
            <div className="loader-scan-line absolute left-6 right-6 h-1 bg-teal-400 rounded-full shadow-[0_0_30px_#5eead4]"></div>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-4 w-32 bg-teal-400/80 rounded-full"></div>
                <div className="h-3 w-20 bg-white/10 rounded-full mt-3"></div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-600/40 flex items-center justify-center overflow-hidden shadow-lg">
                <BrandLogo className="w-9 h-9 text-teal-900" />
              </div>
            </div>

            {/* Coffee Circle Loader */}
            <div className="relative mx-auto w-52 h-52 flex items-center justify-center mb-7">
              <div className="loader-rotate absolute inset-0 rounded-full border-[6px] border-transparent border-t-teal-400 border-r-teal-600"></div>
              <div className="loader-rotate absolute inset-6 rounded-full border-[5px] border-transparent border-b-teal-700 border-l-teal-500 [animation-direction:reverse]"></div>
              <div className="absolute inset-14 rounded-full bg-teal-400/15 blur-xl"></div>

              <div className="loader-float relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-teal-500 via-teal-600 to-slate-700 border-4 border-teal-200/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#f0fdfa" opacity="0.18" />
                  <path d="M42 22c7 8-7 12 0 20" stroke="#99f6e4" strokeWidth="5" strokeLinecap="round" />
                  <path d="M60 18c7 8-7 13 0 23" stroke="#5eead4" strokeWidth="5" strokeLinecap="round" />
                  <path d="M78 22c7 8-7 12 0 20" stroke="#99f6e4" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="58" cy="93" rx="34" ry="8" fill="#0f172a" opacity="0.35" />
                  <path d="M28 52h55v23c0 13-10 23-23 23h-9c-13 0-23-10-23-23V52Z" fill="#f8fafc" />
                  <path d="M34 58h43v16c0 10-8 18-18 18h-7c-10 0-18-8-18-18V58Z" fill="#14b8a6" opacity="0.25" />
                  <ellipse cx="55.5" cy="53" rx="27.5" ry="8" fill="#1e293b" />
                  <ellipse cx="55.5" cy="51" rx="23" ry="5" fill="#334155" />
                  <path d="M83 60h8c9 0 15 7 15 15s-6 15-15 15h-8" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" />
                  <path d="M40 64v14" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="loader-pulse rounded-2xl bg-white/10 border border-teal-200/10 p-4">
                <div className="h-3 w-16 bg-teal-400/60 rounded-full mb-3"></div>
                <div className="h-8 w-12 bg-teal-400/20 rounded-xl"></div>
              </div>
              <div className="loader-pulse rounded-2xl bg-white/10 border border-slate-200/10 p-4 [animation-delay:0.2s]">
                <div className="h-3 w-16 bg-slate-400/60 rounded-full mb-3"></div>
                <div className="h-8 w-12 bg-slate-400/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-6 md:p-10 flex flex-col justify-center bg-slate-50">

          {/* Brand Badge */}
          <div className="inline-flex w-fit items-center gap-3 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold mb-6">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
              <BrandLogo className="w-6 h-6 text-teal-900" />
            </div>
            Coffee POS System
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            {text}
          </h1>

          {subtitle && (
            <p className="mt-4 text-slate-600 leading-relaxed">{subtitle}</p>
          )}

          {/* Progress */}
          <div className="mt-8 rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-900">System Sync</p>
                <p className="text-xs text-teal-600 mt-1">Starting workspace...</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center overflow-hidden">
                <BrandLogo className="w-8 h-8 text-teal-900" />
              </div>
            </div>

            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="loader-progress absolute top-0 left-0 h-full w-1/2 rounded-full bg-gradient-to-r from-slate-700 via-teal-600 to-teal-400"></div>
            </div>
          </div>

          {/* Module Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Orders */}
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-teal-800" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z" fill="#f0fdfa" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-teal-900">Orders</p>
            </div>

            {/* Products */}
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-slate-700" viewBox="0 0 24 24" fill="none">
                  <path d="M5 10h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-5Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.8" />
                  <path d="M15 12h2a3 3 0 0 1 0 6h-2" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M6 21h12" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 4c0 1-1 1-1 3M12 4c0 1-1 1-1 3M16 4c0 1-1 1-1 3" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Products</p>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl bg-teal-50/70 border border-teal-200 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-teal-700" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z" fill="#f0fdfa" stroke="#0f766e" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M4.5 9 12 13.2 19.5 9" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 13v8" stroke="#0f766e" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 6.5 16 11" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-teal-800">Inventory</p>
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-slate-600" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.8" />
                  <path d="M3 9h18" stroke="#475569" strokeWidth="1.8" />
                  <path d="M7 14h5" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M16.5 14.5h1" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-700">Payment</p>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-8 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 animate-bounce"></span>
            <span className="w-3 h-3 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-3 h-3 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loaderRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes loaderFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-10px) scale(1.04); }
        }
        @keyframes loaderScanLine {
          0%   { transform: translateY(-20px); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        @keyframes loaderProgress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(260%); }
        }
        @keyframes loaderFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.04); opacity: 1; }
        }
        .loader-rotate    { animation: loaderRotate 2.4s linear infinite; }
        .loader-float     { animation: loaderFloat 2.8s ease-in-out infinite; }
        .loader-scan-line { animation: loaderScanLine 2s ease-in-out infinite; }
        .loader-progress  { animation: loaderProgress 1.7s ease-in-out infinite; }
        .loader-fade-up   { animation: loaderFadeUp 0.8s ease-out; }
        .loader-pulse     { animation: loaderPulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  )

  if (!page) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-white via-slate-50 to-teal-50 rounded-[2.5rem]">
        {content}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-white via-slate-50 to-teal-50">
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-[520px] h-[520px] bg-slate-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          {content}
        </main>
      </div>
    </div>
  )
}
