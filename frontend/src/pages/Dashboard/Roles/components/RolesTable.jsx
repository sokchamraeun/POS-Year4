export default function RolesTable({ roles, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 font-semibold bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-300">
            <th className="px-6 py-4 w-16">ID</th>
            <th className="px-6 py-4">Role Name</th>
            <th className="px-6 py-4">Slug</th>
            <th className="px-6 py-4">Permissions</th>
            <th className="px-6 py-4 w-64">Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="border-b border-teal-100 hover:bg-teal-50/50 transition-all duration-150">
              <td className="px-6 py-4 text-teal-500 text-xs font-mono font-semibold">#{String(role.id).padStart(2, '0')}</td>
              <td className="px-6 py-4">
                <span className="font-semibold text-gray-800">{role.name}</span>
              </td>
              <td className="px-6 py-4">
                <code className="text-teal-700 text-xs font-mono bg-teal-100 px-2 py-1 rounded-md">{role.slug}</code>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {role.permissions.length} Permission{role.permissions.length !== 1 ? 's' : ''}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => onView(role)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View
                  </button>
                  <button onClick={() => onEdit(role)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit
                  </button>
                  <button onClick={() => onDelete(role.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-all duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
