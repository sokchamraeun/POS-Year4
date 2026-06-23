import { useEffect, useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import Loader from '../../components/shared/Loader.jsx'
import { getImageUrl } from '../../utils/image.js'

const API_BASE = import.meta.env.VITE_API_URL

function Avatar({ emp, size = 'sm' }) {
  const avatar = emp.user?.avatar
  const dim = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-8 h-8 text-xs'
  if (avatar) {
    return (
      <img
        src={getImageUrl(avatar)}
        alt={emp.full_name}
        className={`${dim} rounded-full object-cover shrink-0 ring-2 ring-white shadow`}
      />
    )
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0`}>
      {emp.full_name?.[0]?.toUpperCase()}
    </div>
  )
}

const emptyForm = {
  user_id: '',
  full_name: '',
  phone: '',
  position: '',
  salary: '',
  hire_date: '',
  status: true,
}

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

function Badge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      Inactive
    </span>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const token = localStorage.getItem('token')
  const authHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setError('')
      const [empRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/employees`, { headers: authHeaders }),
        fetch(`${API_BASE}/users`, { headers: authHeaders }),
      ])
      if (!empRes.ok) throw new Error('Failed to load employees')
      const empJson = await empRes.json()
      const usersJson = usersRes.ok ? await usersRes.json() : { data: [] }
      setEmployees(empJson.data ?? empJson)
      setUsers(usersJson.data ?? usersJson)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(emp) {
    setEditing(emp)
    setForm({
      user_id: emp.user_id ?? '',
      full_name: emp.full_name ?? '',
      phone: emp.phone ?? '',
      position: emp.position ?? '',
      salary: emp.salary ?? '',
      hire_date: emp.hire_date ? emp.hire_date.slice(0, 10) : '',
      status: emp.status ?? true,
    })
    setFormError('')
    setShowModal(true)
  }

  function openDetail(emp) {
    setDetail(emp)
    setShowDetail(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.full_name.trim()) { setFormError('Full name is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      const url = editing
        ? `${API_BASE}/employees/${editing.id}`
        : `${API_BASE}/employees`
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_id: form.user_id || null,
          salary: form.salary !== '' ? Number(form.salary) : 0,
          hire_date: form.hire_date || null,
          status: Boolean(form.status),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Save failed')
      setShowModal(false)
      fetchData()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(emp) {
    if (!confirm(`Delete "${emp.full_name}"?`)) return
    try {
      await fetch(`${API_BASE}/employees/${emp.id}`, { method: 'DELETE', headers: authHeaders })
      fetchData()
    } catch {}
  }

  const filtered = employees.filter((e) =>
    [e.full_name, e.position, e.phone].some((v) =>
      (v ?? '').toLowerCase().includes(search.toLowerCase())
    )
  )

  const total    = employees.length
  const active   = employees.filter((e) => e.status).length
  const inactive = total - active

  if (loading) return <Loader text="Loading employees" />

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage your employee records</p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              <span className="text-lg leading-none">+</span> Add Employee
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Employees', value: total,    accent: 'bg-blue-500' },
              { label: 'Active',          value: active,   accent: 'bg-emerald-500' },
              { label: 'Inactive',        value: inactive, accent: 'bg-slate-400' },
            ].map((s) => (
              <div key={s.label} className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${s.accent}`} />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700">{filtered.length} employee{filtered.length !== 1 ? 's' : ''}</p>
              <input
                type="text"
                placeholder="Search name, position, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400 w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-teal-50">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Position</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Salary</th>
                    <th className="px-5 py-3">Hire Date</th>
                    <th className="px-5 py-3">Linked User</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-slate-400 text-sm">
                        No employees found.
                      </td>
                    </tr>
                  ) : filtered.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <Avatar emp={emp} size="sm" />
                          {emp.full_name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{emp.position || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{emp.phone || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">${Number(emp.salary ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{fmt(emp.hire_date)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{emp.user?.name || '—'}</td>
                      <td className="px-5 py-3.5"><Badge active={emp.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDetail(emp)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">View</button>
                          <button onClick={() => openEdit(emp)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                          <button onClick={() => handleDelete(emp)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Position</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Barista"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="500.00"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Hire Date</label>
                  <input
                    type="date"
                    value={form.hire_date}
                    onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Linked User Account</label>
                  <select
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-white"
                  >
                    <option value="">— None —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role?.name ?? 'No role'})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                  <div className="flex gap-3">
                    {[{ label: 'Active', val: true }, { label: 'Inactive', val: false }].map(({ label, val }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setForm({ ...form, status: val })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          form.status === val
                            ? 'bg-blue-600 text-white border-teal-600 shadow-md shadow-blue-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-teal-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-60">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Employee Detail</h2>
              <button onClick={() => setShowDetail(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
            </div>

            <div className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="mb-3">
                  <Avatar emp={detail} size="lg" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{detail.full_name}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{detail.position || 'No position'}</p>
                <div className="mt-2"><Badge active={detail.status} /></div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Phone',        value: detail.phone || '—' },
                  { label: 'Salary',       value: `$${Number(detail.salary ?? 0).toFixed(2)}` },
                  { label: 'Hire Date',    value: fmt(detail.hire_date) },
                  { label: 'Linked User',  value: detail.user ? `${detail.user.name} (${detail.user.role?.name ?? 'No role'})` : '—' },
                  { label: 'Created',      value: fmt(detail.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowDetail(false); openEdit(detail) }} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Edit
                </button>
                <button onClick={() => setShowDetail(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-teal-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
