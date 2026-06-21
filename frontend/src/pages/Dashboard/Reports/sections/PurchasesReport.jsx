import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import { formatDate } from '../utils/reportHelpers.js'

export default function PurchasesReport({ data }) {
  const transactions = data?.transactions || []
  const summary = data?.summary || {}
  const pagination = data?.pagination || {}

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Purchases" value={summary.total_transactions ?? 0} tone="blue" />
        <MetricCard label="Quantity" value={Number(summary.total_quantity || 0).toFixed(2)} tone="teal" />
      </div>

      <Card title="Purchase Transactions" subtitle="Ingredient stock-in history">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-5 py-3 text-left font-black">Date</th>
                <th className="px-5 py-3 text-left font-black">Ingredient</th>
                <th className="px-5 py-3 text-right font-black">Quantity</th>
                <th className="px-5 py-3 text-left font-black">Note</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="px-5 py-4 text-xs text-slate-500">{formatDate(tx.created_at)}</td>
                  <td className="px-5 py-4 font-black text-slate-800">{tx.ingredient?.name || '—'}</td>
                  <td className="px-5 py-4 text-right font-black text-emerald-700">
                    +{Number(tx.quantity || 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{tx.note || '—'}</td>
                </tr>
              ))}

              {!transactions.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination.last_page > 1 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-bold text-slate-500">
          Page {pagination.current_page} of {pagination.last_page}
        </div>
      )}
    </>
  )
}
