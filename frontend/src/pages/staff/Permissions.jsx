import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const roles = ['Admin', 'Manager', 'Staff']

const allPermissions = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'recipe', label: 'Recipe' },
  { key: 'menu_order', label: 'Menu Order' },
  { key: 'reports', label: 'Reports' },
  { key: 'permissions', label: 'Permissions' },
]

const initialPermissions = {
  Admin: allPermissions.map((p) => p.key),
  Manager: ['dashboard', 'products', 'orders', 'inventory', 'recipe', 'menu_order', 'reports'],
  Staff: ['dashboard', 'menu_order'],
}

export default function Permissions() {
  const [permissions, setPermissions] = useState(initialPermissions)

  function toggle(role, key) {
    setPermissions((prev) => {
      const current = prev[role]
      return {
        ...prev,
        [role]: current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key],
      }
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Permissions</h1>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-medium bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4">Permission</th>
                  {roles.map((role) => (
                    <th key={role} className="px-6 py-4 text-center">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map((perm) => (
                  <tr key={perm.key} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">{perm.label}</td>
                    {roles.map((role) => {
                      const enabled = permissions[role].includes(perm.key)
                      return (
                        <td key={role} className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggle(role, perm.key)}
                            className={`w-6 h-6 rounded-md border-2 transition-colors flex items-center justify-center ${
                              enabled
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {enabled && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
