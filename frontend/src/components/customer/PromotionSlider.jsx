import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../../context/CartContext.jsx'
import { resolvePromotionForSize } from '../../utils/promotion.js'
import Loader from '../shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

function imgUrl(image) {
  if (!image) return 'https://placehold.co/600x600?text=No+Image'
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

function promoLabel(promotion) {
  if (!promotion) return null

  switch (promotion.type) {
    case 'percentage':
      return `${parseFloat(promotion.value)}% OFF`
    case 'fixed_amount':
      return `$${promotion.value} OFF`
    case 'buy_x_get_y':
      return `Buy ${promotion.buy_qty} Get ${promotion.free_qty}`
    case 'combo':
      return 'Combo Deal'
    default:
      return 'Promo'
  }
}

export default function PromotionSlider({ products: propProducts }) {
  const { addItem } = useCart()
  const [current, setCurrent] = useState(0)
  const [fetched, setFetched] = useState([])
  const [loading, setLoading] = useState(!propProducts)
  const [addedSlideId, setAddedSlideId] = useState(null)

  const products = (propProducts ?? fetched).filter((p) => p.promotion)

  useEffect(() => {
    if (propProducts) return

    fetch(`${API_URL}/products?per_page=200`)
      .then((r) => r.json())
      .then((json) => {
        const list = json.data ?? json
        const filtered = (Array.isArray(list) ? list : []).filter((p) => p.promotion)

        setFetched(filtered)
        setLoading(false)
      })
      .catch(() => {
        setFetched([])
        setLoading(false)
      })
  }, [propProducts])

  const total = products.length

  const goTo = useCallback(
    (index) => {
      if (total === 0) return
      setCurrent((index + total) % total)
    },
    [total]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    if (total <= 1) return

    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  if (loading) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a0f0a] via-[#2a1710] to-[#0f0805] border border-amber-500/20 shadow-2xl">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-700/20 rounded-full blur-3xl" />

          <div className="relative h-[420px] sm:h-[480px] flex items-center justify-center">
            <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl px-8 py-7 shadow-xl">
              <Loader page={false} text="Loading promotions..." />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (total === 0) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a0f0a] via-[#2a1710] to-[#0f0805] border border-amber-500/20 shadow-2xl">
          <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-700/20 rounded-full blur-3xl" />

          <div className="relative h-[420px] sm:h-[480px] flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/10 border border-amber-400/20 flex items-center justify-center mb-5 shadow-xl">
                <svg
                  className="w-14 h-14 text-amber-300 stroke-[1.5]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-extrabold text-amber-100 mb-2">
                No promotions available
              </h3>

              <p className="text-amber-200/70">
                Check back later for exciting coffee offers!
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function handleAdd(p, slidePrice) {
    const item = {
      ...p,
      promotion: resolvePromotionForSize(p.promotion, p.sizes?.[0]?.id),
      size: p.sizes?.[0]?.name || '',
      sugar: p.sugar_levels?.[0]?.name || '',
      ice: p.ice_levels?.[0]?.name || '',
      addOn: '',
      unitPrice: Number(slidePrice),
      qty: 1,
    }

    addItem(p, item)
    setAddedSlideId(p.id)
    setTimeout(() => setAddedSlideId(null), 1200)
  }

  const featured = products[current]
  const featuredPrice = Number(featured.sizes?.[0]?.pivot?.price ?? 0)
  const avatars = products.slice(0, 4)

  const visibleCards = Array.from({ length: Math.min(3, total) }, (_, k) => {
    const index = (current + k) % total
    return { product: products[index], index }
  })

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#160c07] via-[#2b1710] to-[#0d0704] border border-amber-500/20 shadow-[0_30px_90px_rgba(30,12,3,0.45)]">
        {/* Dark Coffee Background Decoration */}
        <div className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 bg-orange-800/30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 right-0 hidden lg:block w-1/2 h-full -translate-y-1/2 bg-gradient-to-l from-amber-900/20 to-transparent" />

        {/* Decorative Coffee Beans */}
        <div className="pointer-events-none absolute top-8 right-8 hidden md:flex gap-3 opacity-40">
          <span className="w-5 h-8 bg-amber-900 rounded-full rotate-12 border border-amber-500/30" />
          <span className="w-5 h-8 bg-amber-700 rounded-full -rotate-12 border border-amber-400/30" />
          <span className="w-5 h-8 bg-orange-900 rounded-full rotate-45 border border-orange-500/30" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6 sm:px-10 md:px-14 py-10 sm:py-14">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {featured.promotion && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-5">
                {featured.promotion.name && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-[#2b1710] text-[11px] font-extrabold tracking-wide shadow-lg shadow-amber-900/30">
                    {featured.promotion.name}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-amber-200 border border-amber-300/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {promoLabel(featured.promotion)}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
              Dark Coffee
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-500">
                Special Offers
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-amber-100/70 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {featured.description ||
                'Enjoy rich coffee flavor with special promotions made for every coffee lover.'}
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => handleAdd(featured, featuredPrice)}
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-extrabold transition-all duration-300 active:scale-95 shadow-xl ${
                  addedSlideId === featured.id
                    ? 'bg-emerald-500 text-white shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#241107] shadow-amber-950/40'
                }`}
              >
                {addedSlideId === featured.id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Added</span>
                  </>
                ) : (
                  <span>Order Now</span>
                )}
              </button>

              <a
                href="/promotion"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-extrabold text-amber-100 border border-amber-300/30 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 active:scale-95"
              >
                View Offers
              </a>
            </div>

            {/* Customer Avatars */}
            <div className="mt-7 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-3">
                {avatars.map((p) => (
                  <img
                    key={p.id}
                    src={imgUrl(p.image)}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-[#2b1710] object-cover shadow-md"
                  />
                ))}

                <span className="w-10 h-10 rounded-full border-2 border-[#2b1710] bg-amber-500 text-[#241107] text-[10px] font-black flex items-center justify-center">
                  +40
                </span>
              </div>

              <p className="text-xs text-amber-100/60 font-medium">
                Happy customers recommend us!
              </p>
            </div>

            {/* Promotion Cards */}
            <div className="mt-9">
              <h3 className="text-sm font-extrabold text-amber-100 mb-3">
                On Promotion
              </h3>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                {visibleCards.map(({ product: p, index: i }) => {
                  const price = Number(p.sizes?.[0]?.pivot?.price ?? 0)

                  return (
                    <button
                      key={p.id}
                      onClick={() => goTo(i)}
                      className={`text-left rounded-2xl p-2 transition-all duration-300 active:scale-95 bg-white/8 backdrop-blur-md border ${
                        i === current
                          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-950/30'
                          : 'border-white/10 hover:border-amber-300/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#32190f] mb-2">
                        <img
                          src={imgUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

                        {p.promotion && (
                          <span className="absolute top-1.5 left-1.5 bg-amber-400 text-[#2b1710] text-[8px] font-black px-2 py-0.5 rounded-full">
                            {promoLabel(p.promotion)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-extrabold text-amber-50 line-clamp-1">
                        {p.name}
                      </p>

                      {p.promotion?.name && (
                        <p className="text-[9px] font-medium text-amber-100/50 line-clamp-1">
                          {p.promotion.name}
                        </p>
                      )}

                      <p className="text-[11px] font-black text-amber-300">
                        ${price.toFixed(2)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Featured Image */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-orange-950/70 border border-amber-500/20" />

            <div className="relative w-full max-w-md">
              <div className="relative rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
                <img
                  key={featured.id}
                  src={imgUrl(featured.image)}
                  alt={featured.name}
                  className="relative z-10 w-full h-[260px] sm:h-[360px] object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)] transition-opacity duration-500"
                />

                {/* Floating Price Tag */}
                <div className="absolute bottom-5 right-5 z-20 bg-[#1b0d07]/90 border border-amber-400/30 backdrop-blur-xl rounded-2xl shadow-2xl px-5 py-4 text-center">
                  <p className="text-[10px] font-semibold text-amber-100/60 line-clamp-1 max-w-[130px]">
                    {featured.name}
                  </p>

                  <p className="text-2xl font-black text-amber-300">
                    ${featuredPrice.toFixed(2)}
                  </p>
                </div>

                {/* Small Badge */}
                <div className="absolute top-5 left-5 z-20 bg-amber-400 text-[#2b1710] rounded-full px-4 py-2 text-xs font-black shadow-lg">
                  Best Deal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? 'w-8 h-2.5 bg-amber-400'
                    : 'w-2.5 h-2.5 bg-amber-200/30 hover:bg-amber-200/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
