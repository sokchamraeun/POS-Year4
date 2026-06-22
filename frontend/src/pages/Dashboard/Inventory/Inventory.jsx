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
  const [saving, setSaving] = useState(false)
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
    setSaving(true)

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
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
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

  const totalStock = ingredients.reduce(
    (sum, ing) => sum + Number(ing.stock_quantity ?? 0),
    0
  )

  const getStockStatus = (ing) => {
    const stock = Number(ing.stock_quantity)
    const reorder = Number(ing.reorder_level)

    if (stock <= reorder) {
      return {
        text: 'Low Stock',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        bar: 'bg-rose-500',
        row: 'bg-rose-50/40',
      }
    }

    if (stock <= reorder * 2) {
      return {
        text: 'Medium',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
        row: 'bg-amber-50/30',
      }
    }

    return {
      text: 'Good',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
      row: 'bg-white',
    }
  }

  const getPercent = (ing) => {
    const stock = Number(ing.stock_quantity)
    const reorder = Number(ing.reorder_level)
    return Math.min(100, Math.max(8, reorder > 0 ? (stock / (reorder * 3)) * 100 : 100))
  }

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-[#f8f4ef]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Stock Management
                </div>

                <h1 className="text-3xl font-black text-[#2b170c]">
                  Inventory List
                </h1>

                <p className="text-sm text-stone-500 mt-2">
                  Manage ingredient stock, purchase, deduct, and adjust inventory.
                </p>
              </div>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-fit bg-amber-400 text-[#3b2415] px-5 py-3 rounded-2xl text-sm font-black hover:bg-amber-300 transition-all shadow-lg shadow-black/10"
              >
                {showHistory ? 'Back to Inventory List' : 'Transaction History'}
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-amber-300/30 bg-white/95 p-4 shadow-lg shadow-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Ingredients</p>
                <p className="mt-1.5 text-2xl font-extrabold text-stone-900">{ingredients.length}</p>
                <p className="mt-1 text-[11px] text-stone-500">Total ingredients</p>
              </div>

              <div className="rounded-2xl border border-rose-300/40 bg-white/95 p-4 shadow-lg shadow-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">Low Stock</p>
                <p className="mt-1.5 text-2xl font-extrabold text-stone-900">{lowStockCount}</p>
                <p className="mt-1 text-[11px] text-stone-500">Need restock</p>
              </div>

              <div className="rounded-2xl border border-emerald-300/40 bg-white/95 p-4 shadow-lg shadow-black/10">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Transactions</p>
                <p className="mt-1.5 text-2xl font-extrabold text-stone-900">{totalTransactions}</p>
                <p className="mt-1 text-[11px] text-stone-500">All movements</p>
              </div>

              <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-br from-[#c79255] to-[#8b5a2b] p-4 text-white shadow-lg shadow-amber-900/15">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100">Total Stock</p>
                <p className="mt-1.5 text-2xl font-extrabold">{totalStock.toFixed(0)}</p>
                <p className="mt-1 text-[11px] text-amber-50/85">Current quantity on hand</p>
              </div>
            </div>
          </div>

          {!showHistory ? (
            <>
              {/* Inventory List Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#2b170c]">
                    Ingredient Stock List
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    View stock level and update quantity quickly.
                  </p>
                </div>
              </div>

              {/* Desktop List Table */}
              <div className="hidden lg:block bg-white rounded-[1.75rem] border border-amber-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-amber-50/80 border-b border-amber-100 text-left">
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide">
                        Ingredient
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide">
                        Current Stock
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide">
                        Reorder Level
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide">
                        Stock Bar
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-amber-900 uppercase tracking-wide text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-amber-50">
                    {ingredients.map((ing) => {
                      const status = getStockStatus(ing)
                      const stock = Number(ing.stock_quantity)
                      const reorder = Number(ing.reorder_level)
                      const percent = getPercent(ing)

                      return (
                        <tr
                          key={ing.id}
                          className={`${status.row} hover:bg-amber-50/70 transition-colors`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              {ing.image ? (
                                <img src={ing.image} alt={ing.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-amber-900 font-black shadow-sm">
                                  {ing.name?.charAt(0)?.toUpperCase() || 'I'}
                                </div>
                              )}

                              <div>
                                <p className="font-black text-[#2b170c]">
                                  {ing.name}
                                </p>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  Unit: {ing.unit}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {ing.inventory_transactions_count ?? 0} transaction(s)
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-end gap-1">
                              <span className="text-2xl font-black text-[#2b170c]">
                                {stock.toFixed(2)}
                              </span>
                              <span className="text-xs text-stone-400 mb-1">
                                {ing.unit}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="font-bold text-stone-700">
                              {reorder.toFixed(2)}
                            </span>
                            <span className="text-xs text-stone-400 ml-1">
                              {ing.unit}
                            </span>
                          </td>

                          <td className="px-6 py-5 min-w-[180px]">
                            <div className="h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-100">
                              <div
                                className={`h-full rounded-full ${status.bar}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-stone-400 mt-1">
                              {percent.toFixed(0)}% stock level
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-black ${status.badge}`}>
                              {status.text}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openTx(ing, 'purchase')}
                                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black hover:bg-emerald-600 hover:text-white transition-all"
                              >
                                Purchase
                              </button>

                              <button
                                onClick={() => openTx(ing, 'deduct')}
                                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100 text-xs font-black hover:bg-rose-600 hover:text-white transition-all"
                              >
                                Deduct
                              </button>

                              <button
                                onClick={() => openTx(ing, 'adjust')}
                                className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 text-xs font-black hover:bg-sky-600 hover:text-white transition-all"
                              >
                                Adjust
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {ingredients.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center">
                          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📦</span>
                          </div>
                          <p className="font-bold text-stone-700">
                            No ingredients found.
                          </p>
                          <p className="text-sm text-stone-400 mt-1">
                            Add ingredients first to manage inventory stock.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="lg:hidden space-y-4">
                {ingredients.map((ing) => {
                  const status = getStockStatus(ing)
                  const stock = Number(ing.stock_quantity)
                  const reorder = Number(ing.reorder_level)
                  const percent = getPercent(ing)

                  return (
                    <div
                      key={ing.id}
                      className="bg-white rounded-[1.5rem] border border-amber-100 shadow-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {ing.image ? (
                            <img src={ing.image} alt={ing.name} className="w-12 h-12 rounded-2xl object-cover border border-amber-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center text-amber-900 font-black">
                              {ing.name?.charAt(0)?.toUpperCase() || 'I'}
                            </div>
                          )}

                          <div>
                            <h3 className="font-black text-[#2b170c]">
                              {ing.name}
                            </h3>
                            <p className="text-xs text-stone-400">
                              Unit: {ing.unit}
                            </p>
                          </div>
                        </div>

                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${status.badge}`}>
                          {status.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                          <p className="text-xs text-amber-700 font-bold">Current Stock</p>
                          <p className="text-2xl font-black text-[#2b170c] mt-1">
                            {stock.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-stone-50 border border-stone-100 p-4">
                          <p className="text-xs text-stone-500 font-bold">Reorder Level</p>
                          <p className="text-2xl font-black text-stone-800 mt-1">
                            {reorder.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-stone-500">
                            Stock Level
                          </span>
                          <span className="text-xs font-bold text-stone-400">
                            {percent.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${status.bar}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-stone-400 mt-4">
                        {ing.inventory_transactions_count ?? 0} transaction(s)
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <button
                          onClick={() => openTx(ing, 'purchase')}
                          className="bg-emerald-600 text-white text-xs font-black px-3 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                          Purchase
                        </button>

                        <button
                          onClick={() => openTx(ing, 'deduct')}
                          className="bg-rose-600 text-white text-xs font-black px-3 py-2.5 rounded-xl hover:bg-rose-700 transition-colors"
                        >
                          Deduct
                        </button>

                        <button
                          onClick={() => openTx(ing, 'adjust')}
                          className="bg-sky-600 text-white text-xs font-black px-3 py-2.5 rounded-xl hover:bg-sky-700 transition-colors"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>
                  )
                })}

                {ingredients.length === 0 && (
                  <div className="bg-white rounded-[1.5rem] border border-amber-100 text-center text-stone-500 py-12">
                    No ingredients found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-black text-[#2b170c]">
                  Transaction History
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Recent stock purchase, deduct, and adjustment records.
                </p>
              </div>

              <div className="bg-white rounded-[1.75rem] shadow-sm border border-amber-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-amber-900 font-black bg-amber-50 border-b border-amber-100">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Ingredient</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Note</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-amber-50">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/60 transition-colors">
                        <td className="px-6 py-4 text-stone-500 text-xs whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>

                        <td className="px-6 py-4 font-black text-[#2b170c]">
                          {tx.ingredient?.name ?? '—'}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${typeColors[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`font-black ${Number(tx.quantity) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(tx.quantity) > 0 ? '+' : ''}
                            {Number(tx.quantity).toFixed(2)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-stone-500">
                          {tx.note ?? '—'}
                        </td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {txLastPage > 1 && (
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm px-6 py-4 mt-4 flex justify-between items-center">
                  <span className="text-xs text-stone-500">
                    Page {txPage} of {txLastPage}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                      disabled={txPage <= 1}
                      className="px-4 py-2 text-xs font-black text-stone-600 hover:bg-amber-50 rounded-xl disabled:text-stone-300 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>

                    <button
                      onClick={() => setTxPage(p => Math.min(txLastPage, p + 1))}
                      disabled={txPage >= txLastPage}
                      className="px-4 py-2 text-xs font-black text-stone-600 hover:bg-amber-50 rounded-xl disabled:text-stone-300 disabled:cursor-not-allowed"
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

      {/* Transaction Modal */}
      {showTxModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[1.75rem] shadow-2xl w-full max-w-md p-6 border border-amber-100">
            <div className="mb-5">
              {selectedIngredient.image ? (
                <img src={selectedIngredient.image} alt={selectedIngredient.name} className="w-14 h-14 rounded-2xl object-cover border border-amber-200 mb-3" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 text-amber-800 flex items-center justify-center font-black mb-3">
                  {selectedIngredient.name?.charAt(0)?.toUpperCase() || 'I'}
                </div>
              )}

              <h2 className="text-xl font-black text-[#2b170c]">
                {txForm.type === 'purchase'
                  ? 'Purchase Stock'
                  : txForm.type === 'deduct'
                    ? 'Deduct Stock'
                    : 'Adjust Stock'}
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                {selectedIngredient.name} ({selectedIngredient.unit}) — Current:{' '}
                <span className="font-bold text-stone-700">
                  {Number(selectedIngredient.stock_quantity).toFixed(2)}
                </span>
              </p>
            </div>

            <form onSubmit={handleTx}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-stone-700 mb-1">
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
                  className="w-full border border-amber-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-bold text-stone-700 mb-1">
                  Note
                </label>

                <input
                  type="text"
                  value={txForm.note}
                  onChange={e => setTxForm({ ...txForm, note: e.target.value })}
                  placeholder="Write note optional"
                  className="w-full border border-amber-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowTxModal(false)
                    setSelectedIngredient(null)
                  }}
                  className="bg-stone-100 text-stone-700 px-5 py-3 rounded-2xl text-sm font-black hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-colors disabled:cursor-not-allowed disabled:opacity-90 ${
                    txForm.type === 'purchase'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : txForm.type === 'deduct'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}