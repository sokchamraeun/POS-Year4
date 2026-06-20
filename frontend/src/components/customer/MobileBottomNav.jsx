import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'

export default function MobileBottomNav() {
  const { totalItems } = useCart()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const check = () => setHidden(document.body.dataset.modalOpen === 'true')
    check()

    const observer = new MutationObserver(check)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-modal-open'],
    })

    return () => observer.disconnect()
  }, [])

  if (hidden) return null

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z"
          />
        </svg>
      ),
    },
    {
      to: '/products',
      label: 'Menu',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4"
          />
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'History',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M12 8v4l3 3m6-3a9 9 0 11-9-9"
          />
        </svg>
      ),
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: (
        <div className="relative">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M3 3h2l1 5h13l1-5h2M6 8l1.5 9h9L18 8M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>

          {totalItems > 0 && (
            <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#120b07] bg-red-600 px-1 text-[9px] font-black text-white shadow-lg animate-cart-bounce">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <style>{`
        @keyframes navSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes activePop {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.08);
          }
        }

        @keyframes cartBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18);
          }
        }

        .animate-nav-slide-up {
          animation: navSlideUp 0.35s ease-out;
        }

        .animate-active-pop {
          animation: activePop 1.8s ease-in-out infinite;
        }

        .animate-cart-bounce {
          animation: cartBounce 1.3s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="animate-nav-slide-up rounded-[2rem] border border-white/10 bg-[#120b07]/95 p-2 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <div className="grid h-[68px] grid-cols-4 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center rounded-[1.5rem] text-[11px] font-black transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-[#120b07] shadow-lg shadow-amber-950/20'
                      : 'text-white/55 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -top-1 h-1 w-8 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40"></span>
                    )}

                    <span
                      className={`mb-1 flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-active-pop'
                          : 'bg-white/5 text-white/65 group-hover:bg-white/10 group-hover:text-amber-300'
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span
                      className={`leading-none transition-all duration-300 ${
                        isActive ? 'text-[#120b07]' : 'text-white/55 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}