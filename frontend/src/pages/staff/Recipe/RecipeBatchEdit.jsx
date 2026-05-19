import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'

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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col"><Topbar /><main className="flex-1 flex items-center justify-center text-gray-500">Loading...</main></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <button onClick={() => navigate('/staff/recipe')} className="text-blue-600 hover:underline">&larr; Back to Recipes</button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-1">Batch Edit Recipe</h1>
            <p className="text-gray-500 mb-6">{product?.name ?? `Product #${productId}`} &mdash; {size?.name ?? `Size #${sizeId}`}</p>

            <form onSubmit={handleSubmit}>
              <table className="w-full mb-4">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="px-2 py-2">Ingredient</th>
                    <th className="px-2 py-2">Quantity</th>
                    <th className="px-2 py-2 w-16">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className={`border-b ${row._remove ? 'opacity-50 bg-gray-50' : ''}`}>
                      <td className="px-2 py-2">
                        <select
                          value={row.ingredient_id}
                          onChange={e => updateRow(row.key, 'ingredient_id', e.target.value)}
                          disabled={row._remove}
                          required
                          className="w-full border rounded px-2 py-1 text-sm"
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
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={row._remove}
                          onChange={() => toggleRemove(row.key)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" onClick={addRow} className="text-blue-600 hover:underline text-sm mb-4">+ Add Ingredient</button>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => navigate('/staff/recipe')} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
