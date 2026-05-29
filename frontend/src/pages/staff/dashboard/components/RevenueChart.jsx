    // src/pages/staff/dashboard/components/RevenueChart.jsx
    import { useState } from 'react'
    import { periods, SVG_WIDTH, SVG_HEIGHT, PAD, plotW, plotH } from '../utils/constants'

    export default function RevenueChart({ period, setPeriod, fromDate, toDate, setFromDate, setToDate, data }) {
    const [hoveredPoint, setHoveredPoint] = useState(null)
    const maxVal = data.length > 0 ? Math.max(...data.flatMap(d => [d.revenue, d.orders])) * 1.15 : 1

    const xCenter = (i) => PAD.left + (i + 0.5) * (plotW / (data.length || 1))

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Revenue &amp; Orders</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {periods.map(p => (
                <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                    period === p.key
                    ? 'bg-white text-gray-900 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
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
                className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                <span className="text-xs text-gray-400 font-medium">to</span>
                <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
            )}
        </div>

        <div className="flex items-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-gray-600 font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-600 font-medium">Orders</span>
            </div>
        </div>

        <div className="overflow-x-auto" style={{ position: 'relative' }}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full min-w-[500px]" style={{ maxHeight: `${SVG_HEIGHT}px`, cursor: 'crosshair' }}>
            <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="ordArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#f8fafc" rx={8} />

            {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <g key={frac}>
                <line 
                    x1={PAD.left} 
                    y1={PAD.top + plotH * (1 - frac)}
                    x2={SVG_WIDTH - PAD.right} 
                    y2={PAD.top + plotH * (1 - frac)}
                    stroke="#e5e7eb" 
                    strokeWidth={1} 
                    strokeDasharray="4,3" 
                />
                <text 
                    x={PAD.left - 10} 
                    y={PAD.top + plotH * (1 - frac) + 4}
                    textAnchor="end" 
                    fill="#9ca3af" 
                    fontSize={11}
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
                stroke="#d1d5db" 
                strokeWidth={1.5} 
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
                <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#9ca3af" fontSize={13}>
                No data available
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

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const ordLinePath = ordPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const areaPath = `${linePath} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`
    const ordAreaPath = `${ordLinePath} L${ordPoints[ordPoints.length - 1].x},${PAD.top + plotH} L${ordPoints[0].x},${PAD.top + plotH} Z`
    const hoverIdx = hoveredPoint ? data.findIndex(d => d.label === hoveredPoint.label) : -1

    return (
        <g>
        <path d={areaPath} fill="url(#revArea)" />
        <path d={ordAreaPath} fill="url(#ordArea)" />
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={ordLinePath} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        
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
            <g key={`rev-${i}`}>
            <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4} fill={hoverIdx === i ? '#6366f1' : '#fff'} stroke="#6366f1" strokeWidth={2.5} />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#6366f1" fontSize={10} fontWeight={700}>
                ${period === 'yearly' ? Math.round(data[i].revenue / 1000) + 'k' : data[i].revenue}
            </text>
            </g>
        ))}
        
        {ordPoints.map((p, i) => (
            <g key={`ord-${i}`}>
            <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4} fill={hoverIdx === i ? '#f59e0b' : '#fff'} stroke="#f59e0b" strokeWidth={2.5} />
            <text x={p.x} y={p.y + 18} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={700}>
                {data[i].orders} ord
            </text>
            </g>
        ))}
        
        {data.map((d, i) => (
            <text key={`lbl-${i}`} x={xCenter(i)} y={SVG_HEIGHT - 8} textAnchor="middle" fill="#6b7280" fontSize={11} fontWeight={hoverIdx === i ? 700 : 500}>
            {d.label}
            </text>
        ))}
        
        {hoveredPoint && (
            <g>
            <line x1={hoveredPoint.x} y1={PAD.top} x2={hoveredPoint.x} y2={PAD.top + plotH} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4,3" />
            <rect x={hoveredPoint.x - 60} y={PAD.top + 4} width={120} height={52} rx={6} fill="#1f2937" opacity={0.92} />
            <text x={hoveredPoint.x} y={PAD.top + 20} textAnchor="middle" fill="#e5e7eb" fontSize={11} fontWeight={600}>
                {hoveredPoint.label}
            </text>
            <text x={hoveredPoint.x} y={PAD.top + 34} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontWeight={700}>
                Rev: ${period === 'yearly' ? Math.round(hoveredPoint.revenue / 1000) + 'k' : hoveredPoint.revenue}
            </text>
            <text x={hoveredPoint.x} y={PAD.top + 48} textAnchor="middle" fill="#fde68a" fontSize={11} fontWeight={700}>
                Ord: {hoveredPoint.orders}
            </text>
            </g>
        )}
        </g>
    )
    }