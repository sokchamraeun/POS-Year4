export default function CategoryFilter({
  categories,
  category,
  onSelect,
  search,
  onSearchChange,
  onSearchClear,
}) {
  return (
    <div className="border-b border-[#ead2b8] bg-[#fffaf3] px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Box */}
        <div className="relative w-full shrink-0 lg:w-80">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a5a33]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-2xl border border-[#d7ad83] bg-white pl-9 pr-10 text-sm font-semibold text-[#4b2a18] outline-none transition placeholder:text-[#b08a65] focus:border-[#c47a2c] focus:bg-[#fff4e6] focus:ring-2 focus:ring-[#c47a2c]/10"
          />

          {search && (
            <button
              type="button"
              onClick={onSearchClear}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl border border-[#ead2b8] bg-[#fffaf3] text-[#8a5a33] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              aria-label="Clear search"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Buttons */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const isActive = category === cat

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelect(cat)}
                className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-black whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                  isActive
                    ? 'border-[#c47a2c] bg-[#c47a2c] text-white'
                    : 'border-[#ead2b8] bg-white text-[#6b3b1d] hover:border-[#c47a2c] hover:bg-[#fff4e6] hover:text-[#4b2a18]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}