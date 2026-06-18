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

  // Only ever show products that have an active promotion
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

  const goTo = useCallback((index) => {
    if (total === 0) return
    setCurrent((index + total) % total)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, total])

  if (loading) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="bg-[#f7efe6] rounded-3xl shadow-sm overflow-hidden">
          <div className="h-[420px] sm:h-[480px] flex items-center justify-center">
            <Loader page={false} text="Loading promotions..." />
          </div>
        </div>
      </section>
    )
  }

  if (total === 0) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="bg-[#f7efe6] rounded-3xl shadow-sm overflow-hidden">
          <div className="h-[420px] sm:h-[480px] flex items-center justify-center">
            <div className="text-center px-4">
              <svg className="w-20 h-20 mx-auto text-[#c9b29a] mb-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-[#5b3a29] mb-2">No promotions available</h3>
              <p className="text-[#8a715c]">Check back later for exciting offers!</p>
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

  // A sliding window of 3 promo products starting at the current slide
  const visibleCards = Array.from({ length: Math.min(3, total) }, (_, k) => {
    const index = (current + k) % total
    return { product: products[index], index }
  })

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
      <div className="relative overflow-hidden rounded-3xl bg-[#f7efe6] shadow-sm">
        {/* Soft decorative blob on the right */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-white/40 rounded-l-[40%] hidden lg:block" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-6 sm:px-10 md:px-14 py-10 sm:py-12">
          {/* Left — text content */}
          <div className="text-center lg:text-left">
            {featured.promotion && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                {featured.promotion.name && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5b3a29] text-white text-[11px] font-bold tracking-wide">
                    {featured.promotion.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5b3a29]/10 text-[#5b3a29] text-[11px] font-bold uppercase tracking-wider">
                  {promoLabel(featured.promotion)}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#3d2817]">
              Awaken Your Senses
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#7a6450] max-w-md mx-auto lg:mx-0 leading-relaxed">
              {featured.description ||
                'Because life is too short for bland coffee. Our brews are an invitation to taste, to feel, to savor.'}
            </p>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => handleAdd(featured, featuredPrice)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 active:scale-95 shadow-md ${
                  addedSlideId === featured.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#5b3a29] hover:bg-[#4a2f20] text-white'
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-[#5b3a29] border border-[#5b3a29]/30 hover:bg-[#5b3a29]/5 transition-all duration-300 active:scale-95"
              >
                View Offers
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-3">
                {avatars.map((p) => (
                  <img
                    key={p.id}
                    src={imgUrl(p.image)}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-[#f7efe6] object-cover"
                  />
                ))}
                <span className="w-9 h-9 rounded-full border-2 border-[#f7efe6] bg-[#5b3a29] text-white text-[10px] font-bold flex items-center justify-center">
                  +40
                </span>
              </div>
              <p className="text-xs text-[#7a6450] font-medium">Happy customers recommends us!</p>
            </div>

            {/* Promotion product cards (sliding window of 3) */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-[#3d2817] mb-3">On Promotion</h3>
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                {visibleCards.map(({ product: p, index: i }) => {
                  const price = Number(p.sizes?.[0]?.pivot?.price ?? 0)
                  return (
                    <button
                      key={p.id}
                      onClick={() => goTo(i)}
                      className={`text-left bg-white rounded-2xl p-2 transition-all duration-300 active:scale-95 ${
                        i === current ? 'ring-2 ring-[#5b3a29] shadow-md' : 'hover:shadow-md border border-black/5'
                      }`}
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f1e7db] mb-2">
                        <img src={imgUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                        {p.promotion && (
                          <span className="absolute top-1 left-1 bg-[#5b3a29] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                            {promoLabel(p.promotion)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-[#3d2817] line-clamp-1">{p.name}</p>
                      {p.promotion?.name && (
                        <p className="text-[9px] font-medium text-[#7a6450] line-clamp-1">{p.promotion.name}</p>
                      )}
                      <p className="text-[10px] font-semibold text-[#a07d2e]">${price.toFixed(2)}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right — featured product image */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#e9d8c5] blur-2xl opacity-70" />
            <div className="relative w-full max-w-md">
              <img
                key={featured.id}
                src={imgUrl(featured.image)}
                alt={featured.name}
                className="relative z-10 w-full h-[260px] sm:h-[360px] object-contain drop-shadow-2xl transition-opacity duration-500"
              />
              {/* Floating price tag */}
              <div className="absolute bottom-2 right-2 sm:right-6 z-20 bg-white rounded-2xl shadow-lg px-4 py-3 text-center">
                <p className="text-[10px] font-semibold text-[#7a6450] line-clamp-1 max-w-[120px]">{featured.name}</p>
                <p className="text-lg font-extrabold text-[#5b3a29]">${featuredPrice.toFixed(2)}</p>
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
                  i === current ? 'w-7 h-2 bg-[#5b3a29]' : 'w-2 h-2 bg-[#5b3a29]/30 hover:bg-[#5b3a29]/50'
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
