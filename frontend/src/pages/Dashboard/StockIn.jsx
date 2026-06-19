import { useEffect, useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'
import Loader from '../../components/shared/Loader.jsx'

const API_BASE = import.meta.env.VITE_API_URL

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-700',
  Received: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
}

const emptyItem = { ingredient_id: '', quantity: '', unit_cost: '', subtotal: '' }

const emptyForm = {
  supplier_id: '',
  purchase_date: new Date().toISOString().slice(0, 10),
  status: 'Pending',
  note: '',
  items: [{ ...emptyItem }],
}

function calcSubtotal(item) {
  const qty = parseFloat(item.quantity) || 0
  const cost = parseFloat(item.unit_cost) || 0
  return (qty * cost).toFixed(2)
}

export default function StockIn() {
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [detailItem, setDetailItem] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` }

  async function fetchOrders() {
    setLoading(true)
    try {
      const params = filterStatus ? `?status=${filterStatus}` : ''
      const res = await fetch(`${API_BASE}/purchase-orders${params}`, { headers })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchMeta() {
    try {
      const [supRes, ingRes] = await Promise.all([
        fetch(`${API_BASE}/suppliers`, { headers }),
        fetch(`${API_BASE}/ingredients?per_page=1000`, { headers }),
      ])
      const [sups, ings] = await Promise.all([supRes.json(), ingRes.json()])
      // suppliers returns array; ingredients returns paginated {data:[...]} or plain array
      const supList = Array.isArray(sups) ? sups : []
      const ingList = Array.isArray(ings) ? ings : (Array.isArray(ings?.data) ? ings.data : [])
      setSuppliers(supList)
      setIngredients(ingList)
      return { suppliers: supList, ingredients: ingList }
    } catch {
      return { suppliers: [], ingredients: [] }
    }
  }

  useEffect(() => { fetchOrders(); fetchMeta() }, [])
  useEffect(() => {
    if (filterStatus !== undefined) fetchOrders()
  }, [filterStatus])

  async function openAdd() {
    setEditItem(null)
    setForm({ ...emptyForm, purchase_date: new Date().toISOString().slice(0, 10), items: [{ ...emptyItem }] })
    setError('')
    if (ingredients.length === 0) await fetchMeta()
    setShowModal(true)
  }

  async function openEdit(order) {
    setEditItem(order)
    const fetches = [fetch(`${API_BASE}/purchase-orders/${order.id}`, { headers })]
    // Reload meta if not yet available
    if (ingredients.length === 0) {
      fetches.push(fetch(`${API_BASE}/suppliers`, { headers }))
      fetches.push(fetch(`${API_BASE}/ingredients`, { headers }))
    }
    const [res, supRes, ingRes] = await Promise.all(fetches)
    const data = await res.json()
    if (supRes && ingRes) {
      const [sups, ings] = await Promise.all([supRes.json(), ingRes.json()])
      setSuppliers(Array.isArray(sups) ? sups : [])
      setIngredients(Array.isArray(ings) ? ings : [])
    }
    setForm({
      supplier_id: data.supplier_id != null ? String(data.supplier_id) : '',
      purchase_date: data.purchase_date?.slice(0, 10) || '',
      status: data.status || 'Pending',
      note: data.note || '',
      items: (data.items || []).map(it => ({
        ingredient_id: it.ingredient_id != null ? String(it.ingredient_id) : '',
        quantity: it.quantity != null ? String(parseFloat(it.quantity)) : '',
        unit_cost: it.unit_cost != null ? String(parseFloat(it.unit_cost)) : '',
        subtotal: it.subtotal != null ? String(parseFloat(it.subtotal)) : '',
      })),
    })
    setError('')
    setShowModal(true)
  }

  async function openDetail(order) {
    setDetailItem(order)
    const res = await fetch(`${API_BASE}/purchase-orders/${order.id}`, { headers })
    const data = await res.json()
    setDetailData(data)
  }

  function setItemField(idx, field, value) {
    setForm(f => {
      const items = f.items.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: value }
        if (field === 'quantity' || field === 'unit_cost') {
          const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0
          const cost = parseFloat(field === 'unit_cost' ? value : updated.unit_cost) || 0
          updated.subtotal = qty > 0 && cost > 0 ? (qty * cost).toFixed(2) : ''
        }
        return updated
      })
      return { ...f, items }
    })
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }))
  }

  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  const total = form.items.reduce((sum, it) => sum + (parseFloat(it.subtotal) || 0), 0)

  async function handleSave() {
    if (!form.supplier_id) { setError('Please select a supplier.'); return }
    if (!form.purchase_date) { setError('Please select a date.'); return }
    for (const it of form.items) {
      if (!it.ingredient_id) { setError('Please select ingredient for all rows.'); return }
      if (!it.quantity || parseFloat(it.quantity) <= 0) { setError('Quantity must be > 0.'); return }
      if (it.unit_cost === '' || parseFloat(it.unit_cost) < 0) { setError('Unit cost must be ≥ 0.'); return }
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        supplier_id: parseInt(form.supplier_id),
        items: form.items.map(it => ({
          ingredient_id: parseInt(it.ingredient_id),
          quantity: parseFloat(it.quantity),
          unit_cost: parseFloat(it.unit_cost),
          subtotal: parseFloat(it.subtotal),
        })),
      }
      const url = editItem
        ? `${API_BASE}/purchase-orders/${editItem.id}`
        : `${API_BASE}/purchase-orders`
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      if (!res.ok) {
        const err = await res.json()
        setError(err.message || 'Failed to save.')
        return
      }
      setShowModal(false)
      fetchOrders()
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`${API_BASE}/purchase-orders/${deleteId}`, { method: 'DELETE', headers })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Cannot delete.')
        return
      }
      setDeleteId(null)
      fetchOrders()
    } catch {}
  }

  async function markAsReceived(order) {
    if (!window.confirm(`Mark PO-${String(order.id).padStart(4, '0')} as Received?\nThis will add stock to ingredients.`)) return
    try {
      const res = await fetch(`${API_BASE}/purchase-orders/${order.id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status: 'Received' }),
      })
      if (!res.ok) { const e = await res.json(); alert(e.message || 'Failed.'); return }
      setDetailItem(null); setDetailData(null)
      fetchOrders()
    } catch {}
  }

  async function cancelOrder(order) {
    const warning = order.status === 'Received' ? '\nThis will reverse stock deductions.' : ''
    if (!window.confirm(`Cancel PO-${String(order.id).padStart(4, '0')}?${warning}`)) return
    try {
      const res = await fetch(`${API_BASE}/purchase-orders/${order.id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status: 'Cancelled' }),
      })
      if (!res.ok) { const e = await res.json(); alert(e.message || 'Failed.'); return }
      setDetailItem(null); setDetailData(null)
      fetchOrders()
    } catch {}
  }

  function poPad(id) { return `PO-${String(id).padStart(4, '0')}` }

  async function printPO(orderId) {
    const res = await fetch(`${API_BASE}/purchase-orders/${orderId}`, { headers })
    const po = await res.json()

    const fmtDate = (d) => {
      if (!d) return '—'
      const dt = new Date(d)
      return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const rows = (po.items || []).map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.ingredient?.name || '—'}</td>
        <td style="text-align:right">${parseFloat(it.quantity).toFixed(2)}</td>
        <td style="text-align:center">${it.ingredient?.unit || '—'}</td>
        <td style="text-align:right">$${parseFloat(it.unit_cost).toFixed(4)}</td>
        <td style="text-align:right">$${parseFloat(it.subtotal).toFixed(2)}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${poPad(po.id)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Courier New',monospace;font-size:12px;padding:24px 32px;color:#000;max-width:700px;margin:auto}
  .shop-name{text-align:center;font-size:18px;font-weight:bold;letter-spacing:1px;text-transform:uppercase}
  .shop-sub{text-align:center;font-size:11px;margin-bottom:12px}
  .po-title{text-align:center;font-size:14px;font-weight:bold;letter-spacing:3px;margin:10px 0}
  .divider{border-top:2px solid #000;margin:6px 0}
  .thin{border-top:1px solid #000;margin:6px 0}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 20px;margin:12px 0 8px}
  .info-row{display:flex;gap:6px;line-height:1.7}
  .lbl{font-weight:bold;min-width:90px;white-space:nowrap}
  table{width:100%;border-collapse:collapse;font-size:11px;margin:10px 0}
  th{border-top:2px solid #000;border-bottom:1px solid #000;padding:5px 4px;text-align:left;font-weight:bold}
  td{padding:4px;vertical-align:top}
  tbody tr:last-child td{border-bottom:1px solid #000}
  tbody tr:nth-child(even){background:#f9f9f9}
  .total-line{text-align:right;font-size:13px;font-weight:bold;margin:6px 0}
  .note{margin:10px 0;font-size:11px}
  .sigs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:40px}
  .sig{text-align:center}
  .sig-line{border-top:1px solid #000;padding-top:4px;margin-top:32px;font-size:10px}
  .status{display:inline-block;font-weight:bold;font-size:11px}
  @media print{body{padding:8px 16px}}
</style>
</head>
<body>
  <div class="shop-name">The Bird's Nest Coffee</div>
  <div class="shop-sub">Phone: 012-345-678</div>
  <div class="divider"></div>
  <div class="po-title">PURCHASE ORDER</div>
  <div class="divider"></div>

  <div class="info-grid">
    <div>
      <div class="info-row"><span class="lbl">PO No:</span>${poPad(po.id)}</div>
      <div class="info-row"><span class="lbl">Date:</span>${fmtDate(po.purchase_date)}</div>
      <div class="info-row"><span class="lbl">Status:</span><span class="status">${po.status}</span></div>
    </div>
    <div>
      <div class="info-row"><span class="lbl">Supplier:</span>${po.supplier?.name || '—'}</div>
      <div class="info-row"><span class="lbl">Phone:</span>${po.supplier?.phone || '—'}</div>
      <div class="info-row"><span class="lbl">Created By:</span>${po.user?.name || '—'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px">No</th>
        <th>Ingredient</th>
        <th style="width:70px;text-align:right">Qty</th>
        <th style="width:44px;text-align:center">Unit</th>
        <th style="width:86px;text-align:right">Unit Cost</th>
        <th style="width:86px;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total-line">Total Amount: $${parseFloat(po.total_amount || 0).toFixed(2)}</div>

  ${po.note ? `<div class="note"><strong>Note:</strong> ${po.note}</div>` : ''}

  <div class="divider" style="margin-top:16px"></div>

  <div class="sigs">
    <div class="sig"><div class="sig-line">Prepared By</div></div>
    <div class="sig"><div class="sig-line">Supplier Signature</div></div>
    <div class="sig"><div class="sig-line">Received By</div></div>
  </div>
</body></html>`

    const win = window.open('', '_blank', 'width=800,height=700')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 600)
  }

  const totalAmount = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
  const receivedCount = orders.filter(o => o.status === 'Received').length
  const pendingCount = orders.filter(o => o.status === 'Pending').length

  return (
    <div className="flex h-screen bg-orange-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Stock In</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage purchase orders and stock receiving</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Purchase Order
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-slate-800' },
              { label: 'Received', value: receivedCount, color: 'text-green-600' },
              { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
              { label: 'Total Value', value: `$${totalAmount.toFixed(2)}`, color: 'text-teal-700' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-orange-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter + Table */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100">
            <div className="p-4 border-b border-orange-100 flex items-center gap-3">
              {['', 'Pending', 'Received', 'Cancelled'].map(s => (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatus === s ? 'bg-amber-900 text-white' : 'bg-orange-50 text-slate-600 hover:bg-orange-100'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader page={false} text="Loading purchase orders..." /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No purchase orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-100 bg-orange-50/50">
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">#</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Supplier</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Items</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Total</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">By</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-orange-50/40 transition">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{poPad(o.id)}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{o.supplier?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{o.purchase_date?.slice(0, 10)}</td>
                        <td className="px-4 py-3 text-slate-600">{o.items_count ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-500">{o.user?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <button onClick={() => openDetail(o)} title="View"
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Print */}
                            <button onClick={() => printPO(o.id)} title="Print"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                            {/* Edit — Pending only */}
                            {o.status === 'Pending' && (
                              <button onClick={() => openEdit(o)} title="Edit"
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {/* Mark as Received — Pending only */}
                            {o.status === 'Pending' && (
                              <button onClick={() => markAsReceived(o)} title="Mark as Received"
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            {/* Cancel — Pending only */}
                            {o.status === 'Pending' && (
                              <button onClick={() => cancelOrder(o)} title="Cancel"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? `Edit ${poPad(editItem.id)}` : 'New Purchase Order'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 space-y-5">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

              {/* Header fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Supplier <span className="text-red-500">*</span></label>
                  <select
                    value={form.supplier_id}
                    onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                    <option value="">— Select supplier —</option>
                    {suppliers.filter(s => s.status).map(s => (
                      <option key={s.id} value={String(s.id)}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
                  <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Optional note" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Items</label>
                  <button onClick={addItem} className="text-xs text-amber-900 hover:text-amber-700 font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 font-medium px-1">
                    <span className="col-span-5">Ingredient</span>
                    <span className="col-span-2">Qty</span>
                    <span className="col-span-2">Unit Cost</span>
                    <span className="col-span-2">Subtotal</span>
                    <span className="col-span-1"></span>
                  </div>
                  {form.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          value={it.ingredient_id}
                          onChange={e => setItemField(idx, 'ingredient_id', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                          <option value="">— Select ingredient —</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={String(ing.id)}>{ing.name} ({ing.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.01"
                          value={it.quantity}
                          onChange={e => setItemField(idx, 'quantity', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="0" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.01"
                          value={it.unit_cost}
                          onChange={e => setItemField(idx, 'unit_cost', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="0.00" />
                      </div>
                      <div className="col-span-2">
                        <input readOnly
                          value={it.subtotal !== '' && it.subtotal !== undefined ? Number(it.subtotal).toFixed(2) : ''}
                          placeholder="0.00"
                          className="w-full border border-slate-100 bg-orange-50 rounded-lg px-2 py-1.5 text-sm text-slate-600" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 pr-8">
                  <span className="text-sm font-bold text-slate-800">
                    Total: <span className="text-teal-700">${total.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-orange-100 shrink-0">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                {saving ? 'Saving…' : editItem ? 'Update' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{poPad(detailItem.id)}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[detailItem.status]}`}>{detailItem.status}</span>
              </div>
              <button onClick={() => { setDetailItem(null); setDetailData(null) }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-4">
              {!detailData ? (
                <div className="flex justify-center py-8"><Loader page={false} text="Loading..." /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Supplier', detailData.supplier?.name],
                      ['Date', detailData.purchase_date?.slice(0, 10)],
                      ['Created by', detailData.user?.name || '—'],
                      ['Note', detailData.note || '—'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="font-medium text-slate-800">{val}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Items</p>
                    <div className="space-y-1">
                      <div className="grid grid-cols-4 text-xs text-slate-400 font-medium px-1">
                        <span className="col-span-2">Ingredient</span>
                        <span>Qty</span>
                        <span className="text-right">Subtotal</span>
                      </div>
                      {(detailData.items || []).map(it => (
                        <div key={it.id} className="grid grid-cols-4 text-sm px-1 py-1 rounded hover:bg-orange-50">
                          <span className="col-span-2 text-slate-700">{it.ingredient?.name} <span className="text-slate-400 text-xs">({it.ingredient?.unit})</span></span>
                          <span className="text-slate-600">{parseFloat(it.quantity).toFixed(2)}</span>
                          <span className="text-right font-medium text-slate-800">${parseFloat(it.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-orange-100">
                    <span className="text-sm text-slate-500">Total Amount</span>
                    <span className="text-lg font-bold text-teal-700">${parseFloat(detailData.total_amount || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-orange-100 shrink-0 space-y-2">
              {/* Row 1: primary actions */}
              <div className="flex gap-2">
                {detailItem.status === 'Pending' && (
                  <button onClick={() => markAsReceived(detailItem)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">
                    Mark as Received
                  </button>
                )}
                <button onClick={() => printPO(detailItem.id)}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
              {/* Row 2: secondary actions */}
              <div className="flex gap-2">
                {detailItem.status === 'Pending' && (
                  <button onClick={() => { setDetailItem(null); setDetailData(null); openEdit(detailItem) }}
                    className="flex-1 bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg text-sm font-medium transition">
                    Edit
                  </button>
                )}
                {detailItem.status === 'Pending' && (
                  <button onClick={() => cancelOrder(detailItem)}
                    className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                    Cancel PO
                  </button>
                )}
                <button onClick={() => { setDetailItem(null); setDetailData(null) }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                  Close
                </button>
              </div>
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
            <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Purchase Order?</h3>
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
