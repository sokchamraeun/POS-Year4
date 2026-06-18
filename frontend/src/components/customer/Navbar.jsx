import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartSidebar from "./CartSidebar.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";

export default function Navbar() {
  const { totalItems: cartCount } = useCart();
  const { settings } = useSettings();
  const { customer, isLoggedIn, logout: customerLogout } = useCustomerAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  const navLinks = [
    { label: "Home", to: "/#home", isAnchor: true },
    { label: "History", to: "/history" },
    { label: "Service", to: "/service" },
    { label: "Promotions", to: "/promotion" },
    { label: "Products", to: "/#products", isAnchor: true },
    { label: "Dashboard", to: "/staff/dashboard" },
  ];

  const cartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );

  const userIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(59,130,246,0.12)] border-b border-blue-200/60"
          : "bg-white/60 backdrop-blur-md border-b border-white/40"
      }`}>

        {/* Top gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full blur-lg opacity-30 group-hover:opacity-60 transition-all duration-300 scale-110" />
                <div className="relative z-10 ring-2 ring-blue-200/80 group-hover:ring-blue-400/80 bg-white rounded-full p-0.5 shadow-lg transition-all duration-300">
                  <img
                    src={settings.logo}
                    alt={`${settings.site_name} Logo`}
                    className="w-11 h-11 object-contain rounded-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                  {settings.site_name}
                </span>
                {settings.tagline && (
                  <span className="text-xs text-gray-400 font-medium tracking-[0.2em] uppercase">{settings.tagline}</span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation — pill with glassmorphism */}
            <div className="hidden md:flex items-center gap-0.5 bg-white/50 backdrop-blur-sm border border-blue-200/70 shadow-[0_2px_20px_rgba(59,130,246,0.1)] rounded-full px-2 py-1.5">
              {navLinks.map(({ label, to, isAnchor }) => {
                const active = isActive(to);
                const cls = `relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_2px_12px_rgba(59,130,246,0.4)]"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/80"
                }`;
                return isAnchor ? (
                  <a key={to} href={to} className={cls}>{label}</a>
                ) : (
                  <Link key={to} to={to} className={cls}>{label}</Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="hidden md:flex relative items-center justify-center w-10 h-10 rounded-full bg-white/60 border border-blue-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all duration-200"
              >
                {cartIcon}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center shadow-md ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blue-200/80 rounded-full pl-1 pr-3 py-1 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-200">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                      <span className="text-white font-bold text-sm">
                        {customer?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {customer?.name?.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors px-2 py-0.5 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/customer/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold shadow-[0_2px_16px_rgba(59,130,246,0.35)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {userIcon}
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full bg-white/60 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <span className={`block w-4.5 h-[2px] bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block w-4.5 h-[2px] bg-gray-600 rounded-full transition-all duration-200 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-4.5 h-[2px] bg-gray-600 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-blue-100/80 animate-slideDown">
              <div className="flex flex-col gap-1">
                {navLinks.map(({ label, to, isAnchor }) => {
                  const active = isActive(to);
                  const cls = `px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`;
                  return isAnchor ? (
                    <a key={to} href={to} onClick={() => setMenuOpen(false)} className={cls}>{label}</a>
                  ) : (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={cls}>{label}</Link>
                  );
                })}

                {/* Mobile Cart */}
                <button
                  onClick={() => { setCartOpen(true); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  {cartIcon}
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Mobile User */}
                <div className="mt-1 pt-3 border-t border-blue-100/80">
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                          <span className="text-white font-bold text-sm">{customer?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{customer?.name}</p>
                          <p className="text-xs text-gray-400">{customer?.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-100"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/customer/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-[0_2px_16px_rgba(59,130,246,0.35)] transition-all duration-200"
                    >
                      {userIcon}
                      <span>Login to Account</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16" />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideLeft { animation: slideLeft 0.25s ease-out; }
      `}</style>
    </>
  );
}
