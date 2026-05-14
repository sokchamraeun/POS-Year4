import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const initialProducts = [
  { id: 1, name: 'Americano', price: 8.90, category: 'Coffee', stock: 50, status: 'Active' },
  { id: 2, name: 'Caffe Latte', price: 10.90, category: 'Coffee', stock: 40, status: 'Active' },
  { id: 3, name: 'Mocha', price: 12.50, category: 'Coffee', stock: 35, status: 'Active' },
  { id: 4, name: 'Espresso', price: 7.50, category: 'Coffee', stock: 60, status: 'Active' },
  { id: 5, name: 'Cappuccino', price: 11.50, category: 'Coffee', stock: 25, status: 'Inactive' },
  { id: 6, name: 'Caramel Macchiato', price: 13.90, category: 'Coffee', stock: 30, status: 'Active' },
  { id: 7, name: 'Matcha Latte', price: 12.90, category: 'Tea', stock: 20, status: 'Active' },
  { id: 8, name: 'Cold Brew', price: 9.90, category: 'Coffee', stock: 0, status: 'Out of Stock' },
]

const categoryColors = {
  Coffee: 'bg-amber-100 text-amber-700',
  Tea: 'bg-green-100 text-green-700',
}

const statusColors = {
  Active: 'text-green-600 bg-green-100',
  Inactive: 'text-gray-600 bg-gray-100',
  'Out of Stock': 'text-red-600 bg-red-100',
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [products] = useState(initialProducts)

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
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
              <div className="relative flex-1 max-w-sm">
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 font-medium">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[product.category]}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/staff/products/edit/${product.id}`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <button className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
