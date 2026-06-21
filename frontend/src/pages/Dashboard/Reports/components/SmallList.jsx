import Card from './Card.jsx'

export default function SmallList({ title, items }) {
  return (
    <Card title={title}>
      {items?.length > 0 ? (
        <div className="space-y-4 p-5">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-black capitalize text-slate-800">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.sub}</p>
              </div>

              <p className="whitespace-nowrap text-sm font-black text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-slate-400">No data.</p>
      )}
    </Card>
  )
}
