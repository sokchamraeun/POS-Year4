import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const initialItems = [
  { name: 'Coffee Beans', category: 'Raw Material', stock: 25, min: 10, unit: 'kg' },
  { name: 'Milk', category: 'Dairy', stock: 8, min: 15, unit: 'L' },
  { name: 'Sugar', category: 'Raw Material', stock: 30, min: 10, unit: 'kg' },
  { name: 'Whipped Cream', category: 'Topping', stock: 5, min: 10, unit: 'cans' },
  { name: 'Caramel Syrup', category: 'Syrup', stock: 12, min: 5, unit: 'bottles' },
  { name: 'Vanilla Syrup', category: 'Syrup', stock: 3, min: 5, unit: 'bottles' },
  { name: 'Chocolate Syrup', category: 'Syrup', stock: 7, min: 5, unit: 'bottles' },
  { name: 'Cups (Small)', category: 'Packaging', stock: 200, min: 100, unit: 'pcs' },
  { name: 'Cups (Large)', category: 'Packaging', stock: 150, min: 100, unit: 'pcs' },
  { name: 'Straws', category: 'Packaging', stock: 500, min: 200, unit: 'pcs' },
]

const defaultForm = { name: '', category: '', stock: '', min: '', unit: '' }

export default function Inventory() {
  const [items, setItems] = useState(initialItems)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const lowStock = items.filter((i) => i.stock < i.min)

  function handleAdd() {
    const newItem = {
      name: form.name,
      category: form.category,
      stock: Number(form.stock),
      min: Number(form.min),
      unit: form.unit,
    }
    setItems([newItem, ...items])
    setForm(defaultForm)
    setShowModal(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Item
            </button>
          </div>

          {lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-red-700">
                <strong>{lowStock.length}</strong> item{lowStock.length > 1 ? 's' : ''} below minimum stock level. Please restock soon.
              </span>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50">
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Min Level</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Unit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const pct = Math.min((item.stock / item.min) * 100, 100)
                  const status = item.stock < item.min ? 'Low Stock' : item.stock >= item.min * 2 ? 'Overstock' : 'Normal'
                  const statusColor = status === 'Low Stock' ? 'text-red-600 bg-red-100' : status === 'Overstock' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
                  return (
                    <tr key={item.name} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                      <td className="px-6 py-4 text-gray-500">{item.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.stock < item.min ? 'bg-red-500' : item.stock >= item.min * 2 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-gray-800 font-medium">{item.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.min}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.unit}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Add Inventory Item</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number" min="0" value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
                      <input
                        type="number" min="0" value={form.min}
                        onChange={(e) => setForm({ ...form, min: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text" value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
