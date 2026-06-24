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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const siteName = settings?.site_name || "Coffee House";
  const tagline = settings?.tagline || "Fresh coffee daily";
  const logo = settings?.logo || "/logo.png";

  const firstName = customer?.name?.trim()?.split(" ")[0] || "Customer";
  const userInitial = firstName?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

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
    { label: "ទំព័រដើម", to: "/#home", isAnchor: true },
    { label: "ម៉ឺនុយ", to: "/#products", isAnchor: true },
    { label: "ប្រមូលសិន", to: "/promotion" },
    { label: "ប្រវត្តិបញ្ជាទិញ", to: "/history" },
    { label: "សម្រាប់បុគ្គលិក", to: "/staff/dashboard" },
  ];

  const cartIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.45 2.3M7 13h9.8c.7 0 1.3-.38 1.62-1l3.08-6H5.45M7 13 5.45 5.3M7 13l-1.2 2.1c-.43.75.1 1.65.96 1.65H18M9 20.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm8 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
      />
    </svg>
  );

  const userIcon = (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );

  const closeIcon = (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-[#f0fdfa]/90 shadow-[0_18px_45px_rgba(15,118,110,0.14)] backdrop-blur-2xl border-b border-[#99f6e4]/40"
            : "bg-[#f0fdfa]/75 backdrop-blur-xl border-b border-white/60"
        }`}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#134e4a] via-[#14b8a6] to-[#0f766e]" />
          <div className="pointer-events-none absolute -left-24 -top-20 h-44 w-44 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#0f766e]/15 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-[68px] items-center justify-between gap-3 sm:h-[76px]">
              {/* Logo */}
              <Link to="/" className="group flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-[#0f766e] to-[#14b8a6] opacity-30 blur-lg transition-all duration-300 group-hover:opacity-60" />

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-[#99f6e4]/70 bg-white shadow-[0_12px_28px_rgba(15,118,110,0.16)] transition-all duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-13 sm:w-13 sm:rounded-[1.35rem]">
                    <img
                      src={logo}
                      alt={`${siteName} Logo`}
                      className="h-9 w-9 rounded-xl object-contain sm:h-11 sm:w-11 sm:rounded-[1rem]"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-black tracking-tight text-[#134e4a] sm:text-xl">
                    {siteName}
                  </h1>

                  {tagline && (
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-[#14b8a6] sm:text-[11px] sm:tracking-[0.24em]">
                      {tagline}
                    </p>
                  )}
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden items-center rounded-full border border-[#99f6e4]/60 bg-white/70 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_30px_rgba(15,118,110,0.08)] backdrop-blur-xl lg:flex">
                {navLinks.map(({ label, to, isAnchor }) => {
                  const active = isActive(to);

                  const cls = `relative rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] text-white shadow-[0_10px_24px_rgba(15,118,110,0.28)]"
                      : "text-[#115e59] hover:bg-[#f0fdfa] hover:text-[#134e4a]"
                  }`;

                  return isAnchor ? (
                    <a key={to} href={to} className={cls}>
                      {label}
                    </a>
                  ) : (
                    <Link key={to} to={to} className={cls}>
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* Right Section */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Desktop Cart Only */}
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#99f6e4]/70 bg-white/75 text-[#0f766e] shadow-[0_10px_24px_rgba(15,118,110,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0d9488]/60 hover:bg-[#f0fdfa] hover:shadow-[0_16px_30px_rgba(15,118,110,0.14)] md:flex"
                  aria-label="Open cart"
                >
                  {cartIcon}

                  {cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#f0fdfa] bg-gradient-to-br from-red-600 to-teal-500 px-1 text-[10px] font-black text-white shadow-md">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Desktop User */}
                {isLoggedIn ? (
                  <div className="hidden items-center gap-2 rounded-2xl border border-[#99f6e4]/70 bg-white/75 py-1 pl-1 pr-2 shadow-[0_10px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:flex">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] text-sm font-black text-white shadow-md">
                      {userInitial}

                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                    </div>

                    <div className="hidden leading-tight md:block">
                      <p className="max-w-[90px] truncate text-sm font-black text-[#134e4a]">
                        {firstName}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#14b8a6]">
                        Member
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-2 text-xs font-black text-[#14b8a6] transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/customer/login"
                    className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-4 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,118,110,0.38)] active:scale-95 sm:flex"
                  >
                    {userIcon}
                    Login
                  </Link>
                )}

                {/* Mobile Menu Button Only */}
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#99f6e4]/70 bg-white/75 text-[#0f766e] shadow-sm transition-all duration-300 hover:bg-[#f0fdfa] lg:hidden"
                  aria-label="Open menu"
                >
                  {menuOpen ? (
                    closeIcon
                  ) : (
                    <span className="flex flex-col gap-1.5">
                      <span className="h-0.5 w-5 rounded-full bg-current" />
                      <span className="h-0.5 w-5 rounded-full bg-current" />
                      <span className="h-0.5 w-5 rounded-full bg-current" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
              <div className="pb-5 lg:hidden">
                <div className="animate-slideDown overflow-hidden rounded-[1.75rem] border border-[#99f6e4]/70 bg-white/90 p-3 shadow-[0_20px_50px_rgba(15,118,110,0.14)] backdrop-blur-2xl">
                  <div className="mb-3 rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] p-4 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-100/80">
                      Welcome to
                    </p>
                    <p className="mt-1 text-lg font-black">{siteName}</p>
                    <p className="mt-1 text-xs font-semibold text-teal-100/80">
                      Order fresh coffee, drinks, and promotions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {navLinks.map(({ label, to, isAnchor }) => {
                      const active = isActive(to);

                      const cls = `rounded-2xl px-4 py-3 text-center text-sm font-black transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-[#134e4a] to-[#0d9488] text-white shadow-md"
                          : "bg-[#f0fdfa] text-[#115e59] hover:bg-[#ccfbf1] hover:text-[#134e4a]"
                      }`;

                      return isAnchor ? (
                        <a key={to} href={to} className={cls}>
                          {label}
                        </a>
                      ) : (
                        <Link key={to} to={to} className={cls}>
                          {label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 border-t border-[#99f6e4]/60 pt-3">
                    {isLoggedIn ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f0fdfa] p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#134e4a] to-[#0d9488] text-sm font-black text-white shadow-md">
                            {userInitial}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#134e4a]">
                              {customer?.name || "Customer"}
                            </p>

                            {customer?.phone && (
                              <p className="truncate text-xs font-semibold text-[#14b8a6]">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-black text-red-500 transition-colors hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/customer/login"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#134e4a] via-[#0f766e] to-[#0d9488] px-4 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)]"
                      >
                        {userIcon}
                        Login to Account
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-[68px] sm:h-[76px]" />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.22s ease-out;
        }
      `}</style>
    </>
  );
}