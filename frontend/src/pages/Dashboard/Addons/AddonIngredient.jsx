import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function AddonIngredient() {
  const [addons, setAddons] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ addon_id: '', ingredient_id: '', quantity: '' })

  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchData = () => {
    setLoading(true)

    Promise.all([
      fetch(`${API_URL}/addon-ingredients`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
    ])
      .then(([addonJson, ingJson]) => {
        setAddons(addonJson.data ?? addonJson)
        setIngredients(ingJson.data ?? ingJson)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreate = (addonId = '') => {
    setEditing(null)
    setForm({ addon_id: addonId, ingredient_id: '', quantity: '' })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      addon_id: item.addon_id,
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const url = editing
      ? `${API_URL}/addon-ingredients/${editing.id}`
      : `${API_URL}/addon-ingredients`

    const method = editing ? 'PUT' : 'POST'

    const body = editing
      ? { quantity: form.quantity }
      : form

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed')

      setShowModal(false)
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this ingredient?')) return

    await fetch(`${API_URL}/addon-ingredients/${id}`, {
      method: 'DELETE',
      headers,
    })

    fetchData()
  }

  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Addon Ingredients
              </h1>
              <p className="text-sm text-gray-500">
                Manage addon composition
              </p>
            </div>

            <button
              onClick={() => openCreate()}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
            >
              + Add Ingredient
            </button>
          </div>

          {/* CONTENT GRID (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {loading ? <Loader page={false} text="Loading..." /> : error ? (
              <div className="col-span-2 text-center py-10 text-red-500">
                {error}
              </div>
            ) : addons.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-500">
                No addons found
              </div>
            ) : (
              addons.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                >

                  {/* ADDON HEADER */}
                  <div className="flex justify-between items-center px-5 py-4 bg-slate-50 border-b border-slate-100">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {addon.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        ${Number(addon.price).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => openCreate(addon.id)}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                    >
                      + Add
                    </button>
                  </div>

                  {/* TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">

                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b">
                          <th className="px-5 py-3">Ingredient</th>
                          <th className="px-5 py-3">Qty</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody>

                        {addon.ingredients?.length ? (
                          addon.ingredients.map((ing) => (
                            <tr
                              key={ing.pivot.id}
                              className="border-t hover:bg-slate-50 transition"
                            >
                              <td className="px-5 py-3 text-gray-800">
                                {ing.name}
                              </td>

                              <td className="px-5 py-3 text-gray-600">
                                {Number(ing.pivot.quantity).toFixed(2)} {ing.unit}
                              </td>

                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-2">

                                  <button
                                    onClick={() =>
                                      openEdit({
                                        id: ing.pivot.id,
                                        addon_id: addon.id,
                                        ingredient_id: ing.id,
                                        quantity: ing.pivot.quantity,
                                      })
                                    }
                                    className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    onClick={() => handleDelete(ing.pivot.id)}
                                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                  >
                                    Remove
                                  </button>

                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-5 py-6 text-center text-gray-400"
                            >
                              No ingredients
                            </td>
                          </tr>
                        )}

                      </tbody>

                    </table>
                  </div>

                </div>
              ))
            )}

          </div>

        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">

            <h2 className="text-lg font-bold mb-4">
              {editing ? 'Edit Ingredient' : 'Add Ingredient'}
            </h2>

            <form onSubmit={handleSubmit}>

              {!editing && (
                <>
                  <select
                    className="w-full mb-3 border border-gray-200 rounded-lg p-2"
                    value={form.addon_id}
                    onChange={(e) =>
                      setForm({ ...form, addon_id: e.target.value })
                    }
                  >
                    <option value="">Select Addon</option>
                    {addons.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full mb-3 border border-gray-200 rounded-lg p-2"
                    value={form.ingredient_id}
                    onChange={(e) =>
                      setForm({ ...form, ingredient_id: e.target.value })
                    }
                  >
                    <option value="">Select Ingredient</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <input
                type="number"
                step="0.01"
                className="w-full mb-4 border border-gray-200 rounded-lg p-2"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                placeholder="Quantity"
              />

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Save
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}