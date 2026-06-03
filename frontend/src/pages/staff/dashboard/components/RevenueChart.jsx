// src/pages/staff/dashboard/components/RevenueChart.jsx
import { useState } from 'react'
import {
  periods,
  SVG_WIDTH,
  SVG_HEIGHT,
  PAD,
  plotW,
  plotH,
} from '../utils/constants'

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

  const xCenter = (i) => PAD.left + (i + 0.5) * (plotW / (data.length || 1))

  const formatCurrency = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${Number(value).toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/10 p-6 sm:p-8 flex flex-col flex-1 border border-teal-800/30 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20">
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Revenue & Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Performance overview over time.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex rounded-2xl border border-cyan-200 bg-cyan-50/70 p-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  period === p.key
                    ? 'bg-cyan-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-cyan-800'
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
                className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-cyan-700"
              />

              <span className="text-xs font-semibold text-slate-400">to</span>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-cyan-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* <div className="mb-5 grid grid-cols-2 gap-3">
        <SummaryBox
          label="Revenue"
          value={formatCurrency(totalRevenue)}
        />

        <SummaryBox
          label="Orders"
          value={totalOrders}
        />
      </div> */}

      <div className="mb-4 flex items-center gap-5 text-xs">
        <LegendDot className="bg-red-700" label="Revenue" />
        <LegendDot className="bg-yellow-500" label="Orders" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/40 to-white p-3">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[600px]"
          style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}
        >
          <defs>
            <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8f989b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.03" />
            </linearGradient>

            <linearGradient id="ordersArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="#ffffff"
            rx="12"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <g key={frac}>
              <line
                x1={PAD.left}
                y1={PAD.top + plotH * (1 - frac)}
                x2={SVG_WIDTH - PAD.right}
                y2={PAD.top + plotH * (1 - frac)}
                stroke="#bae6fd"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              <text
                x={PAD.left - 10}
                y={PAD.top + plotH * (1 - frac) + 4}
                textAnchor="end"
                fill="#0891b2"
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
            stroke="#7dd3fc"
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
              fill="#0891b2"
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
        stroke="#ff0000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d={ordersLine}
        fill="none"
        stroke="#eeff00"
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
          fill={hoverIdx === index ? '#0891b2' : '#ffffff'}
          stroke="#0891b2"
          strokeWidth="2"
        />
      ))}

      {orderPoints.map((point, index) => (
        <circle
          key={`order-${index}`}
          cx={point.x}
          cy={point.y}
          r={hoverIdx === index ? 5 : 3.5}
          fill={hoverIdx === index ? '#06b6d4' : '#ffffff'}
          stroke="#06b6d4"
          strokeWidth="2"
        />
      ))}

      {data.map((d, i) => (
        <text
          key={d.label}
          x={xCenter(i)}
          y={SVG_HEIGHT - 8}
          textAnchor="middle"
          fill={hoverIdx === i ? '#155e75' : '#0891b2'}
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
            stroke="#0891b2"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          <rect
            x={hoveredPoint.x - 70}
            y={PAD.top + 5}
            width="140"
            height="58"
            rx="12"
            fill="#0e7490"
            opacity="0.96"
          />

          <text
            x={hoveredPoint.x}
            y={PAD.top + 23}
            textAnchor="middle"
            fill="#ecfeff"
            fontSize="11"
            fontWeight="700"
          >
            {hoveredPoint.label}
          </text>

          <text
            x={hoveredPoint.x}
            y={PAD.top + 40}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="600"
          >
            Revenue: {formatCurrency(hoveredPoint.revenue)}
          </text>

          <text
            x={hoveredPoint.x}
            y={PAD.top + 53}
            textAnchor="middle"
            fill="#cffafe"
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

// function SummaryBox({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 shadow-sm">
//       <p className="text-xs font-semibold text-cyan-800">
//         {label}
//       </p>

//       <p className="mt-1 text-xl font-bold text-cyan-900">
//         {value}
//       </p>
//     </div>
//   )
// }

function LegendDot({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${className}`} />

      <span className="font-semibold text-cyan-800">
        {label}
      </span>
    </div>
  )
}