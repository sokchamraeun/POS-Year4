import { Users, UserPlus, ShoppingBag } from 'lucide-react'
import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import { money, formatDate } from '../utils/reportHelpers.js'

export default function CustomersReport({ data }) {
  const customers = data?.customers || []

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Customers" value={data?.total_customers ?? 0} tone="blue" icon={Users} />
        <MetricCard label="New Customers" value={data?.new_customers ?? 0} tone="teal" icon={UserPlus} />
        <MetricCard label="Guest Orders" value={data?.guest_orders_count ?? 0} sub={money(data?.guest_total_spent)} tone="purple" icon={ShoppingBag} />
      </div>

      <Card title="Customer Report" subtitle="Customer orders, spending, and points">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-teal-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-black">Customer</th>
                <th className="px-4 py-3 text-left font-black">Phone</th>
                <th className="px-4 py-3 text-right font-black">Orders</th>
                <th className="px-4 py-3 text-right font-black">Total Spent</th>
                <th className="px-4 py-3 text-right font-black">Points</th>
                <th className="px-4 py-3 text-left font-black">Registered</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(customer => (
                  <tr key={customer.id ?? 'guest'} className="border-t border-slate-100 hover:bg-teal-50/50">
                  <td className="px-4 py-3 font-black text-slate-800">{customer.name || 'Guest'}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.phone || '—'}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{customer.orders_count ?? 0}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{money(customer.total_spent)}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{customer.points ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {customer.created_at ? formatDate(customer.created_at) : '—'}
                  </td>
                </tr>
              ))}

              {!customers.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No customer data.
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
