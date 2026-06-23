export default function MetricCard({
  label,
  value,
  sub,
  tone = 'teal',
  icon: Icon,
}) {
  const tones = {
    teal: {
      icon: 'text-white',
      iconBox: 'border-teal-500 bg-teal-500 shadow-teal-500/20',
      line: 'bg-slate-200',
    },

    slate: {
      icon: 'text-white',
      iconBox: 'border-slate-800 bg-slate-800 shadow-slate-500/20',
      line: 'bg-slate-200',
    },

    green: {
      icon: 'text-white',
      iconBox: 'border-emerald-500 bg-emerald-500 shadow-emerald-500/20',
      line: 'bg-slate-200',
    },

    orange: {
      icon: 'text-white',
      iconBox: 'border-orange-500 bg-orange-500 shadow-orange-500/20',
      line: 'bg-slate-200',
    },

    red: {
      icon: 'text-white',
      iconBox: 'border-red-500 bg-red-500 shadow-red-500/20',
      line: 'bg-slate-200',
    },

    blue: {
      icon: 'text-white',
      iconBox: 'border-blue-500 bg-blue-500 shadow-blue-500/20',
      line: 'bg-slate-200',
    },
  }

  const currentTone = tones[tone] || tones.teal
  const shortLabel = String(label || 'RP').slice(0, 2).toUpperCase()

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm
        transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg
      "
    >
      <div
        className={`
          absolute left-0 top-0 h-full w-1 transition-all duration-300
          ${currentTone.line}
        `}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          {sub && (
            <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">
              {sub}
            </p>
          )}
        </div>

        <div
          className={`
            flex h-10 min-w-10 items-center justify-center rounded-xl border
            text-sm font-black uppercase shadow-lg transition-all duration-300
            group-hover:scale-110 group-hover:shadow-xl
            ${currentTone.iconBox}
          `}
        >
          {Icon ? (
            <Icon className={`h-5 w-5 ${currentTone.icon}`} />
          ) : (
            <span className={`text-sm font-black ${currentTone.icon}`}>
              {shortLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}