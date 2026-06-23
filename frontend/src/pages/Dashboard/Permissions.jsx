import { useState, useEffect, useMemo } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const API = import.meta.env.VITE_API_URL || '/api'
const hardcodedModules = ['', 'Dashboard', 'Products', 'Categories', 'Sizes', 'Sugar Levels', 'Ice Levels', 'Addons', 'Tables', 'Orders', 'Inventory', 'Ingredients', 'Recipe', 'Reports', 'Promotions', 'Hero Sliders', 'Permissions', 'Roles', 'Staff', 'Customers']

const moduleStyle = { bg: 'bg-teal-50', header: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' }

export default function Permissions() {
  const [permissions, setPermissions] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', module: '' })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const moduleOptions = useMemo(() => {
    const apiModules = [...new Set(permissions.map((p) => p.module).filter(Boolean))]
    return [...new Set([...hardcodedModules, ...apiModules])]
  }, [permissions])

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }

  useEffect(() => { fetchPermissions() }, [])

  async function fetchPermissions() {
    try {
      setError(null)
      const allPermissions = []
      let page = 1
      let lastPage = 1

      do {
        const res = await fetch(`${API}/permissions?_=${Date.now()}&page=${page}&per_page=100`, { headers })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items = data.data || data
        if (Array.isArray(items)) allPermissions.push(...items)
        lastPage = data.last_page || data.meta?.last_page || page
        page++
      } while (page <= lastPage)

      setPermissions(allPermissions)
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredPermissions = useMemo(() => {
    if (!search) return permissions
    const q = search.toLowerCase()
    return permissions.filter(p => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
  }, [permissions, search])

  const grouped = useMemo(() => {
    const map = {}
    for (const p of filteredPermissions) {
      const mod = p.module || 'Uncategorized'
      if (!map[mod]) map[mod] = []
      map[mod].push(p)
    }
    const order = [...hardcodedModules.filter(Boolean), 'Uncategorized']
    return Object.entries(map).sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
  }, [filteredPermissions])

  function resetForm() {
    setFormData({ name: '', slug: '', module: '' })
    setEditing(null)
  }

  function openAddModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(perm) {
    setFormData({ name: perm.name, slug: perm.slug, module: perm.module ?? '' })
    setEditing(perm)
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.slug) return
    setSaving(true)
    setError(null)
    try {
      const url = editing ? `${API}/permissions/${editing.id}` : `${API}/permissions`
      const method = editing ? 'PUT' : 'POST'
      const body = { name: formData.name, slug: formData.slug, module: formData.module || null }
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || `HTTP ${res.status}`)
      }
      setShowModal(false)
      resetForm()
      await fetchPermissions()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this permission?')) return
    try {
      const res = await fetch(`${API}/permissions/${id}`, { method: 'DELETE', headers })
      if (!res.ok) return
      fetchPermissions()
    } catch (err) {
      console.error('Failed to delete permission', err)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Permissions</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add New Permission
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold text-slate-400 hover:text-gray-600">&times;</button>
            </div>
          )}

          <div className="relative mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search permissions by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-2xl text-sm font-medium bg-white border border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(() => { let idx = 0; return grouped.map(([module, perms]) => {
              const c = moduleStyle
              return (
                <div key={module} className={`${c.bg} rounded-xl shadow-sm overflow-hidden border border-slate-200`}>
                  <div className={`${c.header} px-6 py-3 flex items-center gap-2 border-b border-slate-200`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className={`text-sm font-semibold ${c.text}`}>{module}</span>
                    <span className={`ml-auto text-xs ${c.text} opacity-70`}>{perms.length} permission{perms.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 font-medium text-xs">
                        <th className="px-6 py-2 w-16">ID</th>
                        <th className="px-6 py-2">Name</th>
                        <th className="px-6 py-2">Slug</th>
                        <th className="px-6 py-2">Module</th>
                        <th className="px-6 py-2 w-44">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map((perm) => {
                        idx++
                        return (
                        <tr key={perm.id} className="border-t border-slate-100 hover:bg-black/[0.02] transition-colors">
                          <td className="px-6 py-2.5 text-slate-400 text-xs font-mono">{String(idx).padStart(2, '0')}</td>
                          <td className="px-6 py-2.5 text-slate-800 font-medium">{perm.name}</td>
                          <td className="px-6 py-2.5 text-slate-500 font-mono text-xs">{perm.slug}</td>
                          <td className="px-6 py-2.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.text} ${c.header}`}>{module}</span></td>
                          <td className="px-6 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditModal(perm)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(perm.id)}
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
                      )
                    })}
                    </tbody>
                  </table>
                </div>
              )
            })})()}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editing ? 'Edit Permission' : 'Add New Permission'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="text-slate-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Permission name"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                    <input
                      type="text" value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="permission-slug"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Module</label>
                    <select
                      value={formData.module}
                      onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {moduleOptions.map((m) => (
                        <option key={m} value={m}>{m || '(none)'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                    {editing ? 'Save Changes' : 'Add Permission'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
