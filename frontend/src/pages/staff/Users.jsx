import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const API_BASE = import.meta.env.VITE_API_URL
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function Users() {
  const token = () => localStorage.getItem('token')
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` })
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailUser, setDetailUser] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: '', phone: '', status: true })

  useEffect(() => {
    if (!token()) {
      setError('No auth token found. Please log in again.')
      setLoading(false)
      return
    }
    fetchUsers()
    fetchRoles()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/users`, { headers: authHeaders() })
      if (res.status === 401) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Unauthorized. Token may be expired — please log out and log in again.')
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setUsers(json.data ?? json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch(`${API_BASE}/roles`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setRoles(json.data ?? json)
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  function resetForm() {
    setFormData({ name: '', email: '', password: '', role_id: '', phone: '', status: true })
    setEditing(null)
  }

  function openAddModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(user) {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id || user.role?.id || '',
      phone: user.phone ?? '',
      status: user.status ?? true,
    })
    setEditing(user)
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.email) return
    try {
      const body = { ...formData }
      if (!body.password && editing) delete body.password
      if (!body.role_id) body.role_id = null

      const url = editing ? `${API_BASE}/users/${editing.id}` : `${API_BASE}/users`
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || `HTTP ${res.status}`)
      }

      setShowModal(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this user?')) return
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleClearLogin(id) {
    try {
      await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
        body: JSON.stringify({ last_login_at: null, logout_at: null }),
      })
      fetchUsers()
    } catch {}
  }

  if (loading) return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading users...</p>
        </main>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add User
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
              <span>{error}</span>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button onClick={() => { setError(null); fetchUsers(); fetchRoles() }} className="text-blue-600 hover:text-blue-800 font-medium text-xs underline">Retry</button>
                <button onClick={() => setError(null)} className="font-bold text-gray-400 hover:text-gray-600">&times;</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 w-16">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Login Time</th>
                  <th className="px-6 py-4">Logout Time</th>
                  <th className="px-6 py-4 w-64">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  users.filter((u) => u.role_id).map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{String(user.id).padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-gray-600">{user.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700">{user.role?.name ?? '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {user.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                       <td className="px-6 py-4 text-gray-600 text-xs">{fmt(user.login_histories?.find(h => !h.logout_at)?.login_at || user.last_login_at)}</td>
                       <td className="px-6 py-4 text-gray-600 text-xs">{fmt(user.login_histories?.find(h => !h.logout_at)?.logout_at || user.logout_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setDetailUser(user); setShowDetail(true) }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Modal */}
          {showDetail && detailUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-gray-400 font-normal">User &mdash;</span> {detailUser.name}
                  </h2>
                  <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500 w-28">Name</td><td className="py-2 font-medium text-gray-800">{detailUser.name}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Email</td><td className="py-2 text-gray-800">{detailUser.email}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Phone</td><td className="py-2 text-gray-800">{detailUser.phone || '—'}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Role</td><td className="py-2"><span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700">{detailUser.role?.name ?? '—'}</span></td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Status</td><td className="py-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${detailUser.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${detailUser.status ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {detailUser.status ? 'Active' : 'Inactive'}
                        </span>
                      </td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Login Time</td><td className="py-2 text-gray-800">{fmt(detailUser.last_login_at)}</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Logout Time</td><td className="py-2 text-gray-800">{fmt(detailUser.logout_at)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Login History</h3>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500 bg-gray-50">
                          <th className="px-3 py-2 w-10">#</th>
                          <th className="px-3 py-2">Login</th>
                          <th className="px-3 py-2">Logout</th>
                          <th className="px-3 py-2">IP</th>
                          <th className="px-3 py-2">Device</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detailUser.login_histories ?? []).length === 0 ? (
                          <tr><td colSpan={6} className="px-3 py-4 text-center text-gray-400">No login history.</td></tr>
                        ) : (
                          [...(detailUser.login_histories ?? [])].reverse().map((h) => (
                            <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-3 py-1.5 text-gray-400 font-mono">{String(h.id).padStart(2, '0')}</td>
                              <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{fmt(h.login_at)}</td>
                              <td className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{fmt(h.logout_at)}</td>
                              <td className="px-3 py-1.5 text-gray-500 font-mono">{h.ip_address || '—'}</td>
                              <td className="px-3 py-1.5 text-gray-500 max-w-[120px] truncate" title={h.device || ''}>{h.device || '—'}</td>
                              <td className="px-3 py-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                  {h.status === 'active' ? 'active' : 'logged_out'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="px-6 py-4 flex justify-end">
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowDetail(false); openEditModal(detailUser) }}
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit User
                  </button>
                  <button onClick={() => setShowDetail(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Close</button>
                </div>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">{editing ? 'Edit User' : 'Add User'}</h2>
                  <button onClick={() => { setShowModal(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="user@visal.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select role</option>
                      {roles.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password {editing && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current' : 'Min 8 characters'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button onClick={() => { setShowModal(false); resetForm() }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{editing ? 'Save Changes' : 'Add User'}</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
