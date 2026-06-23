export default function ProductPagination({ page, lastPage, from, to, total, onPageChange }) {
  if (lastPage <= 1) return null

  return (
    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/30 rounded-b-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-700">{from}</span> to <span className="font-bold text-slate-700">{to}</span> of <span className="font-bold text-slate-700">{total}</span> products
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${page <= 1 ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <div className="hidden sm:flex gap-1.5">
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`e${i}`} className="px-3 py-2 text-sm text-slate-400 font-bold">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onPageChange(item)}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 ${item === page ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${page >= lastPage ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
