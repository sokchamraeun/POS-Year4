import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cartCount = 3

  const cartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  )

  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold text-gray-800">isal</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="/#home"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </a>
            <Link
              to="/service"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Service
            </Link>
            <a
              href="/#products"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Product
            </a>
            <Link
              to="/staff/dashboard"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative text-gray-600 hover:text-blue-600 transition-colors">
              {cartIcon}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">John Doe</span>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoggedIn(true)}
                className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {userIcon}
                <span className="text-sm">Login</span>
              </button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <a
              href="/#home"
              onClick={() => setMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </a>
            <Link
              to="/service"
              onClick={() => setMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Service
            </Link>
            <a
              href="/#products"
              onClick={() => setMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Product
            </a>
            <Link
              to="/staff/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">John Doe</span>
                <button
                  onClick={() => { setIsLoggedIn(false); setMenuOpen(false) }}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsLoggedIn(true); setMenuOpen(false) }}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium pt-2 border-t border-gray-200"
              >
                {userIcon}
                <span className="text-sm">Login</span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
