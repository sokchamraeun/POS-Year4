import { ResponsiveContainer } from 'recharts'
import Card from './Card.jsx'

export default function ChartCard({
  title,
  subtitle,
  height = 320,
  children,
}) {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className="
        group flex h-full flex-col overflow-hidden rounded
        border border-slate-200 bg-white shadow-sm
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
      "
    >
      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        <div
          className="
            relative flex-1 overflow-hidden rounded
            border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-teal-50/40
            p-3 sm:p-4
          "
          style={{ height }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}