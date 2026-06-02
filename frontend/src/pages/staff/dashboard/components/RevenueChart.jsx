// src/pages/staff/dashboard/components/RevenueChart.jsx
import { useState } from 'react'
import { periods, SVG_WIDTH, SVG_HEIGHT, PAD, plotW, plotH } from '../utils/constants'

export default function RevenueChart({ period, setPeriod, fromDate, toDate, setFromDate, setToDate, data }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const maxVal = data.length > 0 ? Math.max(...data.flatMap(d => [d.revenue, d.orders])) * 1.2 : 1

  const xCenter = (i) => PAD.left + (i + 0.5) * (plotW / (data.length || 1))

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (period === 'yearly') {
      return `$${Math.round(value / 1000)}k`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-6 flex flex-col flex-1 border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Revenue & Orders
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Performance overview over time</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  period === p.key
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
              />
              <span className="text-xs text-slate-400 font-medium">→</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500 shadow-sm" />
          <span className="text-slate-600 font-medium">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm" />
          <span className="text-slate-600 font-medium">Orders</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full min-w-[600px]" style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}>
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ordArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#fafafa" rx={8} />

          {[0, 0.25, 0.5, 0.75, 1].map(frac => (
            <g key={frac}>
              <line 
                x1={PAD.left} 
                y1={PAD.top + plotH * (1 - frac)}
                x2={SVG_WIDTH - PAD.right} 
                y2={PAD.top + plotH * (1 - frac)}
                stroke="#e2e8f0" 
                strokeWidth={1} 
                strokeDasharray="4,4" 
              />
              <text 
                x={PAD.left - 10} 
                y={PAD.top + plotH * (1 - frac) + 4}
                textAnchor="end" 
                fill="#94a3b8" 
                fontSize={10}
                fontWeight={500}
              >
                {period === 'yearly' ? `$${Math.round(maxVal * frac / 1000)}k` : formatCurrency(maxVal * frac)}
              </text>
            </g>
          ))}

          {/* Bottom axis */}
          <line 
            x1={PAD.left} 
            y1={PAD.top + plotH} 
            x2={SVG_WIDTH - PAD.right} 
            y2={PAD.top + plotH}
            stroke="#cbd5e1" 
            strokeWidth={1.5} 
            strokeLinecap="round"
          />

          {data.length > 0 && (
            <ChartLines 
              data={data} 
              maxVal={maxVal} 
              xCenter={xCenter}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
              period={period}
            />
          )}

          {data.length === 0 && (
            <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#94a3b8" fontSize={13} fontWeight={500}>
              No data available for this period
            </text>
          )}
        </svg>
      </div>
    </div>
  )
}

function ChartLines({ data, maxVal, xCenter, hoveredPoint, setHoveredPoint, period }) {
  const points = data.map((d, i) => ({
    x: xCenter(i),
    y: PAD.top + plotH - (d.revenue / maxVal) * plotH,
  }))
  
  const ordPoints = data.map((d, i) => ({
    x: xCenter(i),
    y: PAD.top + plotH - (d.orders / maxVal) * plotH,
  }))

  const formatCurrency = (value) => {
    if (period === 'yearly') {
      return `$${Math.round(value / 1000)}k`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(2)}`
  }

  // Create straight line path (clearer than bezier)
  const getLinePath = (points) => {
    if (points.length === 0) return ''
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  }

  const linePath = getLinePath(points)
  const ordLinePath = getLinePath(ordPoints)
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`
  const ordAreaPath = `${ordLinePath} L${ordPoints[ordPoints.length - 1].x},${PAD.top + plotH} L${ordPoints[0].x},${PAD.top + plotH} Z`
  const hoverIdx = hoveredPoint ? data.findIndex(d => d.label === hoveredPoint.label) : -1

  return (
    <g>
      {/* Area under curves */}
      <path d={areaPath} fill="url(#revArea)" />
      <path d={ordAreaPath} fill="url(#ordArea)" />
      
      {/* Clear straight lines */}
      <path d={linePath} fill="none" stroke="#14b8a6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={ordLinePath} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Interactive overlay for hover detection */}
      <rect 
        x={PAD.left} 
        y={PAD.top} 
        width={plotW} 
        height={plotH} 
        fill="transparent"
        onMouseMove={(e) => {
          const svg = e.currentTarget.ownerSVGElement
          const rect = svg.getBoundingClientRect()
          const mx = (e.clientX - rect.left) / rect.width * SVG_WIDTH
          const idx = Math.round((mx - PAD.left) / plotW * (data.length - 1))
          const clamped = Math.max(0, Math.min(data.length - 1, idx))
          setHoveredPoint({ ...data[clamped], x: xCenter(clamped) })
        }}
        onMouseLeave={() => setHoveredPoint(null)} 
      />
      
      {/* Revenue data points */}
      {points.map((p, i) => (
        <g key={`rev-${i}`}>
          <circle 
            cx={p.x} 
            cy={p.y} 
            r={hoverIdx === i ? 5 : 3.5} 
            fill={hoverIdx === i ? '#14b8a6' : '#fff'} 
            stroke="#14b8a6" 
            strokeWidth={2} 
            className="transition-all duration-200"
            style={{ cursor: 'pointer' }}
          />
        </g>
      ))}
      
      {/* Orders data points */}
      {ordPoints.map((p, i) => (
        <g key={`ord-${i}`}>
          <circle 
            cx={p.x} 
            cy={p.y} 
            r={hoverIdx === i ? 5 : 3.5} 
            fill={hoverIdx === i ? '#f97316' : '#fff'} 
            stroke="#f97316" 
            strokeWidth={2} 
            className="transition-all duration-200"
            style={{ cursor: 'pointer' }}
          />
        </g>
      ))}
      
      {/* X-axis labels */}
      {data.map((d, i) => (
        <text 
          key={`lbl-${i}`} 
          x={xCenter(i)} 
          y={SVG_HEIGHT - 8} 
          textAnchor="middle" 
          fill={hoverIdx === i ? '#1e293b' : '#94a3b8'} 
          fontSize={11} 
          fontWeight={hoverIdx === i ? 600 : 500} 
          className="transition-colors duration-200"
        >
          {d.label}
        </text>
      ))}
      
      {/* Tooltip */}
      {hoveredPoint && (
        <g>
          {/* Vertical guide line */}
          <line 
            x1={hoveredPoint.x} 
            y1={PAD.top} 
            x2={hoveredPoint.x} 
            y2={PAD.top + plotH} 
            stroke="#cbd5e1" 
            strokeWidth={1.5} 
            strokeDasharray="4,4" 
          />
          
          {/* Tooltip background */}
          <rect 
            x={hoveredPoint.x - 65} 
            y={PAD.top + 5} 
            width={130} 
            height={52} 
            rx={8} 
            fill="#1e293b" 
            opacity={0.95} 
          />
          
          {/* Tooltip content */}
          <text x={hoveredPoint.x} y={PAD.top + 20} textAnchor="middle" fill="#f8fafc" fontSize={11} fontWeight={600}>
            {hoveredPoint.label}
          </text>
          <text x={hoveredPoint.x} y={PAD.top + 35} textAnchor="middle" fill="#14b8a6" fontSize={10} fontWeight={500}>
            Revenue: {formatCurrency(hoveredPoint.revenue)}
          </text>
          <text x={hoveredPoint.x} y={PAD.top + 48} textAnchor="middle" fill="#f97316" fontSize={10} fontWeight={500}>
            Orders: {hoveredPoint.orders}
          </text>
        </g>
      )}
    </g>
  )
}