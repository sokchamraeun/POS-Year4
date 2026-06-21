export default function StatusBadge({ status }) {
  const text = String(status || 'Unknown')
  const lower = text.toLowerCase()

  let className = 'bg-slate-100 text-slate-700'

  if (lower.includes('in stock')) className = 'bg-emerald-100 text-emerald-700'
  if (lower.includes('low')) className = 'bg-orange-100 text-orange-700'
  if (lower.includes('out')) className = 'bg-red-100 text-red-700'
  if (lower.includes('paid')) className = 'bg-emerald-100 text-emerald-700'
  if (lower.includes('unpaid')) className = 'bg-orange-100 text-orange-700'
  if (lower.includes('refund')) className = 'bg-red-100 text-red-700'

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {text}
    </span>
  )
}
