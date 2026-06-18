import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export default function EventSection() {
  const [events, setEvents] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then((r) => (r.ok ? r.json() : []))
      .then((json) => {
        const list = json.data ?? json
        setEvents((Array.isArray(list) ? list : []).filter((e) => e.is_active))
      })
      .catch(() => setEvents([]))
  }, [])

  if (events.length === 0) return null

  return (
    <section className="w-full max-w-7xl mx-auto mt-8 sm:mt-12 px-4">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Events</h2>
        <span className="w-1.5 h-6 bg-gradient-to-b from-amber-600 to-orange-500 rounded-full" />
      </div>

      {/* Bento mosaic: first event large, the rest in a grid beside it */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:auto-rows-fr lg:h-[520px]">
        {events.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setActive(e.image)}
            className={`group relative overflow-hidden bg-slate-100 shadow-sm focus:outline-none aspect-square lg:aspect-auto ${
              i === 0 ? 'col-span-2 row-span-2 lg:col-span-2 lg:row-span-2' : ''
            }`}
          >
            <img
              src={e.image}
              alt={e.title || 'Event'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {e.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className={`text-white font-semibold line-clamp-1 ${i === 0 ? 'text-base sm:text-lg' : 'text-sm'}`}>{e.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <img src={active} alt="Event" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
          <button
            onClick={() => setActive(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
