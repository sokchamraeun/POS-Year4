export default function TableSelector({ tableId, onChange, tables }) {
  return (
    <select
      value={tableId}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <option value="">Select Table</option>
      {tables.map((t) => (
        <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
      ))}
    </select>
  )
}
