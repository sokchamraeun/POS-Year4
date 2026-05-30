import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Promotion() {
  const { addItem } = useCart()
  const [promoProducts, setPromoProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/products?per_page=200`)
      .then((r) => r.json())
      .then((json) => {
        const list = json.data ?? json
        const filtered = (Array.isArray(list) ? list : []).filter((p) => p.promotion)
        setPromoProducts(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <PromotionSlider products={promoProducts} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
          <p className="text-gray-500 mt-1">Special offers and discounts</p>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading promotions...</p>
        ) : promoProducts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No promotions available right now.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {promoProducts.map((product) => (
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
