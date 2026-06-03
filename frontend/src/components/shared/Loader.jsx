import Sidebar from '../staff/Sidebar.jsx'
import Topbar from '../staff/Topbar.jsx'

export default function Loader({ text = 'Loading...', page = true }) {
  const content = (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 border-r-teal-600 border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <p className="text-gray-600 font-medium">{text}</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce-dot-1"></span>
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce-dot-2"></span>
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce-dot-3"></span>
        </div>
      </div>
      <style>{`
        @keyframes bounce-dot-1 {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes bounce-dot-2 {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes bounce-dot-3 {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .animate-bounce-dot-1 { animation: bounce-dot-1 1.2s ease-in-out infinite; }
        .animate-bounce-dot-2 { animation: bounce-dot-2 1.2s ease-in-out 0.2s infinite; }
        .animate-bounce-dot-3 { animation: bounce-dot-3 1.2s ease-in-out 0.4s infinite; }
      `}</style>
    </div>
  )

  if (!page) return content

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex items-center justify-center">{content}</main>
      </div>
    </div>
  )
}
