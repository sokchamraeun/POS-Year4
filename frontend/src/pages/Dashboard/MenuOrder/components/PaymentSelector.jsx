const options = [
  { value: 'not_yet', label: 'Not Yet', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  { value: 'KHQR', label: 'KHQR', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { value: 'Cash', label: 'Cash', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
]

export default function PaymentSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
            value === opt.value
              ? opt.color + ' ring-2 ring-offset-1 ring-gray-400'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
