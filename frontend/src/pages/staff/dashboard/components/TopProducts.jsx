    // src/pages/staff/dashboard/components/TopProducts.jsx
    import { chartColors } from "../utils/constants";

    export default function TopProducts({ topProducts }) {
    if (topProducts.length === 0) {
        return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top Products
            </h2>
            <p className="text-gray-400 text-sm">No order data yet.</p>
        </div>
        );
    }

    const total = topProducts.reduce((s, p) => s + p.qty, 0);
    const cx = 110,
        cy = 110,
        r = 85,
        innerR = 50;

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
        <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
        <div className="flex items-center gap-6">
            <svg width="220" height="220" viewBox="0 0 220 220">
            {slices.map((s, i) => (
                <path
                key={i}
                d={s.path}
                fill={s.color}
                stroke="#fff"
                strokeWidth={2}
                />
            ))}
            <circle cx={cx} cy={cy} r={innerR} fill="white" />
            <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fill="#374151"
                fontSize={22}
                fontWeight={800}
            >
                {total}
            </text>
            <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={11}
            >
                Total Sold
            </text>
            </svg>
            <div className="flex-1 space-y-2">
            {slices.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                />
                <span className="text-gray-700 flex-1 truncate">{s.name}</span>
                <span className="text-gray-500 font-medium">{s.qty}</span>
                <span className="text-gray-400 w-10 text-right">
                    {total > 0 ? Math.round((s.qty / total) * 100) : 0}%
                </span>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
    }
