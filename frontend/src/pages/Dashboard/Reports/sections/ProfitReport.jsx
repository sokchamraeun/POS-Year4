import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TrendingUp, DollarSign, Percent, Tag, RotateCcw, TrendingDown } from 'lucide-react'
import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import ChartCard from '../components/ChartCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { money, percent } from '../utils/reportHelpers.js'

export default function ProfitReport({ data }) {
  const monthly = data?.monthly || []

  const chartData = monthly.map(row => ({
    month: row.month,
    Revenue: Number(row.revenue || 0),
    Profit: Number(row.profit || 0),
  }))

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue" value={money(data?.revenue)} tone="green" icon={TrendingUp} />
        <MetricCard label="Total Cost" value={money(data?.cost)} tone="orange" icon={DollarSign} />
        <MetricCard label="Gross Profit" value={money(data?.gross_profit)} tone="teal" icon={TrendingUp} />
        <MetricCard label="Profit Margin" value={percent(data?.margin)} tone="blue" icon={Percent} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Net Profit" value={money(data?.net_profit)} sub="After refunds" tone="green" icon={TrendingDown} />
        <MetricCard label="Total Discount" value={money(data?.discount)} tone="slate" icon={Tag} />
        <MetricCard label="Refund" value={money(data?.refund)} tone="red" icon={RotateCcw} />
      </div>

      <div className="mb-6">
        <ChartCard title="Profit by Month" subtitle="Revenue vs profit">
          {chartData.length > 0 ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip formatter={value => money(value)} />
              <Legend />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Profit" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">No monthly data for selected period.</p>
            </div>
          )}
        </ChartCard>
      </div>

      <Card title="Monthly Profit" subtitle="Revenue, cost, and profit by month">
        {monthly.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-teal-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-black">Month</th>
                  <th className="px-4 py-3 text-right font-black">Revenue</th>
                  <th className="px-4 py-3 text-right font-black">Cost</th>
                  <th className="px-4 py-3 text-right font-black">Discount</th>
                  <th className="px-4 py-3 text-right font-black">Profit</th>
                </tr>
              </thead>

              <tbody>
                {monthly.map(row => (
                  <tr key={row.month} className="border-t border-slate-100 hover:bg-teal-50/50">
                    <td className="px-4 py-3 font-black text-slate-800">{row.month}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{money(row.revenue)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{money(row.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{money(row.discount)}</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">{money(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <EmptyState title="No profit data" text="No revenue found for selected period." />
          </div>
        )}
      </Card>
    </>
  )
}
