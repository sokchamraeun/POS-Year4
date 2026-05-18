import { useState, useEffect } from 'react'
import Navbar from '../../components/customer/Navbar.jsx'
import Footer from '../../components/customer/Footer.jsx'
import HeroSlider from '../../components/customer/HeroSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`${API_URL}/products?page=1`).then((r) => r.json())
        let allProducts = res.data ?? []
        const lastPage = res.last_page ?? 1
        const pages = []
        for (let p = 2; p <= lastPage; p++) {
          pages.push(
            fetch(`${API_URL}/products?page=${p}`)
              .then((r) => r.json())
              .then((j) => j.data ?? [])
          )
        }
        const rest = await Promise.all(pages)
        for (const arr of rest) allProducts = allProducts.concat(arr)
        setProducts(allProducts)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <HeroSlider />

      <section id="products" className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Menu</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
