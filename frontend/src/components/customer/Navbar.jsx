import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartSidebar from "./CartSidebar.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import logo from "../../assets/images/logo.jpg";

export default function Navbar() {
  const { totalItems: cartCount } = useCart();
  const { customer, isLoggedIn, logout: customerLogout } = useCustomerAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    customerLogout();
    navigate("/");
    setMenuOpen(false);
  }

  const isActive = (path) => {
    if (path.startsWith("/#")) {
      const hash = path.replace("/#", "");
      return (
        location.hash === "#" + hash ||
        (location.pathname === "/" && !location.hash && hash === "home")
      );
    }
    return location.pathname === path;
  };

  const cartIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
      />
    </svg>
  );

  const userIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-lg"
            : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {/* Logo container */}
              <div className="relative">
                {/* Glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>

                {/* Logo image */}
                <div className="relative z-10 bg-white rounded-full p-1 shadow-md">
                  <img
                    src={logo}
                    alt="The Bird Nest Logo"
                    className="w-12 h-12 object-contain rounded-full  transition-all duration-200 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  The Bird Nest
                </span>
                <span className="text-xl text-gray-500 tracking-wide">
                  Café
                </span>
              </div>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 border-blue-500 shadow-2xl border border-blue-100 rounded-full px-6 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 shadow-sm">
              <a
                href="/#home"
                className={`px-4 py-2 rounded-4xl  text-sm font-medium transition-all duration-200 ${
                  isActive("/#home")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Home
              </a>
              <Link
                to="/history"
                className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${
                  isActive("/history")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                History
              </Link>
              <Link
                to="/service"
                className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${
                  isActive("/service")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Service
              </Link>
              <Link
                to="/promotion"
                className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${
                  isActive("/promotion")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Promotions
              </Link>
              <a
                href="/#products"
                className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${
                  isActive("/#products")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Products
              </a>
              <Link
                to="/staff/dashboard"
                className={`px-4 py-2 rounded-4xl text-sm font-medium transition-all duration-200 ${
                  isActive("/staff/dashboard")
                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Dashboard
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="hidden md:block relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
              >
                {cartIcon}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full pl-1 pr-3 py-1 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {customer?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {customer?.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/customer/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-sm"
                >
                  {userIcon}
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
              >
                <span
                  className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-blue-100 animate-slideDown">
              <div className="flex flex-col gap-2">
                <a
                  href="/#home"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/#home")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Home
                </a>
                <Link
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/history")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  History
                </Link>
                <Link
                  to="/service"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/service")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Service
                </Link>
                <Link
                  to="/promotion"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/promotion")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Promotions
                </Link>
                <a
                  href="/#products"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/#products")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Products
                </a>
                <Link
                  to="/staff/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive("/staff/dashboard")
                      ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>

                {isLoggedIn ? (
                  <div className="mt-2 pt-3 border-t border-blue-100">
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">
                            {customer?.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {customer?.name}
                          </p>
                          <p className="text-xs text-gray-500">{customer?.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/customer/login"
                    onClick={() => setMenuOpen(false)}
                    className="mx-4 mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium transition-all duration-200"
                  >
                    {userIcon}
                    <span>Login to Account</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16"></div>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Add custom animations */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.25s ease-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
