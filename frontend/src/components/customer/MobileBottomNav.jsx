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
      end: true,
      icon: (
        <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M3 10.75 12 3.5l9 7.25V21a1 1 0 0 1-1 1h-5.25v-6.25h-5.5V22H4a1 1 0 0 1-1-1V10.75Z"
          />
        </svg>
      ),
    },
    {
      to: '/products',
      label: 'Menu',
      icon: (
        <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M6 4.5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M8 8h8M8 12h8M8 16h5"
          />
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'History',
      icon: (
        <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M12 8v4l3 2.5"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 12a9 9 0 1 1-2.64-6.36"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 4v5h-5"
          />
        </svg>
      ),
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: (
        <div className="relative">
          <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M3 3h2l.55 3M5.55 6h15.2l-1.6 8.25a2 2 0 0 1-1.96 1.62H8.1a2 2 0 0 1-1.96-1.62L5.55 6Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M9 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 21Zm8 0a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 17 21Z"
            />
          </svg>

          {totalItems > 0 && (
            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[9px] font-black text-white shadow-lg animate-cartPulse">
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
        @keyframes bottomNavIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes activeScale {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @keyframes cartPulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.15);
          }
        }

        .animate-bottomNavIn {
          animation: bottomNavIn 0.32s ease-out;
        }

        .animate-activeScale {
          animation: activeScale 1.8s ease-in-out infinite;
        }

        .animate-cartPulse {
          animation: cartPulse 1.3s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed inset-x-0 bottom-3 z-50 px-3 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto max-w-md animate-bottomNavIn">
          <div className="rounded-[1.75rem] border border-[#e6c8a1] bg-white/95 p-2 shadow-[0_18px_45px_rgba(61,40,23,0.20)] backdrop-blur-2xl">
            <div className="grid h-[66px] grid-cols-4 gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  aria-label={item.label}
                  className={({ isActive }) =>
                    `group relative flex flex-col items-center justify-center rounded-[1.35rem] text-[10px] font-black transition-all duration-300 ${
                      isActive
                        ? 'bg-[#3d2415] text-white shadow-[0_12px_28px_rgba(61,36,21,0.32)]'
                        : 'text-[#8a6a50] hover:bg-[#fff1dd] hover:text-[#3d2415]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -top-1.5 h-1.5 w-9 rounded-full bg-gradient-to-r from-[#c58b49] to-[#a86530] shadow-[0_6px_14px_rgba(197,139,73,0.45)]" />
                      )}

                      <span
                        className={`mb-1 flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'animate-activeScale bg-white/15 text-white'
                            : 'bg-[#fff7ec] text-[#7b4a26] group-hover:bg-white group-hover:text-[#3d2415]'
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span
                        className={`leading-none transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-[#8a6a50] group-hover:text-[#3d2415]'
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
      </div>
    </>
  )
}