    // src/pages/staff/dashboard/components/RevenueChart.jsx
    import { useState } from 'react'
    import { periods, SVG_WIDTH, SVG_HEIGHT, PAD, plotW, plotH } from '../utils/constants'

    export default function RevenueChart({ period, setPeriod, fromDate, toDate, setFromDate, setToDate, data }) {
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const maxVal = data.length > 0 ? Math.max(...data.flatMap(d => [d.revenue, d.orders])) * 1.15 : 1

    const xCenter = (i) => PAD.left + (i + 0.5) * (plotW / (data.length || 1))

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/40 p-6 sm:p-8 flex flex-col flex-1 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue & Orders</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Performance overview over time</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-200/60 shadow-inner">
              {periods.map(p => (
                  <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 ${
                      period === p.key
                      ? 'bg-white text-indigo-600 shadow-md shadow-gray-200/50 scale-105'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
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
                  className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm" 
                  />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">to</span>
                  <input 
                  type="date" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)} 
                  className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm" 
                  />
              </div>
              )}
            </div>
        </div>

        <div className="flex items-center gap-6 text-sm mb-6 px-2">
            <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="text-gray-700 font-semibold tracking-wide">Revenue</span>
            </div>
            <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-gray-700 font-semibold tracking-wide">Orders</span>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-2" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full min-w-[600px]" style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}>
            <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="ordArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#fafafa" rx={12} />

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
                    x={PAD.left - 12} 
                    y={PAD.top + plotH * (1 - frac) + 4}
                    textAnchor="end" 
                    fill="#94a3b8" 
                    fontSize={11}
                    fontWeight={600}
                >
                    {period === 'yearly' ? `$${Math.round(maxVal * frac / 1000)}k` : `$${Math.round(maxVal * frac)}`}
                </text>
                </g>
            ))}

            <line 
                x1={PAD.left} 
                y1={PAD.top + plotH} 
                x2={SVG_WIDTH - PAD.right} 
                y2={PAD.top + plotH}
                stroke="#cbd5e1" 
                strokeWidth={2} 
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
                <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#94a3b8" fontSize={14} fontWeight={600}>
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

    // Use curved lines for a modern feel (Catmull-Rom or Bezier interpolation logic)
    // For simplicity, sticking to straight lines with rounded joins, but thicker and smoother
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const ordLinePath = ordPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaPath = `${linePath} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`
    const ordAreaPath = `${ordLinePath} L${ordPoints[ordPoints.length - 1].x},${PAD.top + plotH} L${ordPoints[0].x},${PAD.top + plotH} Z`
    const hoverIdx = hoveredPoint ? data.findIndex(d => d.label === hoveredPoint.label) : -1

    return (
        <g>
        <path d={areaPath} fill="url(#revArea)" className="transition-all duration-300" />
        <path d={ordAreaPath} fill="url(#ordArea)" className="transition-all duration-300" />
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="transition-all duration-300" />
        <path d={ordLinePath} fill="none" stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="transition-all duration-300" />
        
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
        
        {points.map((p, i) => (
            <g key={`rev-${i}`} className="transition-all duration-200" style={{ transformOrigin: `${p.x}px ${p.y}px`, transform: hoverIdx === i ? 'scale(1.2)' : 'scale(1)' }}>
            <circle cx={p.x} cy={p.y} r={5} fill={hoverIdx === i ? '#4f46e5' : '#fff'} stroke="#4f46e5" strokeWidth={3} />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#4f46e5" fontSize={11} fontWeight={800} opacity={hoverIdx === i ? 1 : 0.8}>
                ${period === 'yearly' ? Math.round(data[i].revenue / 1000) + 'k' : data[i].revenue}
            </text>
            </g>
        ))}
        
        {ordPoints.map((p, i) => (
            <g key={`ord-${i}`} className="transition-all duration-200" style={{ transformOrigin: `${p.x}px ${p.y}px`, transform: hoverIdx === i ? 'scale(1.2)' : 'scale(1)' }}>
            <circle cx={p.x} cy={p.y} r={5} fill={hoverIdx === i ? '#d97706' : '#fff'} stroke="#d97706" strokeWidth={3} />
            <text x={p.x} y={p.y + 20} textAnchor="middle" fill="#d97706" fontSize={11} fontWeight={800} opacity={hoverIdx === i ? 1 : 0.8}>
                {data[i].orders} ord
            </text>
            </g>
        ))}
        
        {data.map((d, i) => (
            <text key={`lbl-${i}`} x={xCenter(i)} y={SVG_HEIGHT - 6} textAnchor="middle" fill={hoverIdx === i ? '#1e293b' : '#64748b'} fontSize={12} fontWeight={hoverIdx === i ? 800 : 600} className="transition-colors duration-200">
            {d.label}
            </text>
        ))}
        
        {hoveredPoint && (
            <g className="transition-all duration-200">
            <line x1={hoveredPoint.x} y1={PAD.top} x2={hoveredPoint.x} y2={PAD.top + plotH} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4,4" />
            {/* Tooltip Background with shadow */}
            <rect x={hoveredPoint.x - 70} y={PAD.top + 8} width={140} height={60} rx={12} fill="#0f172a" opacity={0.95} filter="url(#glow)" />
            <text x={hoveredPoint.x} y={PAD.top + 26} textAnchor="middle" fill="#f8fafc" fontSize={12} fontWeight={800}>
                {hoveredPoint.label}
            </text>
            <text x={hoveredPoint.x} y={PAD.top + 42} textAnchor="middle" fill="#818cf8" fontSize={12} fontWeight={700}>
                Rev: ${period === 'yearly' ? Math.round(hoveredPoint.revenue / 1000) + 'k' : hoveredPoint.revenue}
            </text>
            <text x={hoveredPoint.x} y={PAD.top + 58} textAnchor="middle" fill="#fcd34d" fontSize={12} fontWeight={700}>
                Ord: {hoveredPoint.orders}
            </text>
            </g>
        )}
        </g>
    )
    }