import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../../../components/staff/Sidebar.jsx'
import Topbar from '../../../../components/staff/Topbar.jsx'
import Loader from '../../../../components/shared/Loader.jsx'

const API = import.meta.env.VITE_API_URL

export default function ViewProduct() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <Loader text="Loading..." />

  if (!product) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col"><Topbar /><main className="flex-1 p-6 text-center text-gray-500">Product not found.</main></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <Link to="/staff/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">&larr; Back to Products</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              {product.image ? (
                <img src={`${product.image.startsWith('http') ? '' : import.meta.env.VITE_STORAGE_URL + '/'}${product.image}`} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-sm">N/A</div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">{product.name}</h1>
                <span className="text-xs text-gray-400">#{product.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <p className="font-medium text-gray-800">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full mt-1">{product.category?.name}</span>
                </p>
              </div>

              <div>
                <span className="text-gray-500">Status</span>
                <p className="mt-1">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${product.status ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'}`}>
                    {product.status ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              {product.description && (
                <div className="col-span-2">
                  <span className="text-gray-500">Description</span>
                  <p className="font-medium text-gray-800 mt-1">{product.description}</p>
                </div>
              )}

              <div className="col-span-2">
                <span className="text-gray-500">Sizes</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.sizes?.map((size) => (
                    <span key={size.id} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                      {size.name} <span className="text-gray-800 font-medium">${Number(size.pivot?.price ?? 0).toFixed(2)}</span>
                    </span>
                  ))}
                  {!product.sizes?.length && <span className="text-gray-400">—</span>}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-gray-500">Addons</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.addons?.map((addon) => (
                    <span key={addon.id} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
                      {addon.name}
                    </span>
                  ))}
                  {!product.addons?.length && <span className="text-gray-400">—</span>}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-gray-500">Sugar Levels</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.sugar_levels?.map((level) => (
                    <span key={level.id} className="inline-block bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-md">
                      {level.name}
                    </span>
                  ))}
                  {!product.sugar_levels?.length && <span className="text-gray-400">—</span>}
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-gray-500">Ice Levels</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.ice_levels?.map((level) => (
                    <span key={level.id} className="inline-block bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-md">
                      {level.name}
                    </span>
                  ))}
                  {!product.ice_levels?.length && <span className="text-gray-400">—</span>}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Link to={`/staff/products/edit/${product.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
                Edit
              </Link>
              <Link to="/staff/products" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                Back
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
