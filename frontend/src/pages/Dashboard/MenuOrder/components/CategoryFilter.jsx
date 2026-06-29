import { LayoutGrid, List } from 'lucide-react'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? ''

function getImageUrl(image) {
  if (!image) return null
  return image.startsWith('http') ? image : `${STORAGE_URL}/${image}`
}

export default function CategoryFilter({
  categories,
  category,
  onSelect,
  search,
  onSearchChange,
  onSearchClear,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Box */}
        <div className="relative w-full shrink-0 lg:w-80">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-slate-50/50 focus:ring-4 focus:ring-teal-500/10"
          />

          {search && (
            <button
              type="button"
              onClick={onSearchClear}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
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
            const isActive = category === cat.name
            const imgUrl = cat.name === 'All' ? null : getImageUrl(cat.image)

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelect(cat.name)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition-all duration-200 active:scale-[0.97] ${
                  isActive
                    ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700'
                }`}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={cat.name}
                    className="aspect-square h-8 w-8 rounded-lg border border-slate-100 bg-slate-50 object-cover"
                  />
                ) : (
                  <div className={`flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </div>
                )}
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            )
          })}

          <div className="ml-auto inline-flex shrink-0 items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'grid'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`rounded-lg p-2 transition ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
