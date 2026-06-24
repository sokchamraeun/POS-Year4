import { useEffect, useRef, useState } from 'react'
import { Gift } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { calcFinalPrice, getPromotionShort, resolvePromotionForSize } from '../../utils/promotion.js'
import ProductModal from './ProductModal.jsx'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

const themes = [
  {
    card: 'from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4]',
    glow: 'bg-teal-300/40',
    accent: 'text-teal-700',
    button: 'from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
    ring: 'border-teal-400/60',
  },
  {
    card: 'from-[#fff1f2] via-[#fff7f7] to-[#ffe4e6]',
    glow: 'bg-rose-300/40',
    accent: 'text-rose-600',
    button: 'from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600',
    ring: 'border-rose-400/60',
  },
  {
    card: 'from-[#ecfdf5] via-[#f0fdfa] to-[#ccfbf1]',
    glow: 'bg-teal-300/40',
    accent: 'text-teal-600',
    button: 'from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700',
    ring: 'border-teal-400/60',
  },
  {
    card: 'from-[#eff6ff] via-[#f8fafc] to-[#dbeafe]',
    glow: 'bg-blue-300/40',
    accent: 'text-blue-600',
    button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    ring: 'border-blue-400/60',
  },
]

const cycleStyles = [
  { variant: 'triple' },
  { variant: 'orbit' },
  { variant: 'arc' },
  { variant: 'halo' },
]

