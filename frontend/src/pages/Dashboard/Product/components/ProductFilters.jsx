export default function ProductFilters({ search, onSearchChange, selectedCategory, onCategoryChange, categories, statusFilter, onStatusChange, filteredCount }) {
  return (
    <div className="p-6 border-b border-slate-200 bg-white">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-medium bg-orange-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
          />
        </div>
        <div className="inline-block relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-auto pl-4 pr-10 py-3 rounded-2xl text-sm font-medium bg-orange-50 border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 appearance-none cursor-pointer transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 rounded-2xl p-1 border border-slate-200">
          {['all', 'active', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                statusFilter === s
                  ? s === 'all' ? 'bg-amber-600 text-white shadow-sm'
                    : s === 'active' ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-amber-700">{filteredCount} product{filteredCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
