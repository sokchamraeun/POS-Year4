import Sidebar from '../staff/Sidebar.jsx'
import Topbar from '../staff/Topbar.jsx'

export default function Loader({
  text = 'Loading Coffee POS',
  subtitle = 'Checking orders, menu, stock, and payments...',
  page = true,
}) {
  const content = (
    <div className="relative text-center">
      {/* POS Coffee Machine Card */}
      <div className="pos-float relative mx-auto mt-10 w-64 rounded-[2rem] bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 shadow-2xl p-5">

        {/* Coffee Icon Box */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative w-24 h-24 rounded-3xl bg-white border border-amber-200 shadow-xl flex items-center justify-center">
            {/* Steam */}
            <span className="pos-steam absolute -top-3 left-8 w-2 h-8 bg-amber-400/40 rounded-full blur-sm"></span>
            <span className="pos-steam pos-steam-2 absolute -top-3 left-11 w-2 h-8 bg-amber-400/40 rounded-full blur-sm"></span>
            <span className="pos-steam pos-steam-3 absolute -top-3 right-8 w-2 h-8 bg-amber-400/40 rounded-full blur-sm"></span>

            {/* Coffee SVG Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center shadow-inner border border-amber-200">
              <svg className="w-10 h-10 text-amber-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
                <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
                <path d="M6 20h12" />
                <path d="M7 4c0 1-1 1-1 2" />
                <path d="M11 4c0 1-1 1-1 2" />
                <path d="M15 4c0 1-1 1-1 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="relative mt-12 h-44 rounded-3xl bg-gradient-to-br from-[#5c3a21] to-[#2f1b10] border border-amber-900/20 overflow-hidden p-4 shadow-inner">

          {/* Scanner Line */}
          <div className="pos-scan absolute left-4 right-4 h-1 bg-amber-300 rounded-full shadow-[0_0_25px_#fcd34d]"></div>

          {/* Fake POS UI */}
          <div className="space-y-3">
            <div className="h-4 w-24 bg-amber-300 rounded-full"></div>
            <div className="h-3 w-full bg-white/15 rounded-full"></div>
            <div className="h-3 w-5/6 bg-white/15 rounded-full"></div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-12 bg-white/15 rounded-2xl border border-white/10"></div>
              <div className="h-12 bg-white/15 rounded-2xl border border-white/10"></div>
              <div className="h-12 bg-white/15 rounded-2xl border border-white/10"></div>
              <div className="h-12 bg-amber-300/30 rounded-2xl border border-amber-300/50"></div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="h-10 rounded-xl bg-white border border-amber-200 shadow-sm"></div>
          <div className="h-10 rounded-xl bg-white border border-amber-200 shadow-sm"></div>
          <div className="h-10 rounded-xl bg-amber-600 pos-pulse shadow-lg"></div>
        </div>

        {/* Bottom */}
        <div className="mt-5 h-3 w-28 mx-auto rounded-full bg-amber-300"></div>
      </div>

      {/* Text */}
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-amber-950">{text}</h1>
        {subtitle && <p className="mt-2 text-sm text-amber-700">{subtitle}</p>}

        {/* Animated Dots */}
        <div className="mt-5 flex justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-700 animate-bounce"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>

      <style>{`
        @keyframes pos-scan {
          0%   { top: 8px; opacity: 0; }
          15%  { opacity: 1; }
          50%  { top: 80%; opacity: 1; }
          100% { top: 8px; opacity: 0; }
        }
        .pos-scan { animation: pos-scan 2.2s infinite ease-in-out; }

        @keyframes pos-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        .pos-float { animation: pos-float 3s infinite ease-in-out; }

        @keyframes pos-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        .pos-pulse { animation: pos-pulse 1.8s infinite ease-in-out; }

        @keyframes pos-steam {
          0%   { transform: translateY(10px); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateY(-25px); opacity: 0; }
        }
        .pos-steam { animation: pos-steam 2s infinite ease-in-out; }
        .pos-steam-2 { animation-delay: 0.4s; }
        .pos-steam-3 { animation-delay: 0.8s; }
      `}</style>
    </div>
  )

  if (!page) return content

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-white">
          {/* Soft Coffee Background Glow */}
          <div className="absolute w-80 h-80 bg-amber-200/40 rounded-full blur-3xl top-10 left-10"></div>
          <div className="absolute w-80 h-80 bg-orange-200/40 rounded-full blur-3xl bottom-10 right-10"></div>
          <div className="absolute w-60 h-60 bg-teal-100/60 rounded-full blur-3xl bottom-32 left-1/3"></div>
          {content}
        </main>
      </div>
    </div>
  )
}
