import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const colors = ['orange', 'red', 'green']

const colorConfig = {
  orange: {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-400/20',
    price: 'text-orange-400',
    btn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
    dot: 'bg-orange-500',
    glow: 'bg-orange-500',
  },
  red: {
    badge: 'bg-red-500/20 text-red-300 border-red-400/20',
    price: 'text-red-400',
    btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
    dot: 'bg-red-500',
    glow: 'bg-red-500',
  },
  green: {
    badge: 'bg-green-500/20 text-green-300 border-green-400/20',
    price: 'text-green-400',
    btn: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
    dot: 'bg-green-500',
    glow: 'bg-green-500',
  },
}

export default function HeroSlider() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(`${API_URL}/hero-sliders`)
        const data = await response.json()
        const activeSliders = data.data.filter(s => s.is_active).sort((a, b) => a.order - b.order)
        setSlides(activeSliders)
      } catch (error) {
        console.error('Error fetching hero sliders:', error)
      }
    }
    fetchSliders()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0b1120]">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/20 blur-3xl rounded-full" />

      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const c = colors[i % colors.length]
          const cc = colorConfig[c]
          return (
            <div key={slide.id} className="min-w-full min-h-screen flex items-center">
              <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-10 items-center w-full">
                {/* LEFT */}
                <div className="text-white z-10">
                  <span className={`${cc.badge} border px-5 py-2 rounded-full text-sm font-medium inline-block`}>
                    {slide.badge}
                  </span>

                  <h1 className="text-5xl lg:text-7xl font-black leading-tight mt-6">
                    {slide.title}<br />{slide.highlight}
                  </h1>

                  <p className="text-gray-300 text-lg mt-6 leading-relaxed max-w-xl">
                    {slide.text}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-10">
                    <a
                      href="#products"
                      className={`${cc.btn} px-8 py-4 rounded-2xl font-semibold transition shadow-lg`}
                    >
                      Order Now
                    </a>
                    <a
                      href="#products"
                      className="border border-white/20 hover:bg-white hover:text-black px-8 py-4 rounded-2xl font-semibold transition"
                    >
                      View Menu
                    </a>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                <div className="relative flex justify-center items-center">
                  <div className={`absolute w-[450px] h-[450px] ${cc.glow} rounded-full opacity-20 blur-3xl`} />
                  <div className="absolute w-[420px] h-[420px] border border-white/10 rounded-full" />
                  <img
                    src={slide.image}
                    className="relative z-10 w-[420px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] hover:scale-105 transition duration-500"
                    alt=""
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
        className="absolute top-1/2 left-5 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-2xl transition flex items-center justify-center"
      >
        ❮
      </button>

      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute top-1/2 right-5 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-2xl transition flex items-center justify-center"
      >
        ❯
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => {
          const c = colors[i % colors.length]
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? colorConfig[c].dot : 'bg-white/30'
              }`}
            />
          )
        })}
      </div>
    </section>
  )
}