function resolveImage(image) {
  if (!image) return 'https://placehold.co/500x500?text=No+Image'
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

function ProductCycleImage({ product, theme, cycle }) {
  if (cycle.variant === 'orbit') {
    return (
      <div className="relative shrink-0">
        <div className={`absolute inset-0 ${theme.glow} rounded-full blur-2xl cycle-pulse`}></div>

        <div className="absolute -inset-4 rounded-full border-2 border-white/70 border-t-transparent cycle-slow"></div>

        <div className="absolute -inset-3 cycle-slow">
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-md"></span>
          <span className="absolute bottom-2 right-1 h-2 w-2 rounded-full bg-white/80 shadow-md"></span>
          <span className="absolute bottom-5 left-0 h-1.5 w-1.5 rounded-full bg-white/70 shadow-md"></span>
        </div>

        <div className="absolute -inset-1 rounded-full border-2 border-dashed border-white/80 cycle-reverse"></div>

        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/75 backdrop-blur-sm border border-white shadow-inner flex items-center justify-center overflow-hidden">
          <div className={`absolute inset-4 rounded-full ${theme.glow} blur-xl`}></div>

          <img
            src={resolveImage(product.image)}
            alt={product.name}
            className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl cycle-float transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
      </div>
    )
  }

  if (cycle.variant === 'arc') {
    return (
      <div className="relative shrink-0">
        <div className={`absolute inset-0 ${theme.glow} rounded-full blur-2xl cycle-pulse`}></div>

        <div className={`absolute -inset-4 rounded-full border-[6px] ${theme.ring} border-b-transparent border-l-transparent cycle-slow`}></div>

        <div className={`absolute -inset-2 rounded-full border-[3px] ${theme.ring} border-t-transparent border-r-transparent cycle-reverse`}></div>

        <div className="absolute inset-1 rounded-full border border-white/80 cycle-fast"></div>

        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/75 backdrop-blur-sm border border-white shadow-inner flex items-center justify-center overflow-hidden">
          <div className={`absolute inset-4 rounded-full ${theme.glow} blur-xl`}></div>

          <img
            src={resolveImage(product.image)}
            alt={product.name}
            className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl cycle-float transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
      </div>
    )
  }

  if (cycle.variant === 'halo') {
    return (
      <div className="relative shrink-0">
        <div className={`absolute inset-0 ${theme.glow} rounded-full blur-2xl cycle-pulse`}></div>

        <div className={`absolute -inset-5 rounded-full border ${theme.ring} cycle-halo-one`}></div>
        <div className="absolute -inset-3 rounded-full border-2 border-white/70 cycle-halo-two"></div>
        <div className={`absolute -inset-1 rounded-[2rem] border-2 ${theme.ring} cycle-tilt`}></div>

        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/75 backdrop-blur-sm border border-white shadow-inner flex items-center justify-center overflow-hidden">
          <div className={`absolute inset-4 rounded-full ${theme.glow} blur-xl`}></div>

          <img
            src={resolveImage(product.image)}
            alt={product.name}
            className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl cycle-float transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative shrink-0">
      <div className={`absolute inset-0 ${theme.glow} rounded-full blur-2xl cycle-pulse`}></div>

      <div className={`absolute -inset-4 rounded-full border-[5px] ${theme.ring} border-t-white/90 border-r-white/40 cycle-slow`}></div>

      <div className={`absolute -inset-2 rounded-full border-2 border-dashed ${theme.ring} cycle-reverse`}></div>

      <div className="absolute inset-1 rounded-full border-2 border-dotted border-white/80 cycle-fast"></div>

      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/75 backdrop-blur-sm border border-white shadow-inner flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-4 rounded-full ${theme.glow} blur-xl`}></div>

        <img
          src={resolveImage(product.image)}
          alt={product.name}
          className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl cycle-float transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
        />
      </div>
    </div>
  )
}

export default function BestSellers({ products = [] }) {
  const { addItem } = useCart()
  const [addedId, setAddedId] = useState(null)
  const scrollRef = useRef(null)
  const pausedRef = useRef(false)

  const [modalProduct, setModalProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedSugar, setSelectedSugar] = useState('')
  const [selectedIce, setSelectedIce] = useState('')
  const [sugarNote, setSugarNote] = useState('')
  const [iceNote, setIceNote] = useState('')
  const [selectedAddOn, setSelectedAddOn] = useState('')
  const [modalQty, setModalQty] = useState(1)

  function openModal(p) {
    setModalProduct(p)
    setSelectedSize(p.sizes?.[0]?.name || '')
    setSelectedSugar(p.sugar_levels?.[0]?.name || '')
    setSelectedIce(p.ice_levels?.[0]?.name || '')
    setSugarNote('')
    setIceNote('')
    setSelectedAddOn('')
    setModalQty(1)
  }

  function modalBasePrice(sizeName) {
    const size = modalProduct?.sizes?.find((s) => s.name === sizeName)
    return size ? Number(size.pivot?.price ?? 0) : 0
  }

  function modalAddOnPrice(addOnName) {
    if (!addOnName) return 0

    const addon = modalProduct?.addons?.find((a) => a.name === addOnName)
    if (!addon) return 0

    const size = modalProduct?.sizes?.find((s) => s.name === selectedSize)
    const sizePrice = addon.size_prices?.find((sp) => sp.size_id === size?.id)

    return sizePrice ? Number(sizePrice.price) : Number(addon.price) || 0
  }

  const modalSizeObj = modalProduct?.sizes?.find((s) => s.name === selectedSize)

  const modalPromotion = modalProduct
    ? resolvePromotionForSize(modalProduct.promotion, modalSizeObj?.id)
    : null

  const modalPrice = modalProduct
    ? modalBasePrice(selectedSize) + modalAddOnPrice(selectedAddOn)
    : 0

  const modalFinalPrice = modalProduct
    ? modalPromotion?.type === 'buy_x_get_y'
      ? modalPrice
      : calcFinalPrice(modalPrice, modalPromotion)
    : 0

  const modalHasDiscount = modalPromotion
    ? modalFinalPrice < modalPrice || modalPromotion.type === 'buy_x_get_y'
    : false

  function handleModalAdd() {
    if (!modalProduct) return

    const iceObj = modalProduct.ice_levels?.find((i) => i.name === selectedIce)
    const sugarObj = modalProduct.sugar_levels?.find((s) => s.name === selectedSugar)

    addItem(modalProduct, {
      ...modalProduct,
      promotion: modalPromotion,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      sugarNote: sugarObj?.requires_input ? sugarNote.trim() : '',
      iceNote: iceObj?.requires_input ? iceNote.trim() : '',
      addOn: selectedAddOn,
      unitPrice: modalPrice,
      qty: modalQty,
    })

    setAddedId(modalProduct.id)
    setTimeout(() => setAddedId(null), 1200)
    setModalProduct(null)
  }

  const flagged = products.filter((p) => p.is_featured)
  const featured = (flagged.length > 0 ? flagged : products).slice(0, 10)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || featured.length <= 1) return

    const timer = setInterval(() => {
      if (pausedRef.current) return

      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4

      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const amount = Math.min(el.clientWidth * 0.9, 380)
        el.scrollBy({ left: amount, behavior: 'smooth' })
      }
    }, 3500)

    return () => clearInterval(timer)
  }, [featured.length])

  if (featured.length === 0) return null

  function scrollBy(direction) {
    const el = scrollRef.current
    if (!el) return

    const amount = Math.min(el.clientWidth * 0.9, 380) * direction
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <style>{`
        @keyframes cycleSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes cycleReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes cycleFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.04);
          }
        }

        @keyframes cyclePulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.08);
          }
        }

        @keyframes haloOne {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes haloTwo {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1.08);
          }
          50% {
            opacity: 0.85;
            transform: scale(0.95);
          }
        }

        @keyframes cycleTilt {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.06);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .cycle-slow {
          animation: cycleSlow 9s linear infinite;
        }

        .cycle-reverse {
          animation: cycleReverse 13s linear infinite;
        }

        .cycle-fast {
          animation: cycleSlow 5s linear infinite;
        }

        .cycle-float {
          animation: cycleFloat 3s ease-in-out infinite;
        }

        .cycle-pulse {
          animation: cyclePulse 2.8s ease-in-out infinite;
        }

        .cycle-halo-one {
          animation: haloOne 2.8s ease-in-out infinite;
        }

        .cycle-halo-two {
          animation: haloTwo 3.4s ease-in-out infinite;
        }

        .cycle-tilt {
          animation: cycleTilt 7s linear infinite;
        }
      `}</style>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-teal-50/50 to-white"></div>
      <div className="absolute top-10 left-0 -z-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 -z-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-white border border-[#ccfbf1] px-4 py-1.5 shadow-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>

              <span className="text-xs sm:text-sm font-extrabold tracking-wide text-teal-700 uppercase">
                Best Sellers
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#134e4a] leading-tight">
              Customer Favorite Drinks
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#0d9488] max-w-xl">
              Popular coffee and drinks selected for fast order.
            </p>
          </div>

          {/* Arrows */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="w-11 h-11 rounded-full bg-white border border-[#ccfbf1] text-[#115e59] shadow-sm hover:bg-[#115e59] hover:text-white hover:border-[#115e59] active:scale-95 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="w-11 h-11 rounded-full bg-white border border-[#ccfbf1] text-[#115e59] shadow-sm hover:bg-[#115e59] hover:text-white hover:border-[#115e59] active:scale-95 transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Scroller */}
        <div
          ref={scrollRef}
          onMouseEnter={() => {
            pausedRef.current = true
          }}
          onMouseLeave={() => {
            pausedRef.current = false
          }}
          onTouchStart={() => {
            pausedRef.current = true
          }}
          className="flex gap-5 sm:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-1 pb-4"
        >
          {featured.map((p, i) => {
            const theme = themes[i % themes.length]
            const cycle = cycleStyles[i % cycleStyles.length]
            const firstSize = p.sizes?.[0]
            const basePrice = Number(firstSize?.pivot?.price ?? 0)
            const cardPromo = resolvePromotionForSize(p.promotion, firstSize?.id)

            const finalCardPrice =
              cardPromo?.type === 'buy_x_get_y'
                ? basePrice
                : calcFinalPrice(basePrice, cardPromo)

            const hasCardPromo = cardPromo
              ? finalCardPrice < basePrice || cardPromo.type === 'buy_x_get_y'
              : false

            const isAdded = addedId === p.id

            return (
              <article
                key={p.id}
                onClick={() => openModal(p)}
                className={`group relative shrink-0 snap-start w-[290px] sm:w-[360px] rounded-[2rem] overflow-hidden bg-gradient-to-br ${theme.card} border border-white/80 shadow-[0_10px_30px_rgba(61,40,23,0.08)] hover:shadow-[0_18px_50px_rgba(61,40,23,0.18)] hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
              >
                {/* Promotion Label */}
                {hasCardPromo && (
                  <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full shadow-xl border-2 border-red-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" />
                    {getPromotionShort(cardPromo)}
                  </div>
                )}

                {/* Decorative Glow */}
                <div className={`absolute -top-16 -right-16 w-48 h-48 ${theme.glow} rounded-full blur-3xl`}></div>

                {/* Card Content */}
                <div className="relative p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info */}
                    <div className="min-w-0 flex-1 pt-10 sm:pt-12">
                      <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm border border-white">
                        <svg className="w-3.5 h-3.5 fill-teal-400" viewBox="0 0 20 20">
                          <path d="M9.05 2.927c.3-.921 1.6-.921 1.9 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                        </svg>

                        <span className="text-[11px] font-extrabold text-teal-600">
                          {(p.rating ?? 4.5).toFixed(1)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl sm:text-2xl font-black text-[#134e4a] line-clamp-2 leading-tight">
                        {p.name}
                      </h3>

                      <div className="mt-3 flex items-end gap-2">
                        {hasCardPromo && cardPromo?.type !== 'buy_x_get_y' && (
                          <span className="text-sm font-bold text-[#0d9488] line-through mb-0.5">
                            ${basePrice.toFixed(2)}
                          </span>
                        )}

                        <span className={`text-2xl sm:text-3xl font-black ${theme.accent}`}>
                          ${finalCardPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Different Animated Cycle Image */}
                    <ProductCycleImage product={p} theme={theme} cycle={cycle} />
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="text-xs text-[#0d9488] font-semibold">
                      Tap to customize
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openModal(p)
                      }}
                      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${theme.button} text-white text-xs sm:text-sm font-black px-4 py-2.5 shadow-lg active:scale-95 transition-all duration-200`}
                    >
                      {isAdded ? (
                        <>
                          Added
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Order Now
                          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          show={!!modalProduct}
          onClose={() => setModalProduct(null)}
          selectedSize={selectedSize}
          selectedSugar={selectedSugar}
          selectedIce={selectedIce}
          selectedAddOn={selectedAddOn}
          qty={modalQty}
          price={modalPrice}
          finalPrice={modalFinalPrice}
          hasDiscount={modalHasDiscount}
          stockMsg=""
          onSizeChange={setSelectedSize}
          sugarNote={sugarNote}
          iceNote={iceNote}
          onSugarChange={setSelectedSugar}
          onIceChange={setSelectedIce}
          onSugarNoteChange={setSugarNote}
          onIceNoteChange={setIceNote}
          onAddOnChange={setSelectedAddOn}
          onQtyChange={setModalQty}
          onAddToCart={handleModalAdd}
        />
      )}
    </section>
  )
}