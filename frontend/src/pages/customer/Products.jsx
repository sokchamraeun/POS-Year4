import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Products() {
  const { addItem } = useCart()
  const [searchParams] = useSearchParams()

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
  const [categories, setCategories] = useState(['All'])
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

        setCategories(['All', ...cats])
      } catch {
        setProducts([])
        setCategories(['All'])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const promoProducts = products.filter((p) => p.promotion)

  const filtered =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category?.name === selectedCategory)

  function getCategoryCount(cat) {
    if (cat === 'All') return products.length
    return products.filter((p) => p.category?.name === cat).length
  }

  return (
    <div className="min-h-screen bg-[#fbf1e3] pb-24 text-[#2b170d] sm:pb-0">
      <Navbar />

      <main className="relative">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#fff8ef_0%,#fbf1e3_45%,#f8ead7_100%)]" />
        <div className="pointer-events-none absolute -left-28 top-28 h-72 w-72 rounded-full bg-[#d59a52]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-72 h-72 w-72 rounded-full bg-[#5b321a]/15 blur-3xl" />

        <div className="relative">
          <PromotionSlider products={promoProducts} />

          {/* Top Header */}
          <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e4c49c] bg-[#2b170d] p-5 shadow-[0_25px_70px_rgba(61,40,23,0.20)] sm:p-7">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#d59a52]/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#f9d9ac]">
                    Coffee Menu
                  </span>

                  <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Choose Your Favorite Drink
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#f1d6b6]/80">
                    Browse coffee, tea, frappe, bakery, and special promotions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[270px]">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f9d9ac]/80">
                      Products
                    </p>
                    <p className="mt-1 text-3xl font-black text-white">
                      {products.length}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f9d9ac]/80">
                      Categories
                    </p>
                    <p className="mt-1 text-3xl font-black text-white">
                      {Math.max(categories.length - 1, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Promotion Products */}
          {promoProducts.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a6a3c]">
                    Special Deal
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#2b170d]">
                    Promotion Products
                  </h2>
                </div>

                <Link
                  to="/promotion"
                  className="rounded-2xl border border-[#d9b98f] bg-white px-4 py-2 text-xs font-black text-[#7b4a26] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2b170d] hover:text-white"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {promoProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(item) => addItem(product, item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sticky Category - fixed scroll up issue */}
          <div className="sticky top-[68px] z-30 border-y border-[#e7cda7] bg-[#fbf1e3]/95 shadow-[0_12px_30px_rgba(61,40,23,0.10)] backdrop-blur-2xl sm:top-[76px]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="hide-scrollbar flex gap-3 overflow-x-auto py-3">
                {categories.map((cat) => {
                  const active = selectedCategory === cat
                  const count = getCategoryCount(cat)

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`relative flex shrink-0 items-center gap-3 rounded-[1.35rem] border px-4 py-2.5 text-xs font-black transition-all duration-300 active:scale-95 sm:text-sm ${
                        active
                          ? 'border-[#2b170d] bg-[#2b170d] text-white shadow-[0_14px_30px_rgba(43,23,13,0.30)]'
                          : 'border-[#e1c29a] bg-white text-[#76543a] hover:-translate-y-0.5 hover:border-[#a86530] hover:bg-[#fff7ec] hover:text-[#2b170d]'
                      }`}
                    >
                      <span>{cat}</span>

                      <span
                        className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-black ${
                          active
                            ? 'bg-[#d59a52] text-white'
                            : 'bg-[#f5dfc2] text-[#8a5d3b]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Products */}
          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-[#e7cda7] bg-white/75 p-4 shadow-[0_18px_45px_rgba(61,40,23,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a6a3c]">
                  Now Showing
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#2b170d]">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-[#fff0dc] px-4 py-2 text-xs font-black text-[#7b4a26]">
                {filtered.length} items
              </span>
            </div>

            {loading ? (
              <div className="rounded-[2rem] border border-[#e7cda7] bg-white/80 p-10 shadow-[0_18px_45px_rgba(61,40,23,0.08)]">
                <Loader page={false} text="Loading products..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[2rem] border border-[#e7cda7] bg-white/85 px-5 py-16 text-center shadow-[0_18px_45px_rgba(61,40,23,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff0dc] text-2xl font-black text-[#7b4a26]">
                  0
                </div>

                <h3 className="text-lg font-black text-[#2b170d]">
                  No products found
                </h3>

                <p className="mt-1 text-sm font-semibold text-[#8a715c]">
                  No products in this category.
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="mt-5 rounded-2xl bg-[#2b170d] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(43,23,13,0.25)] transition-all duration-300 hover:bg-[#5b321a]"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid scroll-mt-[150px] grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
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
      </main>

      <MobileBottomNav />

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}