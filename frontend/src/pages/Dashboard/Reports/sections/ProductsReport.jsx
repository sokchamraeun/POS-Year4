import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Package, ShoppingBag, DollarSign } from 'lucide-react'
import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import ChartCard from '../components/ChartCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { money } from '../utils/reportHelpers.js'

export default function ProductsReport({ data }) {
  const rows = Array.isArray(data) ? data : []

  const totalQty = rows.reduce((sum, row) => sum + Number(row.total_qty || 0), 0)
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0)

  if (!rows.length) {
    return <EmptyState title="No product sales" text="No product sales data for selected period." />
  }

  const topProducts = rows.slice(0, 5).map(row => ({
    name: row.product?.name || 'Unknown',
    Quantity: Number(row.total_qty || 0),
  }))

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Product Rows" value={rows.length} tone="blue" icon={Package} />
        <MetricCard label="Quantity Sold" value={totalQty} tone="teal" icon={ShoppingBag} />
        <MetricCard label="Revenue" value={money(totalRevenue)} tone="green" icon={DollarSign} />
      </div>

      <div className="mb-6">
        <ChartCard title="Top 5 Products" subtitle="By quantity sold">
          <BarChart data={topProducts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="Quantity" fill="#0d9488" />
          </BarChart>
        </ChartCard>
      </div>

      <Card title="Product Sales" subtitle="Sales grouped by product and size">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-teal-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-black">Product</th>
                <th className="px-4 py-3 text-left font-black">Size</th>
                <th className="px-4 py-3 text-right font-black">Qty Sold</th>
                <th className="px-4 py-3 text-right font-black">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="px-4 py-3 font-black text-slate-800">{row.product?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-slate-600">{row.size?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{row.total_qty ?? 0}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{money(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
