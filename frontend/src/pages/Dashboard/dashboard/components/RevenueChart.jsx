import { useState } from 'react'
import {
  periods,
  SVG_WIDTH,
  SVG_HEIGHT,
  PAD,
  plotW,
  plotH,
} from '../utils/constants'

const REVENUE_COLOR = '#0d9488'
const ORDERS_COLOR = '#f59e0b'

const SUBTITLES = {
  hourly: "Today's performance broken down by the hour.",
  daily: 'Daily performance over the last 7 days.',
  monthly: 'Monthly performance over time.',
  yearly: 'Yearly performance over time.',
  custom: 'Performance within your selected date range.',
}

export default function RevenueChart({
  period,
  setPeriod,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  data = [],
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const maxVal =
    data.length > 0
      ? Math.max(
          ...data.flatMap((d) => [
            Number(d.revenue ?? 0),
            Number(d.orders ?? 0),
          ])
        ) * 1.2
      : 1

  const totalRevenue = data.reduce((sum, d) => sum + Number(d.revenue ?? 0), 0)
  const totalOrders = data.reduce((sum, d) => sum + Number(d.orders ?? 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const peakRevenue = data.reduce((max, d) => Math.max(max, Number(d.revenue ?? 0)), 0)

  const xCenter = (i) => PAD.left + (i + 0.5) * (plotW / (data.length || 1))

  const formatCurrency = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${Number(value).toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-amber-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Revenue & Orders
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {SUBTITLES[period] ?? 'Performance overview over time.'}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex rounded-2xl border border-amber-200 bg-amber-50/70 p-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === p.key
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-amber-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
              />
              <span className="text-xs font-semibold text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-teal-600"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryBox label="Total Revenue" value={formatCurrency(totalRevenue)} color={REVENUE_COLOR} />
        <SummaryBox label="Total Orders" value={totalOrders} color={ORDERS_COLOR} />
        <SummaryBox label="Avg Order Value" value={formatCurrency(avgOrderValue)} color={REVENUE_COLOR} />
        <SummaryBox label={period === 'hourly' ? 'Peak Hour' : 'Peak Revenue'} value={formatCurrency(peakRevenue)} color={ORDERS_COLOR} />
      </div>

      <div className="mb-4 flex items-center gap-5 text-xs">
        <LegendDot color={REVENUE_COLOR} label="Revenue" />
        <LegendDot color={ORDERS_COLOR} label="Orders" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amber-100 bg-white p-3">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[600px]"
          style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}
        >
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={REVENUE_COLOR} stopOpacity="0.25" />
              <stop offset="100%" stopColor={REVENUE_COLOR} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ORDERS_COLOR} stopOpacity="0.25" />
              <stop offset="100%" stopColor={ORDERS_COLOR} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="#fafaf9"
            rx="12"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <g key={frac}>
              <line
                x1={PAD.left}
                y1={PAD.top + plotH * (1 - frac)}
                x2={SVG_WIDTH - PAD.right}
                y2={PAD.top + plotH * (1 - frac)}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={PAD.left - 10}
                y={PAD.top + plotH * (1 - frac) + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
              >
                {formatCurrency(maxVal * frac)}
              </text>
            </g>
          ))}

          <line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={SVG_WIDTH - PAD.right}
            y2={PAD.top + plotH}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {data.length > 0 ? (
            <ChartLines
              data={data}
              maxVal={maxVal}
              xCenter={xCenter}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
              formatCurrency={formatCurrency}
            />
          ) : (
            <text
              x={SVG_WIDTH / 2}
              y={SVG_HEIGHT / 2}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="13"
              fontWeight="600"
            >
              No data available
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}

function ChartLines({
  data,
  maxVal,
  xCenter,
  hoveredPoint,
  setHoveredPoint,
  formatCurrency,
}) {
  const revenuePoints = data.map((d, i) => ({
    x: xCenter(i),
    y: PAD.top + plotH - (Number(d.revenue ?? 0) / maxVal) * plotH,
  }))

  const orderPoints = data.map((d, i) => ({
    x: xCenter(i),
    y: PAD.top + plotH - (Number(d.orders ?? 0) / maxVal) * plotH,
  }))

  const getLinePath = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const revenueLine = getLinePath(revenuePoints)
  const ordersLine = getLinePath(orderPoints)

  const revenueArea = `${revenueLine} L${revenuePoints.at(-1).x},${
    PAD.top + plotH
  } L${revenuePoints[0].x},${PAD.top + plotH} Z`

  const ordersArea = `${ordersLine} L${orderPoints.at(-1).x},${
    PAD.top + plotH
  } L${orderPoints[0].x},${PAD.top + plotH} Z`

  const hoverIdx = hoveredPoint
    ? data.findIndex((d) => d.label === hoveredPoint.label)
    : -1

  return (
    <g>
      <path d={revenueArea} fill="url(#revenueArea)" />
      <path d={ordersArea} fill="url(#ordersArea)" />

      <path
        d={revenueLine}
        fill="none"
        stroke={REVENUE_COLOR}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={ordersLine}
        fill="none"
        stroke={ORDERS_COLOR}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect
        x={PAD.left}
        y={PAD.top}
        width={plotW}
        height={plotH}
        fill="transparent"
        onMouseMove={(e) => {
          const svg = e.currentTarget.ownerSVGElement
          const rect = svg.getBoundingClientRect()
          const mx = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH
          const idx = Math.round(((mx - PAD.left) / plotW) * (data.length - 1))
          const clamped = Math.max(0, Math.min(data.length - 1, idx))
          setHoveredPoint({
            ...data[clamped],
            x: xCenter(clamped),
          })
        }}
        onMouseLeave={() => setHoveredPoint(null)}
      />

      {revenuePoints.map((point, index) => (
        <circle
          key={`revenue-${index}`}
          cx={point.x}
          cy={point.y}
          r={hoverIdx === index ? 5 : 3.5}
          fill={hoverIdx === index ? REVENUE_COLOR : '#ffffff'}
          stroke={REVENUE_COLOR}
          strokeWidth="2"
        />
      ))}

      {orderPoints.map((point, index) => (
        <circle
          key={`order-${index}`}
          cx={point.x}
          cy={point.y}
          r={hoverIdx === index ? 5 : 3.5}
          fill={hoverIdx === index ? ORDERS_COLOR : '#ffffff'}
          stroke={ORDERS_COLOR}
          strokeWidth="2"
        />
      ))}

      {data.map((d, i) => (
        <text
          key={d.label}
          x={xCenter(i)}
          y={SVG_HEIGHT - 8}
          textAnchor="middle"
          fill={hoverIdx === i ? '#1e293b' : '#64748b'}
          fontSize="11"
          fontWeight={hoverIdx === i ? 700 : 500}
        >
          {d.label}
        </text>
      ))}

      {hoveredPoint && (
        <g>
          <line
            x1={hoveredPoint.x}
            y1={PAD.top}
            x2={hoveredPoint.x}
            y2={PAD.top + plotH}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          <rect
            x={hoveredPoint.x - 70}
            y={PAD.top + 5}
            width="140"
            height="58"
            rx="12"
            fill="#1e293b"
            opacity="0.92"
          />

          <text
            x={hoveredPoint.x}
            y={PAD.top + 23}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="11"
            fontWeight="700"
          >
            {hoveredPoint.label}
          </text>

          <text
            x={hoveredPoint.x}
            y={PAD.top + 40}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="600"
          >
            Revenue: {formatCurrency(hoveredPoint.revenue)}
          </text>

          <text
            x={hoveredPoint.x}
            y={PAD.top + 53}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="10"
            fontWeight="600"
          >
            Orders: {hoveredPoint.orders}
          </text>
        </g>
      )}
    </g>
  )
}

function SummaryBox({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-semibold text-slate-600">{label}</span>
    </div>
  )
}
