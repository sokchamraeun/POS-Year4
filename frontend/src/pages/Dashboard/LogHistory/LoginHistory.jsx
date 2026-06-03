import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import ExportExcel from './ExportExcel.jsx'
import PrintReport from './PrintReport.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API = import.meta.env.VITE_API_URL || '/api'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'


export default function LoginHistory() {
  const token = () => localStorage.getItem('token')
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` })
  const [histories, setHistories] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ user_id: '', date_from: '', date_to: '' })

  useEffect(() => {
    fetchUsers()
    fetchHistories()
  }, [])

  useEffect(() => {
    if (filters.date_from && filters.date_to) fetchHistories()
  }, [filters.date_from, filters.date_to])

  async function fetchUsers() {
    try {
      const res = await fetch(`${API}/users`, { headers: authHeaders() })
      if (!res.ok) return
      const json = await res.json()
      setUsers(json.data ?? json)
    } catch {}
  }

  async function fetchHistories() {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filters.user_id) params.set('user_id', filters.user_id)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
      const res = await fetch(`${API}/login-histories?${params}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setHistories(json.data ?? json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchHistories()
  }

  if (loading && histories.length === 0) return <Loader text="Loading login history..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="no-print"><Sidebar /></div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="no-print"><Topbar /></div>
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="no-print text-2xl font-bold text-gray-800 mb-6">Login History</h1>

          {error && (
            <div className="no-print mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold text-gray-400 hover:text-gray-600">&times;</button>
            </div>
          )}

          <form onSubmit={handleSearch} className="no-print flex items-end gap-3 mb-6 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
              <select
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Users</option>
                {users.filter((u) => u.role_id).map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                const now = new Date().toISOString().slice(0, 16)
                setFilters({ ...filters, date_from: now, date_to: now })
              }}
              className="self-end bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Today
            </button>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                <input
                type="datetime-local" value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
              <input
                type="datetime-local" value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">Search</button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, date_from: '', date_to: '' })}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <ExportExcel filters={filters} />
              <PrintReport histories={histories} />
            </div>
          </form>

          <div id="login-history-table" className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 w-16">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Login Time</th>
                  <th className="px-6 py-4">Logout Time</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {histories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No login history found.</td>
                  </tr>
                ) : (
                  histories.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{String(h.id).padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{h.user?.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{fmt(h.login_at)}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{fmt(h.logout_at)}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{h.ip_address || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs max-w-[160px] truncate" title={h.device || ''}>{h.device || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {h.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  )
}
