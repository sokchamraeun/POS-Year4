import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../../context/CartContext.jsx'

const API_URL = import.meta.env.VITE_API_URL
const colors = ['orange', 'red', 'green']

export default function PromotionSlider({ products: propProducts }) {
  const { addItem } = useCart()
  const [current, setCurrent] = useState(0)
  const [fetched, setFetched] = useState([])
  const [loading, setLoading] = useState(!propProducts)
  const [addedSlideId, setAddedSlideId] = useState(null)

  const products = propProducts ?? fetched

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
    setCurrent((index + total) % total)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, total])

  // Loading state
  if (loading) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="animate-pulse">
            <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Loading promotions...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (total === 0) {
    return (
      <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-4">
        <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
            <div className="text-center px-4">
              <svg className="w-20 h-20 mx-auto text-slate-300 mb-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No promotions available</h3>
              <p className="text-slate-500">Check back later for exciting offers!</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function handleAdd(p, slidePrice) {
    const item = {
      ...p,
      size: p.sizes?.[0]?.name || '',
      sugar: p.sugar_levels?.[0]?.name || '',
      ice: p.ice_levels?.[0]?.name || '',
      addOn: '',
      unitPrice: Number(slidePrice),
      qty: 1,
    }
    addItem(p, item)
    setAddedSlideId(p.id)
    setTimeout(() => {
      setAddedSlideId(null)
    }, 1200)
  }

  const badgeColors = { 
    orange: 'bg-linear-to-r from-orange-500 to-amber-600', 
    red: 'bg-linear-to-r from-rose-500 to-red-600', 
    green: 'bg-linear-to-r from-emerald-500 to-teal-600' 
  }
  
  const btnColors = { 
    orange: 'bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 shadow-md shadow-orange-500/10', 
    red: 'bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 active:scale-95 shadow-md shadow-rose-500/10', 
    green: 'bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 shadow-md shadow-emerald-500/10' 
  }
  
  const priceColors = { 
    orange: 'text-amber-500', 
    red: 'text-rose-500', 
    green: 'text-emerald-500' 
  }

  const promoNames = ['🔥 HOT PROMOTION', '⚡ LIMITED OFFER', '🚚 FREE DELIVERY']

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
      <div className="relative bg-linear-to-br from-slate-950 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Slider Container */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {products.map((p, i) => {
            const slideColor = colors[i % colors.length]
            const slidePrice = Number(p.sizes?.[0]?.pivot?.price ?? 0)

            return (
              <div key={p.id} className="min-w-full relative">
                {/* Background Image with better scaling */}
                <div className="relative h-[480px] sm:h-[520px] md:h-[580px] lg:h-[620px]">
                  <img
                    src={p.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 select-none"
                    alt={p.name}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/65 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 md:px-16 lg:px-20 py-8 sm:py-10">
                  {/* Left Side - Text Content */}
                  <div className="text-white text-center lg:text-left max-w-2xl lg:max-w-xl mb-6 lg:mb-0 flex flex-col items-center lg:items-start">
                    <span className={`${badgeColors[slideColor]} inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-lg mb-4 sm:mb-6 select-none tracking-wider uppercase backdrop-blur-xs`}>
                      <span>{promoNames[i % promoNames.length]}</span>
                      {p.promotion && (
                        <span className="w-1 h-3 bg-white/40 rounded-full"></span>
                      )}
                      {p.promotion && (
                        <span>
                          {p.promotion.type === 'percentage' && `${parseFloat(p.promotion.value)}% OFF`}
                          {p.promotion.type === 'fixed_amount' && `$${p.promotion.value} OFF`}
                          {p.promotion.type === 'buy_x_get_y' && `Buy ${p.promotion.buy_qty} Get ${p.promotion.free_qty}`}
                          {p.promotion.type === 'combo' && 'COMBO'}
                        </span>
                      )}
                    </span>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md line-clamp-2">
                      {p.name}
                    </h1>

                    <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-200/90 max-w-md line-clamp-2 leading-relaxed">
                      {p.description || "Don't miss out on this amazing promo deal!"}
                    </p>

                    <a
                      href="/promotion"
                      className={`mt-6 sm:mt-8 inline-flex items-center gap-2 ${btnColors[slideColor]} transition-all duration-300 hover:scale-105 active:scale-95 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg`}
                    >
                      <span>Explore Offers</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>

                  {/* Right Side - Product Card Overlay */}
                  {/* Mobile version (simplified) */}
                  <div className="block lg:hidden w-full max-w-[260px] bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-3">
                    <div className="relative overflow-hidden rounded-xl bg-slate-50 aspect-4/3 mb-2.5">
                      {/* Promotion Badge */}
                      {p.promotion && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className="bg-linear-to-r from-orange-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                            {p.promotion.type === 'percentage' 
                              ? `${parseFloat(p.promotion.value)}% OFF`
                              : p.promotion.type === 'buy_x_get_y'
                                ? `Buy ${p.promotion.buy_qty} Get ${p.promotion.free_qty}`
                                : 'PROMO'}
                          </div>
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <img
                        src={`${p.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${p.image}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        alt={p.name}
                      />
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                        {p.name}
                      </h3>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/60">
                        <span className={`text-sm sm:text-base font-extrabold ${priceColors[slideColor]}`}>
                          ${slidePrice.toFixed(2)}
                        </span>

                        <button
                          onClick={() => handleAdd(p, slidePrice)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 active:scale-95 flex items-center gap-1 ${
                            addedSlideId === p.id
                              ? 'bg-emerald-500 text-white'
                              : `${btnColors[slideColor]} text-white`
                          }`}
                        >
                          {addedSlideId === p.id ? (
                            <>
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet version (full details) */}
                  <div className="hidden lg:block bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-5 sm:p-6 w-full sm:w-auto max-w-[280px] sm:max-w-[320px] transition-all hover:bg-white/15 duration-300 shadow-2xl">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-50 aspect-4/3 mb-4 shadow-inner">
                      {/* Promotion Badge */}
                      {p.promotion && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-linear-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                            {p.promotion.type === 'buy_x_get_y'
                              ? `Buy ${p.promotion.buy_qty} Get ${p.promotion.free_qty} Free`
                              : p.promotion.type === 'percentage'
                                ? `${parseFloat(p.promotion.value)}% OFF`
                                : p.promotion.type === 'fixed_amount'
                                  ? `$${p.promotion.value} OFF`
                                  : p.promotion.type === 'combo'
                                    ? '🎯 Combo Deal'
                                    : '🎉 Promo'}
                          </div>
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <img
                        src={`${p.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${p.image}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        alt={p.name}
                      />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                        {p.name}
                      </h3>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed min-h-8">
                        {p.description || 'Delicately crafted beverage made from selected premium ingredients.'}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/15">
                        <div className="flex flex-col">
                          {p.original_price && (
                            <span className="text-xs text-white/50 line-through mb-0.5">
                              ${p.original_price}
                            </span>
                          )}
                          <span className={`text-xl sm:text-2xl font-extrabold ${priceColors[slideColor]}`}>
                            ${slidePrice.toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAdd(p, slidePrice)}
                          className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg ${
                            addedSlideId === p.id
                              ? 'bg-emerald-500 text-white shadow-emerald-100 scale-105'
                              : `${btnColors[slideColor]} text-white`
                          }`}
                        >
                          {addedSlideId === p.id ? (
                            <>
                              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                              </svg>
                              <span>Add Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Arrows - Touch friendly */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 z-10 hover:scale-105"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={next}
          className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 backdrop-blur-md w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 z-10 hover:scale-105"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current 
                  ? 'w-8 h-2 bg-white shadow-lg' 
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}