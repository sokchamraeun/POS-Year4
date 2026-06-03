// src/pages/staff/dashboard/components/StatCard.jsx

export default function StatCard({ stat }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 h-1 w-full bg-teal-500" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {stat.label}
          </p>

          <h3 className="mt-3 text-3xl font-bold text-slate-900">
            {stat.value}
          </h3>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
          <div className="h-3 w-3 rounded-full bg-teal-500" />
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
          {stat.change}
        </span>
      </div>
    </div>
  )
}