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
        const data = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : [])
        setProducts(data)
        const cats = [...new Set(data.map((p) => p.category?.name).filter(Boolean))]
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
  const categoriesWithPromo = new Set(promoProducts.map((p) => p.category?.name).filter(Boolean))
  const filtered = selectedCategory === 'All'
    ? products
    : selectedCategory === 'Promotion'
      ? products.filter((p) => p.promotion)
      : products.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24 sm:pb-0">
      <Navbar />

      <div className="flex-1">
        <PromotionSlider products={promoProducts} />

        <EventSection />

        <BestSellers products={products} />

        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Our Menu</span>
              <span className="w-1.5 h-6 bg-linear-to-b from-blue-600 to-cyan-600 rounded-full"></span>
            </h2>
            
            <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              <div className="flex gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-100 scale-[1.02]'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 active:scale-95'
                    }`}
                  >
                    {cat}
                    {cat !== 'All' && cat !== 'Promotion' && categoriesWithPromo.has(cat) && (
                      <span className="ml-1.5 text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Promo</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {loading ? <Loader page={false} text="Loading menu..." /> : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-10">No products in this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={(item) => addItem(product, item)} />
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
