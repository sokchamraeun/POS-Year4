import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/customer/Navbar.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Products() {
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
        setCategories(['All', ...cats])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const promoProducts = products.filter((p) => p.promotion)
  const filtered = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      <Navbar />

      <PromotionSlider products={promoProducts} />

      {promoProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Promotion Products</span>
              <span className="w-1 h-5 bg-linear-to-b from-blue-600 to-cyan-600 rounded-full"></span>
            </h2>
            <Link to="/promotion" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={(item) => addItem(product, item)} />
            ))}
          </div>
        </section>
      )}

      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 overflow-x-auto shadow-sm">
        <div className="flex gap-2.5 px-4 py-3.5 max-w-7xl mx-auto">
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
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
          <span>Products</span>
          <span className="w-1.5 h-6 bg-linear-to-b from-blue-600 to-cyan-600 rounded-full"></span>
        </h1>
        {loading ? <Loader page={false} text="Loading..." /> : filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-10">No products in this category.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={(item) => addItem(product, item)} />
            ))}
          </div>
        )}
      </div>
      <MobileBottomNav />
    </div>
  )
}
