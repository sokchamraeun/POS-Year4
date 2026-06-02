import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import EditModalProduct from './EditModalProduct.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/products'
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

const categoryColors = {
  Coffee: 'bg-teal-100 text-teal-700 border border-teal-200',
  Tea: 'bg-teal-100 text-teal-700 border border-teal-200',
  Juice: 'bg-teal-100 text-teal-700 border border-teal-200',
  Smoothie: 'bg-teal-100 text-teal-700 border border-teal-200',
  Pastry: 'bg-teal-100 text-teal-700 border border-teal-200',
  Default: 'bg-teal-100 text-teal-700 border border-teal-200'
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
                Products
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage your product inventory</p>
            </div>
            <Link
              to="/staff/products/add"
              className="group bg-gradient-to-r from-teal-600 to-teal-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-teal-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Products</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{total}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-teal-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Categories</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{categories.length}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-teal-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active Items</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{products.filter(p => p.status).length}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-teal-500 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">On Sale</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{products.filter(p => p.promotion).length}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col border border-slate-200 overflow-hidden">
            {/* Search Bar */}
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium bg-slate-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                  />
                </div>
                <div className="inline-block relative w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto pl-4 pr-10 py-3 rounded-2xl text-sm font-medium bg-slate-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 appearance-none cursor-pointer transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-2xl ml-auto border border-teal-200">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-teal-700">{total} product{total !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                  <p className="text-slate-500">Loading products...</p>
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
                {/* Desktop Table View - Show all items without truncation */}
                <div className="overflow-x-auto hidden lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200 bg-slate-50/50">
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
                        <tr key={product.id} className="group border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {product.image ? (
                                  <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-12 h-12 rounded-xl object-contain shadow-sm ring-1 ring-slate-200 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0 bg-white" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 text-xs shadow-sm font-medium">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{product.name}</div>
                                <div className="text-xs text-slate-400 font-medium mt-0.5">#{product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[product.category?.name] ?? categoryColors.Default}`}>
                              {product.category?.name ?? '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {product.sizes?.map((size) => (
                                <span key={size.id} className="inline-flex items-center gap-1 bg-white text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm font-medium">
                                  <span>{size.name}</span>
                                  <span className="text-teal-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                                </span>
                              ))}
                              {(!product.sizes || product.sizes.length === 0) && (
                                <span className="text-slate-300 font-medium">—</span>
                              )}
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.addons?.map((addon) => (
                                <span key={addon.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-1 rounded-lg font-semibold">
                                  {addon.name}
                                </span>
                              ))}
                              {(!product.addons || product.addons.length === 0) && (
                                <span className="text-slate-300 font-medium">—</span>
                              )}
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.sugar_levels?.map((level) => (
                                <span key={level.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-1 rounded-lg font-semibold">
                                  {level.name}
                                </span>
                              ))}
                              {(!product.sugar_levels || product.sugar_levels.length === 0) && (
                                <span className="text-slate-300 font-medium">—</span>
                              )}
                            </div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {product.ice_levels?.map((level) => (
                                <span key={level.id} className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2 py-1 rounded-lg font-semibold">
                                  {level.name}
                                </span>
                              ))}
                              {(!product.ice_levels || product.ice_levels.length === 0) && (
                                <span className="text-slate-300 font-medium">—</span>
                              )}
                            </div>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.status ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`}></div>
                              {product.status ? 'Active' : 'Inactive'}
                            </span>
                           </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewProduct(product)}
                                className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all duration-200 border border-teal-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() => setEditProduct(product)}
                                className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all duration-200 border border-amber-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200"
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
                              <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <p className="text-slate-500 font-medium">No products found</p>
                              <p className="text-slate-400 text-sm">Try adjusting your search</p>
                            </div>
                           </td>
                         </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Show all items */}
                <div className="lg:hidden p-6 grid gap-4">
                  {filtered.map((product) => (
                    <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-300">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          {product.image ? (
                            <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-16 h-16 rounded-xl object-contain shadow-sm ring-1 ring-slate-200 bg-white" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">N/A</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800 text-base">{product.name}</div>
                          <div className="text-xs text-slate-400 font-medium mb-2">#{product.id}</div>
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[product.category?.name] ?? categoryColors.Default}`}>
                            {product.category?.name ?? '-'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sizes</div>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes?.map((size) => (
                              <span key={size.id} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg">
                                {size.name} <span className="text-teal-600 font-bold ml-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {product.addons?.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Addons</div>
                            <div className="flex flex-wrap gap-2">
                              {product.addons.map((addon) => (
                                <span key={addon.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg">{addon.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          {product.sugar_levels?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sugar</div>
                              <div className="flex flex-wrap gap-1.5">
                                {product.sugar_levels.map((level) => (
                                  <span key={level.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {product.ice_levels?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ice</div>
                              <div className="flex flex-wrap gap-1.5">
                                {product.ice_levels.map((level) => (
                                  <span key={level.id} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{level.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${product.status ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-teal-500' : 'bg-slate-400'}`}></div>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setViewProduct(product)} className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-all border border-teal-200">View</button>
                          <button onClick={() => setEditProduct(product)} className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all border border-amber-200">Edit</button>
                          <button onClick={() => handleDelete(product.id, product.name)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-200">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-slate-900 font-bold text-lg">No products found</p>
                        <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {lastPage > 1 && !loading && !error && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 rounded-b-3xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="text-sm text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-700">{from}</span> to <span className="font-bold text-slate-700">{to}</span> of <span className="font-bold text-slate-700">{total}</span> products
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => fetchProducts(page - 1)}
                          disabled={page <= 1}
                          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${page <= 1 ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
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
                                <span key={`e${i}`} className="px-3 py-2 text-sm text-slate-400 font-bold">...</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => fetchProducts(item)}
                                  className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 ${item === page ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
                                >
                                  {item}
                                </button>
                              )
                            )}
                        </div>
                        <button
                          onClick={() => fetchProducts(page + 1)}
                          disabled={page >= lastPage}
                          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${page >= lastPage ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-8 py-5 flex items-center justify-between z-10 shrink-0">
              <h2 className="text-white text-xl font-bold tracking-tight">
                Product Details
              </h2>
              <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative shrink-0">
                  {viewProduct.image ? (
                    <img src={`${viewProduct.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${viewProduct.image}`} alt={viewProduct.name} className="w-28 h-28 rounded-2xl object-contain shadow-lg ring-1 ring-slate-200 bg-white" />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-400 font-medium">N/A</div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{viewProduct.name}</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1 font-medium">#{viewProduct.id}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[viewProduct.category?.name] ?? categoryColors.Default}`}>
                      {viewProduct.category?.name ?? '-'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${viewProduct.status ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${viewProduct.status ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`}></div>
                      {viewProduct.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {viewProduct.description && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Description</div>
                  <p className="text-slate-700 leading-relaxed font-medium text-sm">{viewProduct.description}</p>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Sizes & Pricing</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {viewProduct.sizes?.length ? viewProduct.sizes.map((size) => (
                    <div key={size.id} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                      <div className="font-semibold text-slate-800 text-sm">{size.name}</div>
                      <div className="text-teal-600 font-bold text-lg mt-1">${Number(size.pivot?.price ?? 0).toFixed(2)}</div>
                    </div>
                  )) : <p className="text-slate-400 col-span-full text-center py-2 font-medium text-sm">No sizes available</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {viewProduct.addons?.length > 0 && (
                  <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2.5">Addons</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.addons.map((addon) => (
                        <span key={addon.id} className="bg-white text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{addon.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.sugar_levels?.length > 0 && (
                  <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2.5">Sugar Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.sugar_levels.map((level) => (
                        <span key={level.id} className="bg-white text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {viewProduct.ice_levels?.length > 0 && (
                  <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-200">
                    <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-2.5">Ice Levels</div>
                    <div className="flex flex-wrap gap-2">
                      {viewProduct.ice_levels.map((level) => (
                        <span key={level.id} className="bg-white text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">{level.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setViewProduct(null)}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => { const p = viewProduct; setViewProduct(null); setEditProduct(p) }}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 shadow-md transition-all duration-300"
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