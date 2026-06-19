import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext.jsx'

export default function Footer() {
  const { settings } = useSettings()

  const siteName = settings.site_name || 'Coffee Shop'
  const tagline = settings.tagline || 'Fresh Coffee Everyday'
  const location = settings.footer_location || 'Phnom Penh, Cambodia'
  const email = settings.footer_email || 'info@coffee.com'
  const phone = settings.footer_phone || '+855 00 000 000'
  const hoursWeekday = settings.hours_weekday || '7:00 - 20:00'
  const hoursSaturday = settings.hours_saturday || '8:00 - 21:00'
  const hoursSunday = settings.hours_sunday || '8:00 - 18:00'

  return (
    <footer className="relative overflow-hidden bg-[#24160f] text-amber-100/70">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500" />

      {/* Background glow */}
      <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-10 left-0 h-64 w-64 rounded-full bg-yellow-500/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="group mb-5 flex w-fit items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-xl opacity-50 transition-all duration-300 group-hover:opacity-80" />

                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/20 bg-white/10 p-1 shadow-lg backdrop-blur-sm">
                  <img
                    src={settings.logo}
                    alt={`${siteName} Logo`}
                    className="h-full w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>

              <div className="leading-tight">
                <span className="block text-lg font-black tracking-tight text-white">
                  {siteName}
                </span>

                {tagline && (
                  <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                    {tagline}
                  </span>
                )}
              </div>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-amber-100/60">
              Fresh coffee, tasty drinks, and fast ordering experience made for
              customers who love comfort and good flavor.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-white/5 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-100/80">
                Open daily for fresh orders
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', to: '/#home', anchor: true },
                { label: 'Our Services', to: '/service' },
                { label: 'Menu Products', to: '/#products', anchor: true },
                { label: 'Promotions', to: '/promotion' },
              ].map(({ label, to, anchor }) =>
                anchor ? (
                  <li key={to}>
                    <a
                      href={to}
                      className="group flex items-center gap-2 transition-colors duration-200 hover:text-amber-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 transition-all duration-200 group-hover:w-4" />
                      {label}
                    </a>
                  </li>
                ) : (
                  <li key={to}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2 transition-colors duration-200 hover:text-amber-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 transition-all duration-200 group-hover:w-4" />
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>

                <span className="leading-relaxed">{location}</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>

                <span>{email}</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>

                <span>{phone}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white">
              Opening Hours
            </h3>

            <div className="rounded-3xl border border-amber-300/15 bg-white/[0.04] p-5 shadow-lg backdrop-blur-sm">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span>Monday - Friday</span>
                  <span className="font-bold text-amber-300">
                    {hoursWeekday}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Saturday</span>
                  <span className="font-bold text-amber-300">
                    {hoursSaturday}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span>Sunday</span>
                  <span className="font-bold text-amber-300">
                    {hoursSunday}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-amber-500/10 px-4 py-3">
                <p className="text-xs font-bold leading-relaxed text-amber-100/75">
                  Order online, choose your favorite drink, and enjoy a faster
                  checkout experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-amber-100/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-amber-100/45 sm:text-left">
            &copy; {new Date().getFullYear()} {siteName}. Crafted with care for
            coffee lovers. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {[
              {
                label: 'Facebook',
                path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
              },
              {
                label: 'Instagram',
                path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
              },
              {
                label: 'X',
                path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z',
              },
            ].map(({ label, path }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/15 bg-white/5 text-amber-100/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-500 hover:text-[#24160f]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}