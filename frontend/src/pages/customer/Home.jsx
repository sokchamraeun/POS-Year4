import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import EventSection from '../../components/customer/EventSection.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import BestSellers from '../../components/customer/BestSellers.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

function getImageUrl(image) {
  if (!image) return null
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function Home() {
  const { addItem } = useCart()
  const [searchParams] = useSearchParams()

  // Capture the table QR token (?token=...) so scanning the QR opens the home
  // page and still registers a pending order for that table.
  const qrToken = (() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) {
      sessionStorage.setItem('qr_token', fromUrl)
      return fromUrl
    }
    return sessionStorage.getItem('qr_token') || ''
  })()

  useEffect(() => {
    if (qrToken) {
      fetch(`${API_URL}/tables/by-token/${qrToken}`).catch(() => {})
    }
  }, [qrToken])

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products?per_page=200`),
          fetch(`${API_URL}/categories`),
        ])

        const prodJson = await prodRes.json()
        const catJson = await catRes.json()

        const data = Array.isArray(prodJson)
          ? prodJson
          : Array.isArray(prodJson.data)
            ? prodJson.data
            : []

        setProducts(data)

        const apiCats = (catJson.data ?? catJson).map((c) => ({
          name: c.name,
          image: c.image ?? null,
        }))

        setCategories([{ name: 'All', image: null }, { name: 'Promotion', image: null }, ...apiCats])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchAll()

    const interval = setInterval(fetchAll, 15000)

    return () => clearInterval(interval)
  }, [])

  const promoProducts = products.filter((p) => p.promotion)

  const categoriesWithPromo = new Set(
    promoProducts.map((p) => p.category?.name).filter(Boolean)
  )

  const categoryCounts = products.reduce((acc, product) => {
    const name = product.category?.name

    if (name) {
      acc[name] = (acc[name] || 0) + 1
    }

    return acc
  }, {})

  function getCategoryCount(cat) {
    if (cat === 'All') return products.length
    if (cat === 'Promotion') return promoProducts.length

    return categoryCounts[cat] || 0
  }

  const filtered =
    selectedCategory === 'All'
      ? products
      : selectedCategory === 'Promotion'
        ? products.filter((p) => p.promotion)
        : products.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-[#f0fdfa] flex flex-col pb-24 sm:pb-0">
      <Navbar />

      <div className="flex-1">
        <PromotionSlider products={promoProducts} />

        <EventSection />

        <BestSellers products={products} />

        <section
          id="products"
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-0 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-0 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl"></div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#134e4a] px-5 sm:px-8 py-6 sm:py-8 shadow-[0_20px_50px_rgba(15,118,110,0.25)]">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-teal-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-600/20 rounded-full blur-3xl"></div>

              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-white/10 border border-white/15 px-4 py-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-black text-teal-200 uppercase tracking-wide">
                      Fresh Menu
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Choose Your Favorite Drink
                  </h2>

                  <p className="mt-2 text-sm sm:text-base text-teal-100/80">
                    Select category and customize your order easily.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-[11px] font-bold text-teal-100/70 uppercase">
                      Products
                    </p>
                    <p className="text-2xl font-black text-white">
                      {products.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-500 px-4 py-3 shadow-lg shadow-red-900/30">
                    <p className="text-[11px] font-bold text-white/80 uppercase">
                      Promo
                    </p>
                    <p className="text-2xl font-black text-white">
                      {promoProducts.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="relative -mt-5 mx-3 sm:mx-6">
              <div className="rounded-[1.5rem] bg-white border border-[#ccfbf1] shadow-[0_15px_40px_rgba(15,118,110,0.12)] p-2.5">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex gap-2 min-w-max">
                    {categories.map((cat) => {
                      const active = selectedCategory === cat.name

                      const hasPromo =
                        cat.name !== 'All' &&
                        cat.name !== 'Promotion' &&
                        categoriesWithPromo.has(cat.name)

                      const isPromotionTab = cat.name === 'Promotion' && promoProducts.length > 0
                      const imgUrl = cat.name === 'All' || cat.name === 'Promotion' ? null : getImageUrl(cat.image)

                      return (
                        <button
                          key={cat.name}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`relative flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 active:scale-[0.97] ${
                            active
                              ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700'
                          }`}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={cat.name}
                              className="aspect-square h-8 w-8 rounded-lg border border-slate-100 bg-slate-50 object-cover"
                            />
                          ) : (
                            <div className={`flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
                              active ? 'text-white' : 'text-slate-400'
                            }`}>
                              {cat.name === 'Promotion' ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                              )}
                            </div>
                          )}
                          <span className="whitespace-nowrap">{cat.name}</span>

                          <div className="flex items-center gap-1">
                            <span
                              className={`min-w-5 h-5 px-1.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                                active
                                  ? 'bg-teal-500 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {getCategoryCount(cat.name)}
                            </span>

                            {hasPromo && (
                              <span className="inline-flex items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white shadow-sm ring-1 ring-white/70">
                                Sale
                              </span>
                            )}

                            {isPromotionTab && (
                              <span className="inline-flex items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white shadow-sm ring-1 ring-white/70">
                                Hot
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Category Small Text */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#134e4a]">
                {selectedCategory === 'All'
                  ? 'All Products'
                  : selectedCategory === 'Promotion'
                    ? 'Promotion Products'
                    : selectedCategory}
              </h3>

              <p className="text-xs sm:text-sm text-[#0d9488] font-medium">
                Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Product List */}
          {loading ? (
            <Loader page={false} text="Loading menu..." />
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-[#ccfbf1] rounded-[2rem] py-16 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-100 flex items-center justify-center text-3xl">
                ☕
              </div>

              <h3 className="text-lg font-black text-[#134e4a]">
                No products found
              </h3>

              <p className="text-sm text-[#0d9488] mt-1">
                No products in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(item) => addItem(product, item)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  )
}