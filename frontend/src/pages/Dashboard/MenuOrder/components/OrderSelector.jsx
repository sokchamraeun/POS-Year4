export default function OrderSelector({ value, onChange, existingOrder, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400"
    >
      <option value="">New Order</option>
      {existingOrder && (
        <option value={existingOrder.id}>
          Order #{existingOrder.id} (Open)
        </option>
      )}
    </select>
  )
}
