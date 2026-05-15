import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const initialPermissions = [
  { id: 1, name: 'Create Product', slug: 'create-product', module: '' },
  { id: 2, name: 'Edit Product', slug: 'edit-product', module: '' },
  { id: 3, name: 'Delete Product', slug: 'delete-product', module: '' },
  { id: 4, name: 'View Orders', slug: 'view-orders', module: 'Orders' },
  { id: 5, name: 'Manage Inventory', slug: 'manage-inventory', module: 'Inventory' },
]

const moduleOptions = ['', 'Dashboard', 'Products', 'Orders', 'Inventory', 'Recipe', 'Reports', 'Permissions']

export default function Permissions() {
  const [permissions, setPermissions] = useState(initialPermissions)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '', module: '' })

  function resetForm() {
    setFormData({ name: '', slug: '', module: '' })
    setEditing(null)
  }

  function openAddModal() {
    resetForm()
    setShowModal(true)
  }

  function openEditModal(perm) {
    setFormData({ name: perm.name, slug: perm.slug, module: perm.module })
    setEditing(perm)
    setShowModal(true)
  }

  function handleSave() {
    if (!formData.name || !formData.slug) return
    if (editing) {
      setPermissions(permissions.map((p) =>
        p.id === editing.id ? { ...p, ...formData } : p
      ))
    } else {
      const newId = permissions.length ? Math.max(...permissions.map((p) => p.id)) + 1 : 1
      setPermissions([...permissions, { id: newId, ...formData }])
    }
    setShowModal(false)
    resetForm()
  }

  function handleDelete(id) {
    setPermissions(permissions.filter((p) => p.id !== id))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Permissions</h1>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add New Permission
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">{perm.id}</td>
                    <td className="px-6 py-4 text-gray-800">{perm.name}</td>
                    <td className="px-6 py-4 text-gray-600">{perm.slug}</td>
                    <td className="px-6 py-4 text-gray-600">{perm.module || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors">
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(perm)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(perm.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editing ? 'Edit Permission' : 'Add New Permission'}
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
                      placeholder="Permission name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text" value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="permission-slug"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                    <select
                      value={formData.module}
                      onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {moduleOptions.map((m) => (
                        <option key={m} value={m}>{m || '(none)'}</option>
                      ))}
                    </select>
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
