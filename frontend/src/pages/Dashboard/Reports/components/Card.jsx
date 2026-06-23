export default function Card({ title, subtitle, value, children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || subtitle || value) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {value && (
            <p className="whitespace-nowrap text-2xl font-black text-slate-900">{value}</p>
          )}
        </div>
      )}

      {children}
    </div>
  )
}
