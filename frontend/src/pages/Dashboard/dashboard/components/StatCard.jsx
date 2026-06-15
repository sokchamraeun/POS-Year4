const config = {
  revenue:   { accent: 'bg-emerald-500', text: 'text-emerald-500' },
  paid:      { accent: 'bg-green-500',   text: 'text-green-500' },
  unpaid:    { accent: 'bg-orange-400',  text: 'text-orange-400' },
  orders:    { accent: 'bg-blue-500',    text: 'text-blue-500' },
  pending:   { accent: 'bg-amber-400',   text: 'text-amber-500' },
  completed: { accent: 'bg-amber-500',    text: 'text-amber-500' },
  products:  { accent: 'bg-indigo-500',  text: 'text-indigo-500' },
  stock:     { accent: 'bg-rose-500',    text: 'text-rose-500' },
  customers: { accent: 'bg-pink-500',    text: 'text-pink-500' },
  profit:    { accent: 'bg-violet-500',  text: 'text-violet-500' },
}

export default function StatCard({ stat }) {
  const c = config[stat.type] ?? config.orders

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 overflow-hidden">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 truncate">
        {stat.label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-800 leading-none">
        {stat.value}
      </p>

      <p className={`mt-3 text-xs font-medium ${c.text} border-t border-slate-100 pt-3`}>
        {stat.change}
      </p>
    </div>
  )
}
