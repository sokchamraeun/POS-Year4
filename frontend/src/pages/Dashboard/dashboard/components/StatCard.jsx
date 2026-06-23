import {
  DollarSign,
  Wallet,
  Clock,
  ShoppingCart,
  CheckCircle,
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  RotateCcw,
} from 'lucide-react'

const iconMap = {
  revenue:   DollarSign,
  paid:      Wallet,
  unpaid:    Clock,
  orders:    ShoppingCart,
  pending:   RotateCcw,
  completed: CheckCircle,
  products:  Package,
  stock:     AlertTriangle,
  customers: Users,
  profit:    TrendingUp,
}

const toneMap = {
  revenue:   'green',
  paid:      'green',
  unpaid:    'orange',
  orders:    'blue',
  pending:   'orange',
  completed: 'teal',
  products:  'blue',
  stock:     'red',
  customers: 'blue',
  profit:    'teal',
}

const tones = {
  teal:   { icon: 'text-white', iconBox: 'border-teal-500 bg-teal-500 shadow-teal-500/20', line: 'bg-teal-500' },
  green:  { icon: 'text-white', iconBox: 'border-emerald-500 bg-emerald-500 shadow-emerald-500/20', line: 'bg-emerald-500' },
  orange: { icon: 'text-white', iconBox: 'border-orange-500 bg-orange-500 shadow-orange-500/20', line: 'bg-orange-500' },
  red:    { icon: 'text-white', iconBox: 'border-red-500 bg-red-500 shadow-red-500/20', line: 'bg-red-500' },
  blue:   { icon: 'text-white', iconBox: 'border-blue-500 bg-blue-500 shadow-blue-500/20', line: 'bg-blue-500' },
}

export default function StatCard({ stat }) {
  const Icon = iconMap[stat.type] ?? ShoppingCart
  const currentTone = tones[toneMap[stat.type]] ?? tones.blue

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
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
            {stat.label}
          </p>

          <p className="mt-2 truncate text-3xl font-black tracking-tight text-slate-900">
            {stat.value}
          </p>

          <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-400">
            {stat.change}
          </p>
        </div>

        <div
          className={`
            flex h-10 min-w-10 items-center justify-center rounded-xl border
            text-sm font-black uppercase shadow-lg transition-all duration-300
            group-hover:scale-110 group-hover:shadow-xl
            ${currentTone.iconBox}
          `}
        >
          <Icon className={`h-5 w-5 ${currentTone.icon}`} />
        </div>
      </div>
    </div>
  )
}
