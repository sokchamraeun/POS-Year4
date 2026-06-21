export default function MetricCard({ label, value, sub, tone = 'teal' }) {
  const tones = {
    teal: 'border-teal-200 bg-teal-50 text-teal-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
        </div>

        <div className={`h-12 min-w-12 rounded-2xl border px-3 ${tones[tone] || tones.teal}`}>
          <div className="flex h-full items-center justify-center text-xs font-black uppercase">
            {label.slice(0, 2)}
          </div>
        </div>
      </div>
    </div>
  )
}
