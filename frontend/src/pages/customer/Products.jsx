import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'
import MobileBottomNav from '../../components/customer/MobileBottomNav.jsx'
import { useCart } from '../../context/CartContext.jsx'

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

  const filtered = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category?.name === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navbar />
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3 max-w-7xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Products</h1>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No products in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
