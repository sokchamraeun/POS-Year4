import { useState, useEffect } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const API = import.meta.env.VITE_API_URL || '/api'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailRole, setDetailRole] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', permissions: [] })

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  async function fetchRoles() {
    try {
      const res = await fetch(`${API}/roles`, { headers })
      const data = await res.json()
      setRoles(data.data || data)
    } catch (err) {
      console.error('Failed to fetch roles', err)
    }
  }

  async function fetchPermissions() {
    try {
      const res = await fetch(`${API}/permissions`, { headers })
      const data = await res.json()
      setAllPermissions(data.data || data)
    } catch (err) {
      console.error('Failed to fetch permissions', err)
    }
  }

  function resetForm() {
    setFormData({ name: '', slug: '', permissions: [] })
    setEditing(null)
  }

  function openAddModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(role) {
    setFormData({
      name: role.name,
      slug: role.slug,
      permissions: role.permissions.map((p) => p.id),
    })
    setEditing(role)
    setShowModal(true)
  }

  function togglePermission(permId) {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }))
  }

  async function handleSave() {
    if (!formData.name || !formData.slug) return
    try {
      const url = editing ? `${API}/roles/${editing.id}` : `${API}/roles`
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      })
      if (!res.ok) return
      setShowModal(false)
      resetForm()
      fetchRoles()
    } catch (err) {
      console.error('Failed to save role', err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this role?')) return
    try {
      const res = await fetch(`${API}/roles/${id}`, { method: 'DELETE', headers })
      if (!res.ok) return
      fetchRoles()
    } catch (err) {
      console.error('Failed to delete role', err)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Roles</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add New Role
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 w-16">ID</th>
                  <th className="px-6 py-4">Role Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Permissions</th>
                  <th className="px-6 py-4 w-56">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{String(role.id).padStart(2, '0')}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{role.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{role.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {role.permissions.length} Permission{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setDetailRole(role); setShowDetail(true) }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(role)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDetail && detailRole && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-gray-400 font-normal">Role &mdash;</span> {detailRole.name}
                    <span className="text-gray-400 font-normal text-base ml-2">({detailRole.slug})</span>
                  </h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Slug:</span>
                    <span className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{detailRole.slug}</span>
                    <span className="text-gray-500 ml-4">Permissions:</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {detailRole.permissions.length}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">All Permissions</label>
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2 w-12">#</th>
                            <th className="px-4 py-2">Permission Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailRole.permissions.length > 0 ? (
                            detailRole.permissions.map((p, idx) => (
                              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 text-gray-400 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</td>
                                <td className="px-4 py-2 text-gray-700">{p.name}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-6 text-center text-gray-400">No permissions assigned</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowDetail(false); openEditModal(detailRole) }}
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Role
                  </button>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editing ? 'Edit Role' : 'Add New Role'}
                  </h2>
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Role name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text" value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="role-slug"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {allPermissions.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editing ? 'Save Changes' : 'Add Role'}
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
