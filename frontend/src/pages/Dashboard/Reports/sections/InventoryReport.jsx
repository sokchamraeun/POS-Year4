import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

export default function InventoryReport({ data }) {
  const ingredients = data?.ingredients || []
  const lowStock = data?.low_stock || []
  const totalIngredients = data?.total_ingredients ?? ingredients.length
  const lowStockCount = data?.low_stock_count ?? lowStock.length

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Ingredients" value={totalIngredients} tone="blue" />
        <MetricCard label="Low Stock" value={lowStockCount} tone={lowStockCount > 0 ? 'red' : 'green'} />
        <MetricCard label="In Stock" value={totalIngredients - lowStockCount} tone="green" />
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <h3 className="mb-3 text-base font-black text-red-800">Low Stock Alerts</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lowStock.map(item => (
              <div key={item.id} className="rounded-2xl border border-red-100 bg-white p-4">
                <p className="font-black text-red-700">{item.name}</p>
                <p className="mt-1 text-sm text-red-600">
                  Left: {Number(item.stock_quantity || 0).toFixed(2)} {item.unit}
                </p>
                <p className="text-xs text-red-400">
                  Reorder at {Number(item.reorder_level || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card title="Inventory Stock" subtitle="Current ingredient stock level">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-black">Ingredient</th>
                <th className="px-5 py-3 text-left font-black">Unit</th>
                <th className="px-5 py-3 text-right font-black">Stock Left</th>
                <th className="px-5 py-3 text-right font-black">Reorder Level</th>
                <th className="px-5 py-3 text-left font-black">Status</th>
                <th className="px-5 py-3 text-right font-black">Transactions</th>
              </tr>
            </thead>

            <tbody>
              {ingredients.map(item => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="px-5 py-4 font-black text-slate-800">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">{item.unit}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{Number(item.stock_quantity || 0).toFixed(2)}</td>
                  <td className="px-5 py-4 text-right text-slate-700">{Number(item.reorder_level || 0).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4 text-right text-slate-600">{item.transactions_count ?? 0}</td>
                </tr>
              ))}

              {!ingredients.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No ingredients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
