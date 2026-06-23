export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-100 px-5 py-4">
          {title && <h2 className="text-lg font-black text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}

      {children}
    </div>
  )
}
