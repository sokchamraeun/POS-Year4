const API = import.meta.env.VITE_API_URL || '/api'

export default function ExportExcel({ filters }) {
  return (
    <button
      type="button"
      onClick={() => {
        const params = new URLSearchParams()
        if (filters.user_id) params.set('user_id', filters.user_id)
        if (filters.date_from) params.set('date_from', filters.date_from)
        if (filters.date_to) params.set('date_to', filters.date_to)
        window.open(`${API}/login-histories/export-excel?${params}`, '_blank')
      }}
      className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export Excel
    </button>
  )
}
