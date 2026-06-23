import { Wallet, Clock, RotateCcw } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import MetricCard from '../components/MetricCard.jsx'
import Card from '../components/Card.jsx'
import ChartCard from '../components/ChartCard.jsx'
import PaymentCard from '../components/PaymentCard.jsx'
import { CHART_COLORS } from '../constants/reportConstants.js'
import { money, percent } from '../utils/reportHelpers.js'

export default function PaymentsReport({ data }) {
  const byMethod = data?.by_method || []
  const byStatus = data?.by_status || []

  const totalRevenue = byMethod.reduce((sum, row) => sum + Number(row.revenue || 0), 0)
  const totalOrders = byStatus.reduce((sum, row) => sum + Number(row.count || 0), 0)

  const pieData = byMethod.map(row => ({
    name: row.payment_method || 'Unknown',
    value: Number(row.revenue || 0),
  }))

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Paid Amount" value={money(data?.paid_amount)} tone="green" icon={Wallet} />
        <MetricCard label="Unpaid Amount" value={money(data?.unpaid_amount)} tone="orange" icon={Clock} />
        <MetricCard label="Refund Amount" value={money(data?.refund_amount)} tone="red" icon={RotateCcw} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <PaymentCard
            title="Revenue by Payment Method"
            rows={byMethod.map(row => ({
              label: row.payment_method || 'Unknown',
              value: money(row.revenue),
              sub: `${row.count ?? 0} orders`,
              percent: totalRevenue > 0 ? (Number(row.revenue || 0) / totalRevenue) * 100 : 0,
              type: row.payment_method,
            }))}
          />

          <PaymentCard
            title="Payment Status Breakdown"
            rows={byStatus.map(row => ({
              label: row.payment_status || 'Unknown',
              value: `${row.count ?? 0} orders`,
              sub: totalOrders > 0 ? percent((Number(row.count || 0) / totalOrders) * 100) : '0%',
              percent: totalOrders > 0 ? (Number(row.count || 0) / totalOrders) * 100 : 0,
              type: row.payment_status,
            }))}
          />
        </div>

        {pieData.length > 0 ? (
          <ChartCard title="Payment Method Share" subtitle="By revenue" height={360}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={entry => entry.name}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={value => money(value)} />
              <Legend />
            </PieChart>
          </ChartCard>
        ) : (
          <Card title="Payment Method Share">
            <p className="p-10 text-center text-sm text-slate-400">No payment data.</p>
          </Card>
        )}
      </div>
    </>
  )
}
