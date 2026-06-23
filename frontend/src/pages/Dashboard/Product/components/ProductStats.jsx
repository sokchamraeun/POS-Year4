export default function ProductStats({ total, categories, activeCount, inactiveCount, promotionCount }) {
  const cards = [
    {
      label: 'Total Products', value: total,
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      iconBox: 'border-teal-500 bg-teal-500 shadow-teal-500/20'
    },
    {
      label: 'Categories', value: categories.length,
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>,
      iconBox: 'border-teal-500 bg-teal-500 shadow-teal-500/20'
    },
    {
      label: 'Active Items', value: activeCount,
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      iconBox: 'border-emerald-500 bg-emerald-500 shadow-emerald-500/20'
    },
    {
      label: 'Inactive Items', value: inactiveCount,
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
      iconBox: 'border-slate-800 bg-slate-800 shadow-slate-500/20'
    },
    {
      label: 'On Promotion', value: promotionCount,
      icon: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      iconBox: 'border-teal-500 bg-teal-500 shadow-teal-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
          <div className="absolute left-0 top-0 h-full w-1 bg-slate-200 transition-all duration-300" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">{card.value}</p>
            </div>
            <div className={`flex h-10 min-w-10 items-center justify-center rounded-xl border shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl ${card.iconBox}`}>
              <span className="text-white">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
