import Card from './Card.jsx'

function barClass(type) {
  const value = String(type || '').toLowerCase()

  if (value.includes('paid')) return 'bg-emerald-500'
  if (value.includes('unpaid')) return 'bg-orange-500'
  if (value.includes('refund')) return 'bg-red-500'
  if (value.includes('cash')) return 'bg-emerald-500'
  if (value.includes('khqr')) return 'bg-blue-500'
  if (value.includes('card')) return 'bg-violet-500'

  return 'bg-teal-600'
}

export default function PaymentCard({ title, rows }) {
  return (
    <Card title={title}>
      {rows.length > 0 ? (
        <div className="space-y-5 p-5">
          {rows.map((row, index) => (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black capitalize text-slate-800">{row.label}</p>
                  <p className="text-xs text-slate-400">{row.sub}</p>
                </div>

                <p className="text-sm font-black text-slate-900">{row.value}</p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${barClass(row.type)}`}
                  style={{ width: `${Math.min(row.percent, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-10 text-center text-sm text-slate-400">No payment data.</p>
      )}
    </Card>
  )
}
