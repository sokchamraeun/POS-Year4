import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import ChartCard from '../components/ChartCard.jsx'
import SmallList from '../components/SmallList.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import Pagination from '../components/Pagination.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { money, formatDate, printOrderReceipt } from '../utils/reportHelpers.js'

export default function SalesReport({ data, orders = [], pagination = {}, ordersLoading = false, page = 1, onPageChange }) {
  const {
    total_sales,
    total_orders,
    paid_orders,
    unpaid_orders,
    refund_orders,
    avg_order_value,
    total_cost,
    total_profit,
    total_discount,
    paid_amount,
    unpaid_amount,
    refund_amount,
    daily = [],
    payment_methods = [],
    best_sellers = [],
  } = data || {}

  const chartData = daily.map(row => ({
    date: row.date,
    Revenue: Number(row.revenue || 0),
    Orders: Number(row.orders || 0),
  }))

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Sales" value={money(total_sales)} tone="green" />
        <MetricCard label="Total Profit" value={money(total_profit)} sub={`Cost ${money(total_cost)}`} tone="teal" />
        <MetricCard label="Total Orders" value={total_orders ?? 0} sub={`${paid_orders ?? 0} paid`} tone="blue" />
        <MetricCard label="Average Order" value={money(avg_order_value)} tone="orange" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Paid Amount" value={money(paid_amount)} sub={`${paid_orders ?? 0} orders`} tone="green" />
        <MetricCard label="Unpaid Amount" value={money(unpaid_amount)} sub={`${unpaid_orders ?? 0} orders`} tone="orange" />
        <MetricCard label="Refund Amount" value={money(refund_amount)} sub={`${refund_orders ?? 0} orders`} tone="red" />
        <MetricCard label="Total Discount" value={money(total_discount)} tone="slate" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {chartData.length > 0 ? (
            <ChartCard title="Daily Sales" subtitle="Revenue trend by day">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={value => money(value)} />
                <Line type="monotone" dataKey="Revenue" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartCard>
          ) : (
            <Card title="Daily Sales">
              <div className="p-6">
                <EmptyState title="No sales data" text="No sales found for selected period." />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <SmallList
            title="Payment Methods"
            items={payment_methods.map(row => ({
              label: row.payment_method || 'Unknown',
              value: money(row.revenue),
              sub: `${row.count ?? 0} orders`,
            }))}
          />

          <SmallList
            title="Best Sellers"
            items={best_sellers.slice(0, 5).map((row, index) => ({
              label: `${index + 1}. ${row.product?.name || 'Unknown'}`,
              value: `${row.total_qty ?? 0} sold`,
              sub: money(row.revenue),
            }))}
          />
        </div>
      </div>

      <Card title="Sales Detail" subtitle="Per-order sales with cost and profit">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-black">Order</th>
                <th className="px-4 py-3 text-left font-black">Date</th>
                <th className="px-4 py-3 text-left font-black">Customer</th>
                <th className="px-4 py-3 text-left font-black">Staff</th>
                <th className="px-4 py-3 text-left font-black">Table</th>
                <th className="px-4 py-3 text-left font-black">Method</th>
                <th className="px-4 py-3 text-left font-black">Status</th>
                <th className="px-4 py-3 text-right font-black">Discount</th>
                <th className="px-4 py-3 text-right font-black">Total</th>
                <th className="px-4 py-3 text-right font-black">Cost</th>
                <th className="px-4 py-3 text-right font-black">Profit</th>
                <th className="px-4 py-3 text-center font-black">Action</th>
              </tr>
            </thead>

            <tbody>
              {ordersLoading && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-slate-400">Loading orders...</td>
                </tr>
              )}

              {!ordersLoading && orders.map(row => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="px-4 py-3 font-black text-slate-800">#{row.id}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 text-slate-700">{row.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{row.staff}</td>
                  <td className="px-4 py-3 text-slate-600">{row.table}</td>
                  <td className="px-4 py-3 text-slate-600">{row.payment_method}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.payment_status} /></td>
                  <td className="px-4 py-3 text-right text-slate-600">{money(row.discount)}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{money(row.total)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{money(row.cost)}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">{money(row.profit)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => printOrderReceipt(row)}
                      className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700 transition-colors hover:bg-teal-100"
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}

              {!ordersLoading && !orders.length && (
                <tr>
                  <td colSpan={12} className="px-4 py-10 text-center text-slate-400">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        page={page}
        lastPage={pagination.last_page}
        onPageChange={onPageChange}
        loading={ordersLoading}
      />
    </>
  )
}
