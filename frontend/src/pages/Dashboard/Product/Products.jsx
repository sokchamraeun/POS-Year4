import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import EditModalProduct from './components/EditModalProduct.jsx'
import Loader from '../../../components/shared/Loader.jsx'
import { fetchProducts as fetchProductsApi, fetchCategories as fetchCategoriesApi, fetchProductDetails, deleteProduct as deleteProductApi } from './api/productApi.js'
import ProductStats from './components/ProductStats.jsx'
import ProductFilters from './components/ProductFilters.jsx'
import ProductTable from './components/ProductTable.jsx'
import ProductMobileCards from './components/ProductMobileCards.jsx'
import ProductPagination from './components/ProductPagination.jsx'
import ProductDetailModal from './components/ProductDetailModal.jsx'

export default function Products() {
  const [searchParams] = useSearchParams()
  const updated = searchParams.get('updated')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [viewProduct, setViewProduct] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)

  const loadProducts = (p) => {
    setLoading(true)
    fetchProductsApi(p)
      .then((json) => {
        setProducts(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []))
        setPage(json.current_page ?? 1)
        setLastPage(json.last_page ?? 1)
        setTotal(json.total ?? 0)
        setFrom(json.from ?? 0)
        setTo(json.to ?? 0)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadProducts(1)
    fetchCategoriesApi()
      .then(json => setCategories(json.data ?? json))
      .catch(() => {})
  }, [updated])

  function handleDelete(product) {
    if (!confirm(`Delete product "${product.name}"? This cannot be undone.`)) return
    deleteProductApi(product.id)
      .then(() => loadProducts(page))
      .catch(() => alert('Failed to delete product'))
  }

  function handleView(product) {
    fetchProductDetails(product.id)
      .then((fullProduct) => setViewProduct(fullProduct.data || fullProduct))
      .catch(() => setViewProduct(product))
  }

  const filtered = products.filter(
    (p) =>
      (statusFilter === 'all' || (statusFilter === 'active' && p.status) || (statusFilter === 'inactive' && !p.status)) &&
      (!selectedCategory || p.category_id == selectedCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  const activeCount = products.filter(p => p.status).length
  const inactiveCount = products.filter(p => !p.status).length
  const noProducts = filtered.length === 0

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-900 to-amber-800 bg-clip-text text-transparent tracking-tight">
                Products
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage your product inventory</p>
            </div>
            <Link
              to="/staff/products/add"
              className="group bg-gradient-to-r from-amber-900 to-amber-800 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-amber-600/30 hover:shadow-amber-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          <ProductStats total={total} categories={categories} activeCount={activeCount} inactiveCount={inactiveCount} promotionCount={products.filter(p => p.promotion).length} />

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col border border-slate-200 overflow-hidden">
            <ProductFilters
              search={search}
              onSearchChange={setSearch}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              filteredCount={filtered.length}
            />

            {loading ? <Loader page={false} text="Loading products..." /> : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : (
              <>
                <ProductTable products={filtered} onView={handleView} onEdit={setEditProduct} onDelete={handleDelete} noProducts={noProducts} />
                <ProductMobileCards products={filtered} onView={handleView} onEdit={setEditProduct} onDelete={handleDelete} noProducts={noProducts} />
                <ProductPagination page={page} lastPage={lastPage} from={from} to={to} total={total} onPageChange={loadProducts} />
              </>
            )}
          </div>
        </main>
      </div>

      {editProduct && (
        <EditModalProduct
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => loadProducts(page)}
        />
      )}

      <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} onEdit={(p) => { setViewProduct(null); setEditProduct(p) }} />
    </div>
  )
}