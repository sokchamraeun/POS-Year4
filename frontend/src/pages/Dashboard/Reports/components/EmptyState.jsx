export default function EmptyState({ title = 'No data', text = 'No report data available.' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-teal-500" />
      <h3 className="text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  )
}
