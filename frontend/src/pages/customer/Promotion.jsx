import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Promotion() {
  const { addItem } = useCart()
  const [promoProducts, setPromoProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/products?per_page=200`)
      .then((r) => r.json())
      .then((json) => {
        const list = json.data ?? json
        const filtered = (Array.isArray(list) ? list : []).filter((p) => p.promotion)
        setPromoProducts(filtered)
        const cats = [...new Set(filtered.map((p) => p.category?.name).filter(Boolean))]
        setCategories(['All', ...cats])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = selectedCategory === 'All'
    ? promoProducts
    : promoProducts.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-0">
      <Navbar />
      <PromotionSlider products={promoProducts} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
          <p className="text-gray-500 mt-1">Special offers and discounts</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? <Loader page={false} text="Loading promotions..." /> : filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No promotions available right now.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={(item) => addItem(product, item)} />
            ))}
          </div>
        )}
      </section>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
