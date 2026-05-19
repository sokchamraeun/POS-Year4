import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

const API_URL = import.meta.env.VITE_API_URL + '/products'

const categoryColors = {
  Coffee: 'bg-blue-100 text-blue-700',
  Tea: 'bg-green-100 text-green-700',
  Juice: 'bg-orange-100 text-orange-700',
  Smoothie: 'bg-pink-100 text-pink-700',
  Pastry: 'bg-yellow-100 text-yellow-700',
}

export default function Products() {
  const [searchParams] = useSearchParams()
  const updated = searchParams.get('updated')
  const [search, setSearch] = useState('')
  const [viewProduct, setViewProduct] = useState(null)
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
    fetch(`${API_URL}?page=${p}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then((json) => {
        setProducts(json.data ?? json)
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
  }, [updated])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <Link
              to="/staff/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Product
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-xs text-gray-400">{total} product{total !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading products...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm hidden md:table min-w-[900px]">
                  <thead>
                    <tr className="text-gray-500 font-medium border-b border-gray-100">
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Product</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Category</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Sizes</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Addons</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Sugar</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Ice</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Status</th>
                      <th className="px-6 py-3 md:px-3 md:py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                            )}
                            <div>
                              <div className="font-medium text-gray-800">{product.name}</div>
                              <div className="text-xs text-gray-400">#{product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700'}`}>
                            {product.category?.name ?? '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.map((size) => (
                              <span key={size.id} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                {size.name} <span className="text-gray-800 font-medium">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.addons?.length ? (
                              product.addons.map((addon) => (
                                <span key={addon.id} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                  {addon.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.sugar_levels?.length ? (
                              product.sugar_levels.map((level) => (
                                <span key={level.id} className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-md">{level.name}</span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.ice_levels?.length ? (
                              product.ice_levels.map((level) => (
                                <span key={level.id} className="inline-block bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded-md">{level.name}</span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${product.status ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 md:px-3 md:py-3">
                          <div className="flex items-center justify-center gap-1 md:flex-col md:gap-0.5">
                            <button
                              onClick={() => setViewProduct(product)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors md:px-2 md:py-1"
                            >
                              View
                            </button>
                            <Link
                              to={`/staff/products/edit/${product.id}`}
                              className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors md:px-2 md:py-1"
                            >
                              Edit
                            </Link>
                            <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors md:px-2 md:py-1">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="md:hidden space-y-3 p-4">
                  {filtered.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">{product.name}</div>
                          <div className="text-xs text-gray-400">#{product.id}</div>
                        </div>
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[product.category?.name] ?? 'bg-gray-100 text-gray-700'}`}>
                          {product.category?.name ?? '-'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Sizes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.sizes?.map((size) => (
                              <span key={size.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md whitespace-nowrap">
                                {size.name} <span className="text-gray-800 font-medium">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Addons:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.addons?.length ? (
                              product.addons.map((addon) => (
                                <span key={addon.id} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">{addon.name}</span>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Sugar:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.sugar_levels?.length ? (
                              product.sugar_levels.map((level) => (
                                <span key={level.id} className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">{level.name}</span>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Ice:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.ice_levels?.length ? (
                              product.ice_levels.map((level) => (
                                <span key={level.id} className="bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-md">{level.name}</span>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${product.status ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                          {product.status ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link to={`/staff/products/${product.id}`} className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">View</Link>
                          <Link to={`/staff/products/edit/${product.id}`} className="px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">Edit</Link>
                          <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No products found.</div>
                  )}
                </div>
              </div>
            )}

            {lastPage > 1 && !loading && !error && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {from}–{to} of {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchProducts(page - 1)}
                    disabled={page <= 1}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Prev
                  </button>
                  {Array.from({ length: lastPage }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, i) =>
                      item === '...' ? (
                        <span key={`e${i}`} className="px-2 py-1.5 text-xs text-gray-400">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => fetchProducts(item)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${item === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => fetchProducts(page + 1)}
                    disabled={page >= lastPage}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${page >= lastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {viewProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewProduct(null)}>
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Product Details</h2>
            <button onClick={() => setViewProduct(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              {viewProduct.image ? (
                <img src={`${viewProduct.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${viewProduct.image}`} alt={viewProduct.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{viewProduct.name}</h3>
                <span className="text-xs text-gray-400">#{viewProduct.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <p className="mt-1">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {viewProduct.category?.name ?? '-'}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p className="mt-1">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${viewProduct.status ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                    {viewProduct.status ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>

            {viewProduct.description && (
              <div className="text-sm">
                <span className="text-gray-500">Description</span>
                <p className="font-medium text-gray-800 mt-1">{viewProduct.description}</p>
              </div>
            )}

            <div className="text-sm">
              <span className="text-gray-500">Sizes</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {viewProduct.sizes?.length ? viewProduct.sizes.map((size) => (
                  <span key={size.id} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                    {size.name} <span className="text-gray-800 font-medium">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                  </span>
                )) : <span className="text-gray-400">—</span>}
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-500">Addons</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {viewProduct.addons?.length ? viewProduct.addons.map((addon) => (
                  <span key={addon.id} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">{addon.name}</span>
                )) : <span className="text-gray-400">—</span>}
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-500">Sugar Levels</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {viewProduct.sugar_levels?.length ? viewProduct.sugar_levels.map((level) => (
                  <span key={level.id} className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-md">{level.name}</span>
                )) : <span className="text-gray-400">—</span>}
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-500">Ice Levels</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {viewProduct.ice_levels?.length ? viewProduct.ice_levels.map((level) => (
                  <span key={level.id} className="inline-block bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded-md">{level.name}</span>
                )) : <span className="text-gray-400">—</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
            <Link to={`/staff/products/edit/${viewProduct.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
              Edit
            </Link>
            <button onClick={() => setViewProduct(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
