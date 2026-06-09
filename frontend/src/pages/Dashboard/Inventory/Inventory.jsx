import { useState, useEffect } from 'react'
import Sidebar from '../../../components/staff/Sidebar.jsx'
import Topbar from '../../../components/staff/Topbar.jsx'
import Loader from '../../../components/shared/Loader.jsx'

const API_URL = import.meta.env.VITE_API_URL

export default function Inventory() {
  const [ingredients, setIngredients] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTxModal, setShowTxModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState(null)
  const [txForm, setTxForm] = useState({ type: 'purchase', quantity: '', note: '' })
  const [txPage, setTxPage] = useState(1)
  const [txLastPage, setTxLastPage] = useState(1)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchData = () => {
    Promise.all([
      fetch(`${API_URL}/ingredients`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/inventory-transactions?page=${txPage}`, { headers }).then(r => r.json()),
    ])
      .then(([ingJson, txJson]) => {
        setIngredients(ingJson.data ?? ingJson ?? [])
        setTransactions(txJson.data ?? txJson ?? [])
        setTxLastPage(txJson.last_page ?? 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [txPage])

  const openTx = (ing, type) => {
    setSelectedIngredient(ing)
    setTxForm({ type, quantity: '', note: '' })
    setShowTxModal(true)
  }

  const handleTx = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/inventory-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          ingredient_id: selectedIngredient.id,
          type: txForm.type,
          quantity: txForm.quantity,
          note: txForm.note,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed')
      }

      setShowTxModal(false)
      setSelectedIngredient(null)
      fetchData()
    } catch (err) {
      alert(err.message)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const typeColors = {
    purchase: 'text-emerald-700 bg-emerald-100 border border-emerald-200',
    deduct: 'text-rose-700 bg-rose-100 border border-rose-200',
    adjust: 'text-sky-700 bg-sky-100 border border-sky-200',
  }

  const lowStockCount = ingredients.filter(
    ing => Number(ing.stock_quantity) <= Number(ing.reorder_level)
  ).length

  const totalTransactions = ingredients.reduce(
    (sum, ing) => sum + Number(ing.inventory_transactions_count ?? 0),
    0
  )

  const getStockStatus = (ing) => {
    const stock = Number(ing.stock_quantity)
    const reorder = Number(ing.reorder_level)

    if (stock <= reorder) {
      return {
        text: 'Low Stock',
        badge: 'bg-rose-100 text-rose-700 border-rose-200',
        bar: 'bg-rose-500',
      }
    }

    if (stock <= reorder * 2) {
      return {
        text: 'Medium',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
      }
    }

    return {
      text: 'Good',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
    }
  }

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-teal-600">Stock Management</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">Inventory</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage ingredient stock, purchases, deductions and adjustments.
                </p>
              </div>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
              >
                {showHistory ? 'Adjust Stock' : 'Transaction History'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                <p className="text-xs text-teal-600 font-semibold">Ingredients</p>
                <p className="text-2xl font-bold text-teal-900 mt-1">{ingredients.length}</p>
              </div>

              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
                <p className="text-xs text-rose-600 font-semibold">Low Stock</p>
                <p className="text-2xl font-bold text-rose-900 mt-1">{lowStockCount}</p>
              </div>

              <div className="rounded-xl bg-sky-50 border border-sky-100 p-4">
                <p className="text-xs text-sky-600 font-semibold">Transactions</p>
                <p className="text-2xl font-bold text-sky-900 mt-1">{totalTransactions}</p>
              </div>
            </div>
          </div>

          {!showHistory ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {ingredients.map((ing) => {
                  const status = getStockStatus(ing)
                  const stock = Number(ing.stock_quantity)
                  const reorder = Number(ing.reorder_level)
                  const percent = Math.min(100, Math.max(8, reorder > 0 ? (stock / (reorder * 3)) * 100 : 100))

                  return (
                    <div
                      key={ing.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                            {ing.name?.charAt(0)?.toUpperCase() || 'I'}
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900">{ing.name}</h3>
                            <span className="text-xs text-gray-400">{ing.unit}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status.badge}`}>
                          {status.text}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-1">In Stock</div>
                        <div className="flex items-end gap-1">
                          <div className="text-3xl font-black text-gray-900">
                            {stock.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">{ing.unit}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Reorder level: {reorder.toFixed(2)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${status.bar}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        {ing.inventory_transactions_count ?? 0} transaction(s)
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <button
                          onClick={() => openTx(ing, 'purchase')}
                          className="bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Purchase
                        </button>

                        <button
                          onClick={() => openTx(ing, 'deduct')}
                          className="bg-rose-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                        >
                          Deduct
                        </button>

                        <button
                          onClick={() => openTx(ing, 'adjust')}
                          className="bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>
                  )
                })}

                {ingredients.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-gray-200 text-center text-gray-500 py-10">
                    No ingredients found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 font-semibold bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Ingredient</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Note</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {formatDate(tx.created_at)}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {tx.ingredient?.name ?? '—'}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${typeColors[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`font-bold ${Number(tx.quantity) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(tx.quantity) > 0 ? '+' : ''}
                            {Number(tx.quantity).toFixed(2)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {tx.note ?? '—'}
                        </td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {txLastPage > 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Page {txPage} of {txLastPage}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                      disabled={txPage <= 1}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    <button
                      onClick={() => setTxPage(p => Math.min(txLastPage, p + 1))}
                      disabled={txPage >= txLastPage}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showTxModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="mb-5">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-3">
                {selectedIngredient.name?.charAt(0)?.toUpperCase() || 'I'}
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                {txForm.type === 'purchase'
                  ? 'Purchase Stock'
                  : txForm.type === 'deduct'
                    ? 'Deduct Stock'
                    : 'Adjust Stock'}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {selectedIngredient.name} ({selectedIngredient.unit}) — Current:{' '}
                <span className="font-semibold text-gray-700">
                  {Number(selectedIngredient.stock_quantity).toFixed(2)}
                </span>
              </p>
            </div>

            <form onSubmit={handleTx}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Quantity
                </label>

                <input
                  type="number"
                  value={txForm.quantity}
                  onChange={e => setTxForm({ ...txForm, quantity: e.target.value })}
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Enter quantity"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Note (optional)
                </label>

                <input
                  type="text"
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  placeholder="Write note"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowTxModal(false)
                    setSelectedIngredient(null)
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                    txForm.type === 'purchase'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : txForm.type === 'deduct'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-sky-600 hover:bg-sky-700'
                  }`}
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