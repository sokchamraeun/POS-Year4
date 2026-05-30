import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../../context/CartContext.jsx'

const API_URL = import.meta.env.VITE_API_URL
const colors = ['orange', 'red', 'green']

export default function PromotionSlider({ products: propProducts }) {
  const { addItem } = useCart()
  const [current, setCurrent] = useState(0)
  const [fetched, setFetched] = useState([])
  const [loading, setLoading] = useState(true)

  const products = propProducts ?? fetched

  useEffect(() => {
    if (propProducts) {
      setLoading(false)
      return
    }
    setLoading(true)
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="animate-pulse">
            <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading promotions...</p>
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
            <div className="text-center px-4">
              <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No promotions available</h3>
              <p className="text-gray-500">Check back later for exciting offers!</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const color = colors[current % colors.length]
  const product = products[current]
  const price = Number(product.sizes?.[0]?.pivot?.price ?? 0)

  function handleAdd() {
    const item = {
      ...product,
      size: product.sizes?.[0]?.name || '',
      sugar: product.sugar_levels?.[0]?.name || '',
      ice: product.ice_levels?.[0]?.name || '',
      addOn: '',
      unitPrice: price,
      qty: 1,
    }
    addItem(product, item)
  }

  const badgeColors = { 
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600', 
    red: 'bg-gradient-to-r from-red-500 to-red-600', 
    green: 'bg-gradient-to-r from-green-500 to-green-600' 
  }
  
  const btnColors = { 
    orange: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700', 
    red: 'bg-red-500 hover:bg-red-600 active:bg-red-700', 
    green: 'bg-green-500 hover:bg-green-600 active:bg-green-700' 
  }
  
  const priceColors = { 
    orange: 'text-orange-500', 
    red: 'text-red-500', 
    green: 'text-green-500' 
  }

  const promoNames = ['🔥 HOT PROMOTION', '⚡ LIMITED OFFER', '🚚 FREE DELIVERY']

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-6 sm:mt-10 px-2 sm:px-4">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
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
                <div className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px]">
                  <img
                    src={p.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={p.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8">
                  {/* Left Side - Text Content */}
                  <div className="text-white text-center lg:text-left max-w-2xl lg:max-w-xl mb-6 lg:mb-0">
                    <span className={`${badgeColors[slideColor]} inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg mb-4 sm:mb-6`}>
                      {promoNames[i % promoNames.length]}
                    </span>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-3 sm:mt-5 leading-tight">
                      Special Offers
                    </h1>

                    <p className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-gray-200 max-w-md mx-auto lg:mx-0">
                      Don't miss out on these amazing deals!
                    </p>

                    <a
                      href="/promotion"
                      className={`mt-6 sm:mt-8 inline-flex items-center gap-2 ${btnColors[slideColor]} transition-all transform hover:scale-105 active:scale-95 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg shadow-lg`}
                    >
                      Order Now
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>

                  {/* Right Side - Product Card */}
                  {/* Mobile version (simplified) */}
                  <div className="block lg:hidden w-full max-w-[260px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3">
                    <div className="relative">
                      {/* Promotion Badge */}
                      {p.promotion && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md transform -rotate-6 whitespace-nowrap">
                            {p.promotion.type === 'percentage' 
                              ? `${parseFloat(p.promotion.value)}% OFF`
                              : p.promotion.type === 'buy_x_get_y'
                                ? `${p.promotion.buy_qty}+${p.promotion.free_qty}`
                                : 'PROMO'}
                          </div>
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <img
                        src={p.image}
                        className="w-full h-32 object-cover rounded-lg"
                        alt={p.name}
                      />
                    </div>

                    <div className="mt-2">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {p.name}
                      </h3>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-lg font-bold ${priceColors[slideColor]}`}>
                          ${slidePrice.toFixed(2)}
                        </span>

                        <button
                          onClick={() => {
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
                          }}
                          className={`${btnColors[slideColor]} text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop/Tablet version (full details) */}
                  <div className="hidden lg:block w-full sm:w-auto bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 max-w-[280px] sm:max-w-[320px] md:max-w-[350px] transition-all hover:shadow-3xl">
                    <div className="relative">
                      {/* Promotion Badge */}
                      {p.promotion && (
                        <div className="absolute -top-2 -left-2 z-10">
                          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg transform -rotate-6">
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
                      <div className="relative overflow-hidden rounded-lg sm:rounded-xl">
                        <img
                          src={p.image}
                          className="w-full h-40 sm:h-48 md:h-52 object-cover rounded-lg sm:rounded-xl transition-transform duration-300 hover:scale-105"
                          alt={p.name}
                        />
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-5">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 line-clamp-1">
                        {p.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex items-center justify-between mt-4 sm:mt-5">
                        <div>
                          <span className={`text-2xl sm:text-3xl font-bold ${priceColors[slideColor]}`}>
                            ${slidePrice.toFixed(2)}
                          </span>
                          {p.original_price && (
                            <span className="ml-2 text-xs sm:text-sm text-gray-400 line-through">
                              ${p.original_price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
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
                          }}
                          className={`${btnColors[slideColor]} text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-md`}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                          </svg>
                          Add Cart
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
          className="absolute top-1/2 left-2 sm:left-4 md:left-5 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full shadow-lg text-xl sm:text-2xl flex items-center justify-center text-gray-800 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 z-10"
          aria-label="Previous slide"
        >
          ❮
        </button>

        <button
          onClick={next}
          className="absolute top-1/2 right-2 sm:right-4 md:right-5 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full shadow-lg text-xl sm:text-2xl flex items-center justify-center text-gray-800 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 z-10"
          aria-label="Next slide"
        >
          ❯
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 ${
                i === current 
                  ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-white shadow-lg' 
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              } rounded-full`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}