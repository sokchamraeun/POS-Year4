import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import PromotionSlider from '../../components/customer/PromotionSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'
import promotedProducts from '../../data/promotedProducts.js'

export default function Promotion() {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <PromotionSlider />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
          <p className="text-gray-500 mt-1">Special offers and discounts</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {promotedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={(item) => addItem(product, item)} />
          ))}
        </div>
      </section>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
