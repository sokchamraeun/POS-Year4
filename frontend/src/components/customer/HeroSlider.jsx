import { useState, useEffect } from 'react'

const slides = [
  {
    title: 'Welcome to POSystem',
    highlight: 'POSystem',
    text: 'Your all-in-one point of sale solution. Browse our coffee menu, customize your drink, and order with ease.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=800&fit=crop',
  },
  {
    title: 'Freshly Brewed Coffee',
    highlight: 'Coffee',
    text: 'Enjoy premium coffee beans sourced from the finest farms around the world.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=800&fit=crop',
  },
  {
    title: 'Special Offers Today',
    highlight: 'Offers',
    text: 'Get up to 20% off on selected beverages. Don\'t miss out on our daily deals!',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1920&h=800&fit=crop',
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="home" className="relative text-white overflow-hidden">
      <img
        src={slides[current].image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col items-center text-center transition-all duration-700">
          <h1 className="text-5xl font-bold mb-6">
            {slides[current].title.replace(slides[current].highlight, '')}
            <span className="text-yellow-300"> {slides[current].highlight}</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mb-10">
            {slides[current].text}
          </p>
          <a
            href="#products"
            className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            View Our Menu
          </a>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === current ? 'bg-yellow-400' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
