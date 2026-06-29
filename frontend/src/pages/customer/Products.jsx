import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL

function getImageUrl(image) {
  if (!image) return null
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

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
  const [categories, setCategories] = useState([{ name: 'All', image: null }])
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

        const cats = (catJson.data ?? catJson).map((c) => ({
          name: c.name,
          image: c.image ?? null,
        }))
        setCategories([{ name: 'All', image: null }, ...cats])
      } catch {
        setProducts([])
        setCategories([{ name: 'All', image: null }])
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

  return (
    <div className="min-h-screen bg-[#f0fdfa] pb-24 text-[#134e4a] sm:pb-0">
      <Navbar />

      <main className="relative">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f0fdfa_0%,#ccfbf1_45%,#99f6e4_100%)]" />
        <div className="pointer-events-none absolute -left-28 top-28 h-72 w-72 rounded-full bg-[#14b8a6]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-72 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />

        <div className="relative">
          <PromotionSlider products={promoProducts} />

          {/* Top Header */}
          <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#ccfbf1] bg-[#134e4a] p-5 shadow-[0_25px_70px_rgba(15,118,110,0.20)] sm:p-7">
              <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#14b8a6]/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#5eead4]">
                    Coffee Menu
                  </span>

                  <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Choose Your Favorite Drink
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#99f6e4]/80">
                    Browse coffee, tea, frappe, bakery, and special promotions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[270px]">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5eead4]/80">
                      Products
                    </p>
                    <p className="mt-1 text-3xl font-black text-white">
                      {products.length}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5eead4]/80">
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
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0d9488]">
                    Special Deal
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#134e4a]">
                    Promotion Products
                  </h2>
                </div>

                <Link
                  to="/promotion"
                  className="rounded-2xl border border-[#99f6e4] bg-white px-4 py-2 text-xs font-black text-[#0d9488] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#134e4a] hover:text-white"
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

          {/* Sticky Category - style like MenuOrder */}
          <div className="sticky top-[68px] z-30 border-y border-[#ccfbf1] bg-[#f0fdfa]/95 shadow-[0_12px_30px_rgba(15,118,110,0.10)] backdrop-blur-2xl sm:top-[76px]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="hide-scrollbar flex gap-2 overflow-x-auto py-3">
                {categories.map((cat) => {
                  const active = selectedCategory === cat.name
                  const imgUrl = cat.name === 'All' ? null : getImageUrl(cat.image)

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 active:scale-[0.97] ${
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
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                          </svg>
                        </div>
                      )}
                      <span className="whitespace-nowrap">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Products */}
          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-3 rounded-[1.75rem] border border-[#ccfbf1] bg-white/75 p-4 shadow-[0_18px_45px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0d9488]">
                  Now Showing
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#134e4a]">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-[#ccfbf1] px-4 py-2 text-xs font-black text-[#0d9488]">
                {filtered.length} items
              </span>
            </div>

            {loading ? (
              <div className="rounded-[2rem] border border-[#ccfbf1] bg-white/80 p-10 shadow-[0_18px_45px_rgba(15,118,110,0.08)]">
                <Loader page={false} text="Loading products..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[2rem] border border-[#ccfbf1] bg-white/85 px-5 py-16 text-center shadow-[0_18px_45px_rgba(15,118,110,0.08)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ccfbf1] text-2xl font-black text-[#0d9488]">
                  0
                </div>

                <h3 className="text-lg font-black text-[#134e4a]">
                  No products found
                </h3>

                <p className="mt-1 text-sm font-semibold text-[#0d9488]">
                  No products in this category.
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className="mt-5 rounded-2xl bg-[#134e4a] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(15,118,110,0.25)] transition-all duration-300 hover:bg-[#0f766e]"
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