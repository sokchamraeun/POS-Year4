// src/pages/staff/dashboard/components/ProductsList.jsx
export default function ProductsList({ products }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
        <p className="text-gray-400 text-sm">No products yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
      <div className="space-y-3">
        {products.map(p => {
          const pct = p.status ? 100 : 0
          const color = p.status ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'
          return (
            <div key={p.id} className="flex items-center gap-4">
              <span className="text-sm text-gray-700 w-36 truncate">{p.name}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-300`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
              <span className={`text-sm w-10 text-right ${p.status ? 'text-green-600' : 'text-red-600'}`}>
                {p.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}