import Sidebar from '../staff/Sidebar.jsx'
import Topbar from '../staff/Topbar.jsx'

const BrandLogo = ({ className = 'w-6 h-6 text-amber-900' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="48" rx="16" fill="#fef3c7" />
    <path d="M20 28h22v9a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8v-9Z" fill="#7c2d12" />
    <path d="M42 31h3a5 5 0 0 1 0 10h-3" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
    <path d="M22 49h24" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
    <path d="M24 17c0 3-3 3-3 6" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 17c0 3-3 3-3 6" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 17c0 3-3 3-3 6" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export default function Loader({
  text = 'Loading Coffee POS',
  subtitle = 'Preparing orders, menu, inventory, reports, cashier tools, and payments.',
  page = true,
}) {
  const content = (
    <div className="loader-fade-up relative w-full max-w-4xl mx-auto">
      <div className="relative grid grid-cols-1 md:grid-cols-2 bg-white/80 backdrop-blur-2xl border border-amber-200/60 rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="relative p-6 md:p-10 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-sm rounded-[2rem] bg-[#1f1209]/95 border border-amber-300/25 shadow-2xl p-6 overflow-hidden">

            {/* Animated Scan Line */}
            <div className="loader-scan-line absolute left-6 right-6 h-1 bg-amber-300 rounded-full shadow-[0_0_30px_#fcd34d]"></div>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-4 w-32 bg-amber-300/80 rounded-full"></div>
                <div className="h-3 w-20 bg-white/10 rounded-full mt-3"></div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300/40 flex items-center justify-center overflow-hidden shadow-lg">
                <BrandLogo className="w-9 h-9 text-amber-900" />
              </div>
            </div>

            {/* Coffee Circle Loader */}
            <div className="relative mx-auto w-52 h-52 flex items-center justify-center mb-7">
              <div className="loader-rotate absolute inset-0 rounded-full border-[6px] border-transparent border-t-amber-300 border-r-orange-400"></div>
              <div className="loader-rotate absolute inset-6 rounded-full border-[5px] border-transparent border-b-yellow-600 border-l-amber-500 [animation-direction:reverse]"></div>
              <div className="absolute inset-14 rounded-full bg-amber-300/15 blur-xl"></div>

              <div className="loader-float relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#d6a15d] via-[#8b5a2b] to-[#3b2415] border-4 border-amber-100/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <svg className="w-24 h-24" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="54" fill="#fef3c7" opacity="0.18" />
                  <path d="M42 22c7 8-7 12 0 20" stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
                  <path d="M60 18c7 8-7 13 0 23" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" />
                  <path d="M78 22c7 8-7 12 0 20" stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="58" cy="93" rx="34" ry="8" fill="#2b170c" opacity="0.35" />
                  <path d="M28 52h55v23c0 13-10 23-23 23h-9c-13 0-23-10-23-23V52Z" fill="#fff7ed" />
                  <path d="M34 58h43v16c0 10-8 18-18 18h-7c-10 0-18-8-18-18V58Z" fill="#f59e0b" opacity="0.25" />
                  <ellipse cx="55.5" cy="53" rx="27.5" ry="8" fill="#5c2e12" />
                  <ellipse cx="55.5" cy="51" rx="23" ry="5" fill="#92400e" />
                  <path d="M83 60h8c9 0 15 7 15 15s-6 15-15 15h-8" stroke="#fff7ed" strokeWidth="9" strokeLinecap="round" />
                  <path d="M40 64v14" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="loader-pulse rounded-2xl bg-white/10 border border-amber-200/10 p-4">
                <div className="h-3 w-16 bg-amber-300/60 rounded-full mb-3"></div>
                <div className="h-8 w-12 bg-amber-300/20 rounded-xl"></div>
              </div>
              <div className="loader-pulse rounded-2xl bg-white/10 border border-orange-200/10 p-4 [animation-delay:0.2s]">
                <div className="h-3 w-16 bg-orange-300/60 rounded-full mb-3"></div>
                <div className="h-8 w-12 bg-orange-300/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-6 md:p-10 flex flex-col justify-center bg-[#fffaf3]">

          {/* Brand Badge */}
          <div className="inline-flex w-fit items-center gap-3 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-sm font-bold mb-6">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
              <BrandLogo className="w-6 h-6 text-amber-900" />
            </div>
            Coffee POS System
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2b170c] leading-tight">
            {text}
          </h1>

          {subtitle && (
            <p className="mt-4 text-[#8b5a2b] leading-relaxed">{subtitle}</p>
          )}

          {/* Progress */}
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-[#2b170c]">System Sync</p>
                <p className="text-xs text-amber-700 mt-1">Starting workspace...</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center overflow-hidden">
                <BrandLogo className="w-8 h-8 text-amber-900" />
              </div>
            </div>

            <div className="relative h-4 bg-amber-50 rounded-full overflow-hidden border border-amber-100">
              <div className="loader-progress absolute top-0 left-0 h-full w-1/2 rounded-full bg-gradient-to-r from-[#6f3f1d] via-[#d97706] to-[#fbbf24]"></div>
            </div>
          </div>

          {/* Module Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Orders */}
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-amber-800" viewBox="0 0 24 24" fill="none">
                  <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2Z" fill="#fef3c7" stroke="#92400e" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-amber-900">Orders</p>
            </div>

            {/* Products */}
            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-orange-800" viewBox="0 0 24 24" fill="none">
                  <path d="M5 10h10v5a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-5Z" fill="#fed7aa" stroke="#9a3412" strokeWidth="1.8" />
                  <path d="M15 12h2a3 3 0 0 1 0 6h-2" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M6 21h12" stroke="#9a3412" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 4c0 1-1 1-1 3M12 4c0 1-1 1-1 3M16 4c0 1-1 1-1 3" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-orange-900">Products</p>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-yellow-800" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8.5 12 4l8 4.5v9L12 22l-8-4.5v-9Z" fill="#fef3c7" stroke="#854d0e" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M4.5 9 12 13.2 19.5 9" stroke="#854d0e" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 13v8" stroke="#854d0e" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 6.5 16 11" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-yellow-900">Inventory</p>
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-stone-100 border border-stone-200 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
                <svg className="w-7 h-7 text-stone-800" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="3" fill="#f5f5f4" stroke="#57534e" strokeWidth="1.8" />
                  <path d="M3 9h18" stroke="#57534e" strokeWidth="1.8" />
                  <path d="M7 14h5" stroke="#57534e" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M16.5 14.5h1" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-bold text-stone-800">Payment</p>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-8 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#6f3f1d] animate-bounce"></span>
            <span className="w-3 h-3 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce [animation-delay:0.4s]"></span>
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
      <div className="w-full flex items-center justify-center px-4 py-8 bg-gradient-to-br from-white via-[#fff7ed] to-[#fdebd2] rounded-[2.5rem]">
        {content}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-white via-[#fff7ed] to-[#fdebd2]">
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-[520px] h-[520px] bg-yellow-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          {content}
        </main>
      </div>
    </div>
  )
}
