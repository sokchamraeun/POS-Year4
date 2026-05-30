    // src/pages/staff/dashboard/components/TopProducts.jsx
    import { chartColors } from "../utils/constants";

    export default function TopProducts({ topProducts }) {
    if (topProducts.length === 0) {
        return (
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/40 p-6 sm:p-8 flex flex-col flex-1 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top Products</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Your best selling items</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-12 mt-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 font-medium">No product data yet.</p>
              <p className="text-xs text-gray-400 mt-1">Make some sales to see top products here.</p>
            </div>
        </div>
        );
    }

    const total = topProducts.reduce((s, p) => s + p.qty, 0);
    const cx = 110,
        cy = 110,
        r = 95,
        innerR = 60;

    const slices = topProducts.reduce(
        (acc, p, i) => {
        const sweep = total > 0 ? (p.qty / total) * Math.PI * 2 : 0;
        const sa = acc.curAngle;
        const ea = sa + sweep;
        const sx = cx + r * Math.cos(sa);
        const sy = cy + r * Math.sin(sa);
        const ex = cx + r * Math.cos(ea);
        const ey = cy + r * Math.sin(ea);
        const large = sweep > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
        return {
            curAngle: ea,
            slices: [
            ...acc.slices,
            { ...p, color: chartColors[i % chartColors.length], path },
            ],
        };
        },
        { curAngle: -Math.PI / 2, slices: [] },
    ).slices;

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/40 p-6 sm:p-8 flex flex-col flex-1 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Top Products</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Your best selling items</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-8 flex-1">
              <div className="relative transform hover:scale-105 transition-transform duration-500 mt-2">
                <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-xl">
                <defs>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
                  </filter>
                </defs>
                {slices.map((s, i) => (
                    <path
                    key={i}
                    d={s.path}
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth={4}
                    strokeLinejoin="round"
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer origin-center hover:stroke-[6px]"
                    filter="url(#shadow)"
                    />
                ))}
                <circle cx={cx} cy={cy} r={innerR} fill="white" />
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    fill="#111827"
                    fontSize={28}
                    fontWeight={800}
                >
                    {total}
                </text>
                <text
                    x={cx}
                    y={cy + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={12}
                    fontWeight={600}
                    letterSpacing="0.05em"
                    className="uppercase"
                >
                    Total Sold
                </text>
                </svg>
              </div>
              <div className="flex-1 w-full space-y-1">
              {slices.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div
                      className="w-4 h-4 rounded-full shadow-sm ring-4 ring-transparent group-hover:ring-gray-200 transition-all"
                      style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}66` }}
                  />
                  <span className="text-gray-700 font-semibold flex-1 truncate group-hover:text-gray-900 transition-colors">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-bold bg-gray-100 px-2.5 py-1 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">{s.qty}</span>
                    <span className="text-gray-400 w-12 text-right font-medium text-xs">
                        {total > 0 ? Math.round((s.qty / total) * 100) : 0}%
                    </span>
                  </div>
                  </div>
              ))}
              </div>
          </div>
        </div>
    );
    }
