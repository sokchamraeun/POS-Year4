export default function RoleDetailModal({ role, onClose, onEdit }) {
  if (!role) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border-2 border-amber-800">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-amber-800 bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-amber-900">Role Details</h2>
            <p className="text-xs text-amber-700 mt-0.5">View complete role information</p>
          </div>
          <button onClick={onClose} className="text-amber-600 hover:text-amber-800 transition-all duration-200 hover:rotate-90 bg-amber-200 rounded-full p-1 hover:bg-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <label className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Role Name</label>
              <p className="text-lg font-bold text-amber-900 mt-1">{role.name}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <label className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Slug</label>
              <code className="block text-md font-mono text-amber-800 mt-1 bg-white/50 px-2 py-1 rounded">{role.slug}</code>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-amber-800">Permissions Assigned</label>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300">
                Total: {role.permissions.length}
              </span>
            </div>
            <div className="border-2 border-amber-800 rounded-xl overflow-hidden bg-white">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-amber-800">
                    <tr className="text-left text-white font-semibold">
                      <th className="px-4 py-3 w-16">#</th>
                      <th className="px-4 py-3">Permission Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {role.permissions.length > 0 ? (
                      role.permissions.map((p, idx) => (
                        <tr key={p.id} className="border-b border-amber-200 hover:bg-teal-50 transition-colors">
                          <td className="px-4 py-3 text-amber-600 text-xs font-mono font-semibold">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              {p.name}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-amber-400">
                          <svg className="w-12 h-12 mx-auto mb-2 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          No permissions assigned to this role
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-amber-800 bg-amber-50/50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={() => { onClose(); onEdit(role) }} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Role
          </button>
          <button onClick={onClose} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
