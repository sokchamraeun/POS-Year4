import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function RecipeBatchEdit() {
  const { productId, sizeId } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [product, setProduct] = useState(null)
  const [size, setSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/recipes?product_id=${productId}&size_id=${sizeId}`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
    ]).then(([recJson, ingJson]) => {
      const recipes = recJson.data ?? recJson ?? []
      setRows(recipes.length > 0
        ? recipes.map(r => ({
            key: r.id,
            ingredient_id: r.ingredient_id,
            quantity: r.quantity,
            _remove: false,
          }))
        : [{ key: Date.now(), ingredient_id: '', quantity: '', _remove: false }]
      )
      if (recipes.length > 0) {
        setProduct(recipes[0].product)
        setSize(recipes[0].size)
      }
      setIngredients(ingJson.data ?? ingJson ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [productId, sizeId])

  const addRow = () => {
    setRows([...rows, { key: Date.now(), ingredient_id: '', quantity: '', _remove: false }])
  }

  const updateRow = (key, field, value) => {
    setRows(rows.map(r => r.key === key ? { ...r, [field]: value } : r))
  }

  const toggleRemove = (key) => {
    setRows(rows.map(r => r.key === key ? { ...r, _remove: !r._remove } : r))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const active = rows.filter(r => !r._remove)
    if (active.length === 0) { alert('At least one ingredient is required.'); return }

    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/recipes/batch-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          product_id: productId,
          size_id: sizeId,
          recipes: active.map(r => ({ ingredient_id: r.ingredient_id, quantity: r.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      navigate('/staff/recipe')
    } catch (err) {
      alert(err.message)
      setSaving(false)
    }
  }

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <button onClick={() => navigate('/staff/recipe')} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Recipes
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h1 className="text-lg font-bold text-slate-800">Batch Edit Recipe</h1>
              <p className="text-sm text-slate-400 mt-0.5">{product?.name ?? `Product #${productId}`} &mdash; {size?.name ?? `Size #${sizeId}`}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="px-2 py-2">Ingredient</th>
                    <th className="px-2 py-2">Quantity</th>
                    <th className="px-2 py-2 w-16">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => (
                    <tr key={row.key} className={row._remove ? 'opacity-50 bg-slate-50' : ''}>
                      <td className="px-2 py-2">
                        <select
                          value={row.ingredient_id}
                          onChange={e => updateRow(row.key, 'ingredient_id', e.target.value)}
                          disabled={row._remove}
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400 bg-white"
                        >
                          <option value="">Select ingredient</option>
                          {ingredients.map(i => (
                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={e => updateRow(row.key, 'quantity', e.target.value)}
                          step="0.01"
                          min="0.01"
                          disabled={row._remove}
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-400"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={row._remove}
                          onChange={() => toggleRemove(row.key)}
                          className="accent-teal-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" onClick={addRow} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors mb-6">
                <Plus className="h-3.5 w-3.5 inline" /> Add Ingredient
              </button>

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => navigate('/staff/recipe')} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-teal-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
