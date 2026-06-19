import { useState, useEffect } from 'react'
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

export default function Home() {
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`${API_URL}/products?per_page=200`)
        const json = await res.json()

        const data = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : []

        setProducts(data)

        const cats = [
          ...new Set(data.map((p) => p.category?.name).filter(Boolean)),
        ]

        setCategories(['All', 'Promotion', ...cats])
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
    <div className="min-h-screen bg-[#fffaf3] flex flex-col pb-24 sm:pb-0">
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
            <div className="absolute top-10 left-0 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-0 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl"></div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#3d2817] px-5 sm:px-8 py-6 sm:py-8 shadow-[0_20px_50px_rgba(61,40,23,0.25)]">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>

              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 rounded-full bg-white/10 border border-white/15 px-4 py-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide">
                      Fresh Menu
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Choose Your Favorite Drink
                  </h2>

                  <p className="mt-2 text-sm sm:text-base text-amber-100/80">
                    Select category and customize your order easily.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                    <p className="text-[11px] font-bold text-amber-100/70 uppercase">
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
              <div className="rounded-[1.5rem] bg-white border border-amber-100 shadow-[0_15px_40px_rgba(61,40,23,0.12)] p-2.5">
                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex gap-2 min-w-max">
                    {categories.map((cat) => {
                      const active = selectedCategory === cat

                      const hasPromo =
                        cat !== 'All' &&
                        cat !== 'Promotion' &&
                        categoriesWithPromo.has(cat)

                      const isPromotionTab = cat === 'Promotion' && promoProducts.length > 0

                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`relative group flex items-center gap-2 rounded-2xl px-4 sm:px-5 py-3 transition-all duration-300 active:scale-95 ${
                            active
                              ? 'bg-[#3d2817] text-white shadow-lg shadow-amber-900/20'
                              : 'bg-[#fff7ed] text-[#5b3a29] hover:bg-amber-100'
                          }`}
                        >
                          <span className="text-sm font-black whitespace-nowrap">
                            {cat}
                          </span>

                          <span
                            className={`min-w-6 h-6 px-2 rounded-full text-[11px] font-black flex items-center justify-center ${
                              active
                                ? 'bg-amber-400 text-[#3d2817]'
                                : 'bg-white text-amber-700 border border-amber-100'
                            }`}
                          >
                            {getCategoryCount(cat)}
                          </span>

                          {hasPromo && (
                            <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-sm ring-1 ring-white/70">
                              Sale
                            </span>
                          )}

                          {isPromotionTab && (
                            <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-sm ring-1 ring-white/70">
                              Hot
                            </span>
                          )}
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
              <h3 className="text-lg sm:text-xl font-black text-[#3d2817]">
                {selectedCategory === 'All'
                  ? 'All Products'
                  : selectedCategory === 'Promotion'
                    ? 'Promotion Products'
                    : selectedCategory}
              </h3>

              <p className="text-xs sm:text-sm text-[#8a715c] font-medium">
                Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Product List */}
          {loading ? (
            <Loader page={false} text="Loading menu..." />
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-amber-100 rounded-[2rem] py-16 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
                ☕
              </div>

              <h3 className="text-lg font-black text-[#3d2817]">
                No products found
              </h3>

              <p className="text-sm text-[#8a715c] mt-1">
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