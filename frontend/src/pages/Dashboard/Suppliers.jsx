import { useEffect, useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_BASE = import.meta.env.VITE_API_URL

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  status: true,
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }

  async function fetchSuppliers() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/suppliers`, { headers })
      const data = await res.json()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(s) {
    setEditItem(s)
    setForm({
      name: s.name || '',
      phone: s.phone || '',
      email: s.email || '',
      address: s.address || '',
      status: s.status ?? true,
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Supplier name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const url = editItem
        ? `${API_BASE}/suppliers/${editItem.id}`
        : `${API_BASE}/suppliers`
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err?.errors ? Object.values(err.errors).flat().join('\n') : err?.message
        setError(msg || `Failed to save (HTTP ${res.status}).`)
        return
      }
      setShowModal(false)
      fetchSuppliers()
    } catch (e) {
      setError(e?.message || 'Network error.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await fetch(`${API_BASE}/suppliers/${deleteId}`, { method: 'DELETE', headers })
      setDeleteId(null)
      fetchSuppliers()
    } catch {}
  }

  const activeCount = suppliers.filter(s => s.status).length
  const inactiveCount = suppliers.filter(s => !s.status).length

  return (
    <div className="flex h-screen bg-orange-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage your ingredient suppliers</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Supplier
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{suppliers.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Inactive</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{inactiveCount}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 mb-4">
            <div className="p-4 border-b border-orange-100">
              <div className="relative max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, phone, email…"
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-16"><Loader page={false} text="Loading suppliers..." /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No suppliers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-100 bg-orange-50/50">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">#</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Phone</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Address</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Orders</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {filtered.map((s, i) => (
                      <tr key={s.id} className="hover:bg-orange-50/40 transition">
                        <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                        <td className="px-4 py-3 text-slate-600">{s.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{s.email || '—'}</td>
                        <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{s.address || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{s.purchase_orders_count ?? 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {s.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setDetailItem(s)}
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button onClick={() => openEdit(s)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => setDeleteId(s.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
              <h2 className="text-lg font-bold text-slate-800">{editItem ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Supplier name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Phone number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Email address" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" placeholder="Address" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, status: !f.status }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status ? 'bg-green-500' : 'bg-slate-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-slate-600">{form.status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-orange-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                {saving ? 'Saving…' : editItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
              <h2 className="text-lg font-bold text-slate-800">Supplier Detail</h2>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                ['Name', detailItem.name],
                ['Phone', detailItem.phone || '—'],
                ['Email', detailItem.email || '—'],
                ['Address', detailItem.address || '—'],
                ['Orders', detailItem.purchase_orders_count ?? 0],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-800 font-medium text-right max-w-[200px]">{val}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detailItem.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {detailItem.status ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-orange-100 flex gap-2">
              <button onClick={() => { setDetailItem(null); openEdit(detailItem) }}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg text-sm font-medium transition">
                Edit
              </button>
              <button onClick={() => setDetailItem(null)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Supplier?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
