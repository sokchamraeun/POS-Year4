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

  useEffect(() => { fetchData() }, [txPage])

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
    } catch (err) { alert(err.message) }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const typeColors = {
    purchase: 'text-green-600 bg-green-100',
    deduct: 'text-red-600 bg-red-100',
    adjust: 'text-blue-600 bg-blue-100',
  }

  if (loading) return <Loader text="Loading..." />

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
            <button onClick={() => setShowHistory(!showHistory)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              {showHistory ? 'Adjust Stock' : 'Transaction History'}
            </button>
          </div>

          {!showHistory ? (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Adjust Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{ing.name}</h3>
                        <span className="text-xs text-gray-400">{ing.unit}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">In Stock</div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{Number(ing.stock_quantity).toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mb-3">/ {Number(ing.reorder_level).toFixed(2)} reorder</div>
                    <div className="text-xs text-gray-500 mb-4">{ing.inventory_transactions_count ?? 0} transaction(s)</div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => openTx(ing, 'purchase')} className="flex-1 bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">Purchase</button>
                      <button onClick={() => openTx(ing, 'deduct')} className="flex-1 bg-red-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">Deduct</button>
                      <button onClick={() => openTx(ing, 'adjust')} className="flex-1 bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">Adjust</button>
                    </div>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">No ingredients found.</div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h2>
              <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Ingredient</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 text-xs">{formatDate(tx.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{tx.ingredient?.name ?? '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.quantity > 0 ? '+' : ''}{Number(tx.quantity).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{tx.note ?? '—'}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {txLastPage > 1 && (
                <div className="bg-white rounded-xl shadow-sm px-6 py-4 mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Page {txPage} of {txLastPage}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:text-gray-300 disabled:cursor-not-allowed">Prev</button>
                    <button onClick={() => setTxPage(p => Math.min(txLastPage, p + 1))} disabled={txPage >= txLastPage} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:text-gray-300 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showTxModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold mb-1">
              {txForm.type === 'purchase' ? 'Purchase' : txForm.type === 'deduct' ? 'Deduct' : 'Adjust'} Stock
            </h2>
            <p className="text-sm text-gray-500 mb-4">{selectedIngredient.name} ({selectedIngredient.unit}) — Current: {Number(selectedIngredient.stock_quantity).toFixed(2)}</p>
            <form onSubmit={handleTx}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" value={txForm.quantity} onChange={e => setTxForm({ ...txForm, quantity: e.target.value })} step="0.01" min="0.01" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <input type="text" value={txForm.note} onChange={e => setTxForm({ ...txForm, note: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowTxModal(false); setSelectedIngredient(null) }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${txForm.type === 'purchase' ? 'bg-green-600 hover:bg-green-700' : txForm.type === 'deduct' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {txForm.type === 'purchase' ? 'Purchase' : txForm.type === 'deduct' ? 'Deduct' : 'Adjust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
