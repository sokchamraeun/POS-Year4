import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import EditModalProduct from './EditModalProduct.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/products'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

const categoryColors = {
  Coffee: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
  Tea: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  Juice: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
  Smoothie: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  Pastry: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
}

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
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)

  const fetchProducts = (p) => {
    setLoading(true)
    fetch(`${API_URL}?page=${p}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
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
    fetchProducts(1)
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { headers })
      .then(r => r.json())
      .then(json => setCategories(json.data ?? json))
      .catch(() => {})
  }, [updated])

  function handleDelete(id, name) {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return
    fetch(`${API_URL}/${id}`, { method: 'DELETE', headers })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete')
        fetchProducts(page)
      })
      .catch(() => alert('Failed to delete product'))
  }



  const filtered = products.filter(
    (p) =>
      (!selectedCategory || p.category_id == selectedCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name ?? '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Products
                </h1>
                <p className="text-gray-500 mt-1">Manage your product inventory</p>
              </div>
              <Link
                to="/staff/products/add"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Search Bar */}
            <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-700">{total} product{total !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden lg:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sizes</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Addons</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sugar</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ice</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {product.image ? (
                                  <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-12 h-12 rounded-xl object-cover object-center shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-xs shadow-inner">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{product.name}</div>
                                <div className="text-xs text-gray-400 font-mono">#{product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700'}`}>
                              {product.category?.name ?? '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.sizes?.map((size) => (
                                <span key={size.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1.5 rounded-lg">
                                  <span className="font-medium">{size.name}</span>
                                  <span className="text-blue-600 font-bold">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.addons?.length ? (
                                product.addons.map((addon) => (
                                  <span key={addon.id} className="inline-block bg-purple-100 text-purple-700 text-xs px-2.5 py-1.5 rounded-lg font-medium">
                                    {addon.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.sugar_levels?.length ? (
                                product.sugar_levels.map((level) => (
                                  <span key={level.id} className="inline-block bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-lg">{level.name}</span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.ice_levels?.length ? (
                                product.ice_levels.map((level) => (
                                  <span key={level.id} className="inline-block bg-cyan-100 text-cyan-700 text-xs px-2.5 py-1 rounded-lg">{level.name}</span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${product.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewProduct(product)}
                                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setEditProduct(product)}
                                className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-gray-500 font-medium">No products found</p>
                              <p className="text-gray-400 text-sm">Try adjusting your search</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-6">
                  {filtered.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-4 mb-4">
                        {product.image ? (
                          <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-16 h-16 rounded-xl object-cover object-center shadow-md shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg">{product.name}</div>
                          <div className="text-xs text-gray-400 font-mono mb-2">#{product.id}</div>
                          <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700'}`}>
                            {product.category?.name ?? '-'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">Sizes</div>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes?.map((size) => (
                              <span key={size.id} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg">
                                {size.name} <span className="text-blue-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {product.addons?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">Addons</div>
                            <div className="flex flex-wrap gap-2">
                              {product.addons.map((addon) => (
                                <span key={addon.id} className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-lg">{addon.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          {product.sugar_levels?.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-2">Sugar</div>
                              <div className="flex flex-wrap gap-2">
                                {product.sugar_levels.map((level) => (
                                  <span key={level.id} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-lg">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {product.ice_levels?.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-2">Ice</div>
                              <div className="flex flex-wrap gap-2">
                                {product.ice_levels.map((level) => (
                                  <span key={level.id} className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-lg">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${product.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setViewProduct(product)} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">View</button>
                          <button onClick={() => setEditProduct(product)} className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all">Edit</button>
                          <button onClick={() => handleDelete(product.id, product.name)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 font-medium">No products found</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {lastPage > 1 && !loading && !error && (
                  <div className="px-8 py-5 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-800">{from}</span> to <span className="font-semibold text-gray-800">{to}</span> of <span className="font-semibold text-gray-800">{total}</span> products
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchProducts(page - 1)}
                          disabled={page <= 1}
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Prev
                        </button>
                        <div className="flex gap-1">
                          {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                            .reduce((acc, p, idx, arr) => {
                              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                              acc.push(p)
                              return acc
                            }, [])
                            .map((item, i) =>
                              item === '...' ? (
                                <span key={`e${i}`} className="px-3 py-2 text-sm text-gray-400">...</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => fetchProducts(item)}
                                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${item === page ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                                >
                                  {item}
                                </button>
                              )
                            )}
                        </div>
                        <button
                          onClick={() => fetchProducts(page + 1)}
                          disabled={page >= lastPage}
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${page >= lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200'}`}
                        >
                          Next
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {editProduct && (
        <EditModalProduct
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={() => fetchProducts(page)}
        />
      )}

      {/* Product Details Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Product Details
              </h2>
              <button onClick={() => setViewProduct(null)} className="p-1 hover:bg-gray-100 rounded-full transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-5">
                {viewProduct.image ? (
                  <img src={`${viewProduct.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${viewProduct.image}`} alt={viewProduct.name} className="w-24 h-24 rounded-2xl object-cover object-center shadow-lg shrink-0" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">N/A</div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{viewProduct.name}</h3>
                  <p className="text-sm text-gray-400 font-mono mt-1">#{viewProduct.id}</p>
                  <div className="mt-2 flex gap-2">
                    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[viewProduct.category?.name] ?? 'bg-gray-100 text-gray-700'}`}>
                      {viewProduct.category?.name ?? '-'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${viewProduct.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${viewProduct.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      {viewProduct.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {viewProduct.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Description</div>
                  <p className="text-gray-700 leading-relaxed">{viewProduct.description}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Sizes & Pricing</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {viewProduct.sizes?.length ? viewProduct.sizes.map((size) => (
                    <div key={size.id} className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <div className="font-semibold text-gray-800">{size.name}</div>
                      <div className="text-blue-600 font-bold text-lg mt-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</div>
                    </div>
                  )) : <p className="text-gray-400 col-span-full text-center">No sizes available</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {viewProduct.addons?.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-2">Addons</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.addons.map((addon) => (
                        <span key={addon.id} className="bg-white text-purple-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">{addon.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.sugar_levels?.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Sugar Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.sugar_levels.map((level) => (
                        <span key={level.id} className="bg-white text-amber-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.ice_levels?.length > 0 && (
                  <div className="bg-cyan-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-cyan-800 uppercase tracking-wider mb-2">Ice Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.ice_levels.map((level) => (
                        <span key={level.id} className="bg-white text-cyan-700 text-xs px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => { const p = viewProduct; setViewProduct(null); setEditProduct(p) }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300"
              >
                Edit Product
              </button>
              <button
                onClick={() => setViewProduct(null)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}