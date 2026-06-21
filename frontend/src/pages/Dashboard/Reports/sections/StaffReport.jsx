import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { money } from '../utils/reportHelpers.js'

export default function StaffReport({ data }) {
  const rows = data?.staff || []

  const totalOrders = rows.reduce((sum, row) => sum + Number(row.orders_count || 0), 0)
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Staff Members" value={rows.length} tone="blue" />
        <MetricCard label="Total Orders" value={totalOrders} tone="teal" />
        <MetricCard label="Total Sales" value={money(totalRevenue)} tone="green" />
      </div>

      <Card title="Staff Performance" subtitle="Orders and sales by cashier">
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-5 py-3 text-left font-black">Staff</th>
                  <th className="px-5 py-3 text-left font-black">Role</th>
                  <th className="px-5 py-3 text-right font-black">Orders</th>
                  <th className="px-5 py-3 text-right font-black">Revenue</th>
                  <th className="px-5 py-3 text-right font-black">Discount Given</th>
                  <th className="px-5 py-3 text-right font-black">Refunds</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id || index} className="border-t border-slate-100 hover:bg-teal-50/50">
                    <td className="px-5 py-4 font-black text-slate-800">{row.name || 'Unknown'}</td>
                    <td className="px-5 py-4 text-slate-600 capitalize">{row.role || '—'}</td>
                    <td className="px-5 py-4 text-right text-slate-700">{row.orders_count ?? 0}</td>
                    <td className="px-5 py-4 text-right font-black text-slate-900">{money(row.revenue)}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{money(row.total_discount)}</td>
                    <td className="px-5 py-4 text-right text-slate-600">{row.refund_orders ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No staff sales yet"
              text="Orders placed by a logged-in cashier will appear here. Older orders created before staff tracking won't have a cashier."
            />
          </div>
        )}
      </Card>
    </>
  )
}
