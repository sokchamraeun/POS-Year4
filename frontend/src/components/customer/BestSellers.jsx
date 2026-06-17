import { useRef, useState } from 'react'
import { useCart } from '../../context/CartContext.jsx'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

// Soft pastel card themes, rotated across the feature cards.
const themes = [
  { card: 'from-emerald-50 to-teal-50', blob: 'bg-emerald-200/40', price: 'text-emerald-600', link: 'text-emerald-600 hover:text-emerald-700' },
  { card: 'from-rose-50 to-pink-50', blob: 'bg-rose-200/40', price: 'text-rose-500', link: 'text-rose-500 hover:text-rose-600' },
  { card: 'from-amber-50 to-orange-50', blob: 'bg-amber-200/40', price: 'text-amber-600', link: 'text-amber-600 hover:text-amber-700' },
  { card: 'from-blue-50 to-cyan-50', blob: 'bg-blue-200/40', price: 'text-blue-600', link: 'text-blue-600 hover:text-blue-700' },
]

function resolveImage(image) {
  if (!image) return 'https://placehold.co/400x400?text=No+Image'
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function BestSellers({ products = [] }) {
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState(null)
  const scrollRef = useRef(null)

  // Show products marked as "Best Seller" in the dashboard. If none are
  // flagged yet, fall back to the first products so the section isn't empty.
  const flagged = products.filter((p) => p.is_featured)
  const featured = (flagged.length > 0 ? flagged : products).slice(0, 10)

  if (featured.length === 0) return null

  function handleAdd(p, price) {
    addItem(p, {
      ...p,
      size: p.sizes?.[0]?.name || '',
      sugar: p.sugar_levels?.[0]?.name || '',
      ice: p.ice_levels?.[0]?.name || '',
      addOn: '',
      unitPrice: Number(price),
      qty: 1,
    })
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  function scrollBy(direction) {
    const el = scrollRef.current
    if (!el) return
    // Scroll by roughly one card width so cards land nicely.
    const amount = Math.min(el.clientWidth * 0.9, 340) * direction
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Heading + arrows */}
      <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
        <div className="text-center sm:text-left flex-1 sm:flex-none">
          <span className="inline-block text-sm font-semibold tracking-wide text-cyan-600 mb-1">
            Best Sellers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
            <span>Featured Products</span>
            <span className="w-1.5 h-7 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-full"></span>
          </h2>
        </div>

        {/* Scroll arrows */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-300 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-300 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal scroller */}
      <div
        ref={scrollRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-2"
      >
        {featured.map((p, i) => {
          const theme = themes[i % themes.length]
          const price = Number(p.sizes?.[0]?.pivot?.price ?? 0)
          const isAdded = addedId === p.id

          return (
            <div
              key={p.id}
              className={`group relative shrink-0 snap-start w-[280px] sm:w-[320px] overflow-hidden rounded-3xl bg-gradient-to-br ${theme.card} border border-white shadow-sm hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Decorative blob */}
              <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl ${theme.blob}`} />

              <div className="relative flex items-center justify-between gap-3 p-5 sm:p-6">
                {/* Left: info */}
                <div className="flex flex-col min-w-0">
                  <span className={`text-xl sm:text-2xl font-extrabold ${theme.price}`}>
                    ${price.toFixed(2)}
                  </span>
                  <h3 className="mt-1 text-lg sm:text-xl font-extrabold text-slate-800 line-clamp-1">
                    {p.name}
                  </h3>
                  <button
                    onClick={() => handleAdd(p, price)}
                    className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 ${
                      isAdded ? 'text-emerald-600' : theme.link
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <span>Added</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Shop Now</span>
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Right: image + rating */}
                <div className="relative shrink-0">
                  <img
                    src={resolveImage(p.image)}
                    alt={p.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[11px] font-bold text-amber-500 px-2 py-0.5 rounded-full shadow-sm ring-1 ring-black/5">
                    <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.05 2.927c.3-.921 1.6-.921 1.9 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                    {(p.rating ?? 4.5).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
