import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import { fetchRoles as fetchRolesApi, fetchPermissions as fetchPermissionsApi, saveRole, deleteRole as deleteRoleApi } from './api/roleApi.js'
import RolesTable from './components/RolesTable.jsx'
import RoleFormModal from './components/RoleFormModal.jsx'
import RoleDetailModal from './components/RoleDetailModal.jsx'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailRole, setDetailRole] = useState(null)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', permissions: [] })
  const [moduleFilter, setModuleFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const modules = [...new Set(allPermissions.map(p => p.module).filter(Boolean))]

  useEffect(() => {
    fetchRolesApi().then(setRoles).catch(() => {})
    fetchPermissionsApi().then(setAllPermissions).catch(() => {})
  }, [])

  function resetForm() {
    setFormData({ name: '', slug: '', permissions: [] })
    setEditing(null)
    setModuleFilter('')
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
    if (saving) return
    setSaving(true)
    try {
      await saveRole(formData, editing)
      setShowModal(false)
      resetForm()
      const updated = await fetchRolesApi()
      setRoles(updated)
    } catch (err) {
      alert(err.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this role?')) return
    try {
      await deleteRoleApi(id)
      const updated = await fetchRolesApi()
      setRoles(updated)
    } catch (err) {
      console.error('Failed to delete role', err)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Roles Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              + Add New Role
            </button>
          </div>

          <RolesTable roles={roles} onView={(r) => { setDetailRole(r); setShowDetail(true) }} onEdit={openEditModal} onDelete={handleDelete} />

          <RoleDetailModal role={detailRole} onClose={() => setDetailRole(null)} onEdit={(r) => { setDetailRole(null); openEditModal(r) }} />

          {showModal && (
            <RoleFormModal
              editing={editing}
              formData={formData}
              allPermissions={allPermissions}
              moduleFilter={moduleFilter}
              modules={modules}
              saving={saving}
              onFormChange={setFormData}
              onModuleFilterChange={setModuleFilter}
              onTogglePermission={togglePermission}
              onSave={handleSave}
              onClose={() => setShowModal(false)}
              resetForm={resetForm}
            />
          )}
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .overflow-y-auto::-webkit-scrollbar { width: 8px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #e6f7f5; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #1e5f5a; border-radius: 10px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #0d3d3a; }
      `}</style>
    </div>
  )
}
