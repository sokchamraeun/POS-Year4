export default function Pagination({ page, lastPage, onPageChange, loading }) {
  if (!lastPage || lastPage <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1 || loading}
        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-xs font-bold text-slate-500">Page {page} of {lastPage}</span>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(lastPage, page + 1))}
        disabled={page >= lastPage || loading}
        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
