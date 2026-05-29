import { useState, useEffect, useCallback } from 'react'
import { useCart } from '../../context/CartContext.jsx'
import promotedProducts from '../../data/promotedProducts.js'

const colors = ['orange', 'red', 'green']

export default function PromotionSlider() {
  const { addItem } = useCart()
  const [current, setCurrent] = useState(0)

  const total = promotedProducts.length

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

  if (total === 0) return null

  const color = colors[current % colors.length]
  const product = promotedProducts[current]
  const price = product.sizes?.[0]?.pivot?.price ?? 0
  const originalPrice = (price * 2).toFixed(2)

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

  const badgeColors = { orange: 'bg-orange-500', red: 'bg-red-500', green: 'bg-green-500' }
  const btnColors = { orange: 'bg-orange-500 hover:bg-orange-600', red: 'bg-red-500 hover:bg-red-600', green: 'bg-green-500 hover:bg-green-600' }
  const priceColors = { orange: 'text-orange-500', red: 'text-red-500', green: 'text-green-500' }

  return (
    <section className="relative w-full max-w-7xl mx-auto mt-10 overflow-hidden rounded-3xl shadow-2xl">
      <div
        id="slider"
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {promotedProducts.map((p, i) => {
          const slideColor = colors[i % colors.length]
          const slidePrice = p.sizes?.[0]?.pivot?.price ?? 0
          const slideOriginal = (slidePrice * 2).toFixed(2)

          return (
            <div key={p.id} className="min-w-full relative">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                className="w-full h-[600px] object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-black/50" />

              <div className="absolute inset-0 flex items-center justify-between px-16">
                {/* Left Text */}
                <div className="text-white max-w-xl">
                  <span className={`${badgeColors[slideColor]} px-4 py-1 rounded-full text-sm font-semibold`}>
                    {slideColor === 'orange' ? 'HOT PROMOTION' : slideColor === 'red' ? 'LIMITED OFFER' : 'FREE DELIVERY'}
                  </span>

                  <h1 className="text-6xl font-bold mt-5 leading-tight">
                    {p.deal ? (
                      <>
                        Buy 3<br />Get 1 Free
                      </>
                    ) : (
                      <>
                        Special<br />Offers
                      </>
                    )}
                  </h1>

                  <p className="mt-5 text-lg text-gray-200">
                    {p.deal ? `Order 3 cups and get the 4th one free!` : 'Don\'t miss out on these amazing deals!'}
                  </p>

                  <a
                    href="/promotion"
                    className={`mt-8 inline-block ${btnColors[slideColor]} transition px-8 py-4 rounded-full font-semibold text-lg`}
                  >
                    Order Now
                  </a>
                </div>

                {/* Product Card */}
                <div className="hidden md:block bg-white rounded-xl shadow-2xl p-4 w-[320px]">
                  <div className="relative">
                    {p.deal && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                          {p.deal.label}
                        </span>
                      </div>
                    )}
                    <img
                      src={p.image}
                      className="w-full h-52 object-cover rounded-xl"
                      alt={p.name}
                    />
                  </div>

                  <div className="mt-5">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {p.name}
                    </h2>

                    <p className="text-gray-500 mt-2">
                      {p.description}
                    </p>

                    <div className="flex items-center justify-between mt-5">
                      <div>
                        <span className={`text-3xl font-bold ${priceColors[slideColor]}`}>
                          ${slidePrice.toFixed(2)}
                        </span>
                        <span className="line-through text-gray-400 ml-2">
                          ${slideOriginal}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const item = {
                            ...p,
                            size: p.sizes?.[0]?.name || '',
                            sugar: p.sugar_levels?.[0]?.name || '',
                            ice: p.ice_levels?.[0]?.name || '',
                            addOn: '',
                            unitPrice: slidePrice,
                            qty: 1,
                          }
                          addItem(p, item)
                        }}
                        className={`${btnColors[slideColor]} text-white px-5 py-3 rounded-xl transition`}
                      >
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

      {/* Prev */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-5 -translate-y-1/2 bg-white/70 hover:bg-white w-12 h-12 rounded-full shadow-lg text-2xl flex items-center justify-center text-gray-800"
      >
        ❮
      </button>

      {/* Next */}
      <button
        onClick={next}
        className="absolute top-1/2 right-5 -translate-y-1/2 bg-white/70 hover:bg-white w-12 h-12 rounded-full shadow-lg text-2xl flex items-center justify-center text-gray-800"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {promotedProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
