export default function RoleFormModal({ editing, formData, allPermissions, moduleFilter, modules, saving, onFormChange, onModuleFilterChange, onTogglePermission, onSave, onClose, resetForm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border-2 border-slate-300">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{editing ? 'Edit Role' : 'Create New Role'}</h2>
            <p className="text-xs text-gray-600 mt-0.5">{editing ? 'Update role information' : 'Add a new role to the system'}</p>
          </div>
          <button onClick={() => { onClose(); resetForm() }} className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:rotate-90 bg-slate-200 rounded-full p-1 hover:bg-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name <span className="text-gray-400">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => onFormChange({ ...formData, name: e.target.value })} placeholder="e.g., Administrator, Editor, Viewer" className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-all duration-200 text-gray-800 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Slug <span className="text-gray-400">*</span></label>
            <input type="text" value={formData.slug} onChange={(e) => onFormChange({ ...formData, slug: e.target.value })} placeholder="e.g., admin, editor, viewer" className="w-full border-2 border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-all duration-200 font-mono text-gray-800 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Permissions</label>
            <div className="flex items-center gap-2 mb-3">
              <select value={moduleFilter} onChange={(e) => onModuleFilterChange(e.target.value)} className="w-full border-2 border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200 transition-all duration-200 text-gray-800 bg-white">
                <option value="">All Modules</option>
                {modules.map((mod) => (<option key={mod} value={mod}>{mod}</option>))}
              </select>
            </div>
            <div className="border-2 border-slate-300 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50/30">
              {allPermissions.filter((perm) => !moduleFilter || perm.module === moduleFilter).map((perm) => (
                <label key={perm.id} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-100/70 p-2 rounded-lg transition-all duration-150">
                  <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => onTogglePermission(perm.id)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-2 cursor-pointer" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-800 transition-colors font-medium">{perm.name}</span>
                </label>
              ))}
              {allPermissions.filter((perm) => !moduleFilter || perm.module === moduleFilter).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No permissions available in this module</p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-slate-300 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={() => { onClose(); resetForm() }} className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-300">Cancel</button>
          <button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Role'}
          </button>
        </div>
      </div>
    </div>
  )
}
