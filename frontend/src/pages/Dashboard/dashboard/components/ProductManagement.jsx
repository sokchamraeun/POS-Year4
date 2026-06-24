// src/pages/staff/dashboard/components/ProductManagement.jsx
import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const PERIODS = [
  { key: 'hour', label: 'Hour', ms: 60 * 60 * 1000 },
  { key: 'day', label: 'Day', ms: 24 * 60 * 60 * 1000 },
  { key: 'week', label: 'Week', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: 'month', label: 'Month', ms: 30 * 24 * 60 * 60 * 1000 },
  { key: 'year', label: 'Year', ms: 365 * 24 * 60 * 60 * 1000 },
]

export default function ProductManagement({ products = [], orders = [] }) {
  const productList = Array.isArray(products) ? products : []
  const [period, setPeriod] = useState('day')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Total sales price + quantity sold per product, top 8 by total price.
  const data = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : []
    const isCustom = period === 'custom'
    const windowMs = (PERIODS.find((p) => p.key === period) ?? PERIODS[1]).ms
    const times = orderList
      .map((o) => new Date(o.created_at ?? '').getTime())
      .filter((t) => !isNaN(t))
    // Reference "now" off the most recent order so filtering stays pure.
    const ref = times.length ? Math.max(...times) : 0
    const cutoff = ref - windowMs
    const map = {}
    for (const o of orderList) {
      const day = (o.created_at ?? '').slice(0, 10)
      if (isCustom) {
        if (fromDate && day < fromDate) continue
        if (toDate && day > toDate) continue
      } else {
        const t = new Date(o.created_at ?? '').getTime()
        if (isNaN(t) || t < cutoff) continue
      }
      for (const i of o.items ?? []) {
        const name = i.product?.name ?? i.name ?? 'Unknown'
        if (!map[name]) map[name] = { name, total: 0, qty: 0 }
        const sub = Number(i.subtotal ?? Number(i.unit_price ?? 0) * Number(i.qty ?? 1))
        map[name].total += sub
        map[name].qty += Number(i.qty ?? 0)
      }
    }
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map((d) => ({ ...d, total: Number(d.total.toFixed(2)) }))
  }, [orders, period, fromDate, toDate])

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Sales</h2>
          <p className="mt-1 text-sm text-slate-500">
            Total price and quantity sold per product
            {period === 'custom'
              ? (fromDate || toDate) ? ` · ${fromDate || '…'} to ${toDate || '…'}` : ' · custom range'
              : ` · last ${(PERIODS.find((p) => p.key === period) ?? PERIODS[1]).label.toLowerCase()}`}.
          </p>
        </div>

        <div className="rounded-2xl bg-teal-700 px-5 py-3 text-right text-white shadow-sm">
          <p className="text-xs font-medium text-teal-100">Products</p>
          <p className="text-3xl font-bold">{productList.length}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              period === p.key
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setPeriod('custom')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            period === 'custom'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Custom
        </button>

        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/30 py-16 text-center">
          <span className="mb-3 text-2xl">📊</span>
          <p className="font-semibold text-slate-700">No sales data yet</p>
          <p className="mt-1 text-sm text-slate-400">Make sales to see product totals.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 50, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#475569' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#475569' }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#475569' }}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, name) =>
                name === 'Total Price' ? [`$${Number(value).toFixed(2)}`, name] : [value, name]
              }
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="left"
              dataKey="total"
              name="Total Price"
              fill="#0d9488"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="qty"
              name="Qty Sold"
              stroke="#9333ea"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
