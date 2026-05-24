    // src/pages/staff/dashboard/components/StatCard.jsx
    import { colorMap } from '../utils/constants'

    export default function StatCard({ stat, index }) {
    return (
        <div 
        className="bg-white rounded-xl shadow-sm p-6 border-l-4 hover:shadow-md transition-shadow duration-200" 
        style={{ borderColor: colorMap[index] }}
        >
        <div className="flex items-center justify-between">
            <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full">
            {stat.change}
            </span>
        </div>
        </div>
    )
    }