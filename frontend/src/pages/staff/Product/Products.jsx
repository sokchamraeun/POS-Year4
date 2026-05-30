import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import EditModalProduct from './EditModalProduct.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/products'
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

const categoryColors = {
  Coffee: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
  Tea: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
  Juice: 'bg-orange-100 text-orange-700 ring-1 ring-orange-600/20',
  Smoothie: 'bg-purple-100 text-purple-700 ring-1 ring-purple-600/20',
  Pastry: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-600/20',
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
    fetch(`${API_URL}?page=${p}`, { headers: getHeaders() })
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
    fetch(`${import.meta.env.VITE_API_URL}/categories`, { headers: getHeaders() })
      .then(r => r.json())
      .then(json => setCategories(json.data ?? json))
      .catch(() => {})
  }, [updated])

  function handleDelete(id, name) {
    if (!confirm(`Delete product "${name}"? This cannot be undone.`)) return
    fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() })
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Manage your product inventory</p>
            </div>
            <Link
              to="/staff/products/add"
              className="group bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/40 flex flex-col border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-md group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
                <div className="inline-block relative w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-10 py-3 rounded-2xl text-sm font-bold bg-gray-50 border-0 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition-all shadow-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl ml-auto">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-indigo-700">{total} product{total !== 1 ? 's' : ''}</span>
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
                <div className="overflow-x-auto hidden lg:block custom-scrollbar">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Sizes</th>
                        <th className="px-6 py-4">Addons</th>
                        <th className="px-6 py-4">Sugar</th>
                        <th className="px-6 py-4">Ice</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((product, index) => (
                        <tr key={product.id} className="group border-b border-gray-50/80 hover:bg-indigo-50/30 transition-colors last:border-0">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {product.image ? (
                                  <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-12 h-12 rounded-xl object-contain shadow-sm ring-1 ring-gray-100 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0 bg-white" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-gray-400 text-xs shadow-sm font-medium">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500 font-medium mt-0.5">#{product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                              {product.category?.name ?? '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 min-w-[150px]">
                            <div className="flex flex-wrap gap-2">
                              {product.sizes?.map((size) => (
                                <span key={size.id} className="inline-flex items-center gap-1 bg-white text-gray-700 text-xs px-2.5 py-1.5 rounded-lg ring-1 ring-inset ring-gray-200 shadow-sm font-medium">
                                  <span>{size.name}</span>
                                  <span className="text-indigo-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[120px]">
                            <div className="flex flex-wrap gap-1.5">
                              {product.addons?.length ? (
                                product.addons.map((addon) => (
                                  <span key={addon.id} className="inline-block bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 text-xs px-2.5 py-1 rounded-lg font-bold">
                                    {addon.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-300 font-medium">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[100px]">
                            <div className="flex flex-wrap gap-1.5">
                              {product.sugar_levels?.length ? (
                                product.sugar_levels.map((level) => (
                                  <span key={level.id} className="inline-block bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 text-xs px-2 py-1 rounded-lg font-bold">{level.name}</span>
                                ))
                              ) : (
                                <span className="text-gray-300 font-medium">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[100px]">
                            <div className="flex flex-wrap gap-1.5">
                              {product.ice_levels?.length ? (
                                product.ice_levels.map((level) => (
                                  <span key={level.id} className="inline-block bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20 text-xs px-2 py-1 rounded-lg font-bold">{level.name}</span>
                                ))
                              ) : (
                                <span className="text-gray-300 font-medium">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-inset ${product.status ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setViewProduct(product)}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-all duration-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setEditProduct(product)}
                                className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 rounded-xl transition-all duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200"
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
                <div className="lg:hidden p-6 grid gap-4">
                  {filtered.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex items-start gap-5 mb-5">
                        <div className="relative">
                          {product.image ? (
                            <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-20 h-20 rounded-2xl object-contain shadow-sm ring-1 ring-gray-100 bg-white shrink-0 group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center text-gray-400 text-xs font-medium">N/A</div>
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="font-bold text-gray-900 text-lg leading-tight">{product.name}</div>
                          <div className="text-xs text-gray-400 font-medium mb-2.5 mt-1">#{product.id}</div>
                          <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                            {product.category?.name ?? '-'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sizes</div>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes?.map((size) => (
                              <span key={size.id} className="bg-gray-50 ring-1 ring-inset ring-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-xl">
                                {size.name} <span className="text-indigo-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {product.addons?.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Addons</div>
                            <div className="flex flex-wrap gap-2">
                              {product.addons.map((addon) => (
                                <span key={addon.id} className="bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 text-xs font-bold px-3 py-1.5 rounded-xl">{addon.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {product.sugar_levels?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sugar</div>
                              <div className="flex flex-wrap gap-2">
                                {product.sugar_levels.map((level) => (
                                  <span key={level.id} className="bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 text-xs font-bold px-2.5 py-1 rounded-xl">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {product.ice_levels?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ice</div>
                              <div className="flex flex-wrap gap-2">
                                {product.ice_levels.map((level) => (
                                  <span key={level.id} className="bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20 text-xs font-bold px-2.5 py-1 rounded-xl">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-inset ${product.status ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setViewProduct(product)} className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all shadow-sm">View</button>
                          <button onClick={() => setEditProduct(product)} className="px-4 py-2 text-xs font-bold text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all shadow-sm">Edit</button>
                          <button onClick={() => handleDelete(product.id, product.name)} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all shadow-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-16 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-900 font-bold text-lg">No products found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {lastPage > 1 && !loading && !error && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{from}</span> to <span className="font-bold text-gray-900">{to}</span> of <span className="font-bold text-gray-900">{total}</span> products
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => fetchProducts(page - 1)}
                          disabled={page <= 1}
                          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${page <= 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm ring-1 ring-inset ring-gray-200'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                          Prev
                        </button>
                        <div className="hidden sm:flex gap-1.5">
                          {Array.from({ length: lastPage }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                            .reduce((acc, p, idx, arr) => {
                              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                              acc.push(p)
                              return acc
                            }, [])
                            .map((item, i) =>
                              item === '...' ? (
                                <span key={`e${i}`} className="px-3 py-2 text-sm text-gray-400 font-bold">...</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => fetchProducts(item)}
                                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 ${item === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-200'}`}
                                >
                                  {item}
                                </button>
                              )
                            )}
                        </div>
                        <button
                          onClick={() => fetchProducts(page + 1)}
                          disabled={page >= lastPage}
                          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${page >= lastPage ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm ring-1 ring-inset ring-gray-200'}`}
                        >
                          Next
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Product Details
              </h2>
              <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative shrink-0">
                  {viewProduct.image ? (
                    <img src={`${viewProduct.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${viewProduct.image}`} alt={viewProduct.name} className="w-32 h-32 rounded-3xl object-contain shadow-lg ring-1 ring-gray-100 bg-white" />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center text-gray-400 font-medium">N/A</div>
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{viewProduct.name}</h3>
                  <p className="text-sm text-gray-400 font-mono mt-2 font-medium">#{viewProduct.id}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${categoryColors[viewProduct.category?.name] ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>
                      {viewProduct.category?.name ?? '-'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-inset ${viewProduct.status ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${viewProduct.status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      {viewProduct.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {viewProduct.description && (
                <div className="bg-gray-50 rounded-2xl p-5 ring-1 ring-inset ring-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Description</div>
                  <p className="text-gray-700 leading-relaxed font-medium">{viewProduct.description}</p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Sizes & Pricing</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {viewProduct.sizes?.length ? viewProduct.sizes.map((size) => (
                    <div key={size.id} className="bg-gray-50 rounded-2xl p-4 text-center ring-1 ring-inset ring-gray-100 hover:ring-indigo-100 hover:bg-indigo-50/30 transition-all">
                      <div className="font-bold text-gray-900">{size.name}</div>
                      <div className="text-indigo-600 font-bold text-xl mt-1 tracking-tight">${Number(size.pivot?.price ?? 0).toFixed(2)}</div>
                    </div>
                  )) : <p className="text-gray-400 col-span-full text-center py-2 font-medium">No sizes available</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {viewProduct.addons?.length > 0 && (
                  <div className="bg-purple-50/50 rounded-2xl p-5 ring-1 ring-inset ring-purple-100">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-3">Addons</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.addons.map((addon) => (
                        <span key={addon.id} className="bg-white text-purple-700 ring-1 ring-purple-600/10 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">{addon.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.sugar_levels?.length > 0 && (
                  <div className="bg-amber-50/50 rounded-2xl p-5 ring-1 ring-inset ring-amber-100">
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-3">Sugar Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.sugar_levels.map((level) => (
                        <span key={level.id} className="bg-white text-amber-700 ring-1 ring-amber-600/10 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.ice_levels?.length > 0 && (
                  <div className="bg-cyan-50/50 rounded-2xl p-5 ring-1 ring-inset ring-cyan-100">
                    <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-3">Ice Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.ice_levels.map((level) => (
                        <span key={level.id} className="bg-white text-cyan-700 ring-1 ring-cyan-600/10 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setViewProduct(null)}
                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => { const p = viewProduct; setViewProduct(null); setEditProduct(p) }}
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/30 transition-all duration-300"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}