export default function CustomerSearch({
  customerSearch,
  showDropdown,
  filteredCustomers,
  onSearchChange,
  onSelect,
  phone,
  onPhoneChange,
}) {
  return (
    <>
      <div className="relative">
        <input
          type="text"
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) => {
            onSearchChange(e.target.value)
          }}
          onFocus={() => onSearchChange(customerSearch)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showDropdown && filteredCustomers.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => onSelect(c)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-gray-400 ml-2">{c.phone}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </>
  )
}
