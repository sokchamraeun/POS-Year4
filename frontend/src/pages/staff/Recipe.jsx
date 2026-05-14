import { useState } from 'react'
import Sidebar from '../../components/staff/Sidebar.jsx'
import Topbar from '../../components/staff/Topbar.jsx'

const initialRecipes = [
  {
    product: 'Americano',
    ingredients: [
      { name: 'Coffee Beans', qty: 18, unit: 'g' },
      { name: 'Water', qty: 200, unit: 'ml' },
    ],
  },
  {
    product: 'Caffe Latte',
    ingredients: [
      { name: 'Coffee Beans', qty: 18, unit: 'g' },
      { name: 'Milk', qty: 200, unit: 'ml' },
    ],
  },
  {
    product: 'Mocha',
    ingredients: [
      { name: 'Coffee Beans', qty: 18, unit: 'g' },
      { name: 'Milk', qty: 150, unit: 'ml' },
      { name: 'Chocolate Syrup', qty: 30, unit: 'ml' },
    ],
  },
  {
    product: 'Cappuccino',
    ingredients: [
      { name: 'Coffee Beans', qty: 18, unit: 'g' },
      { name: 'Milk', qty: 150, unit: 'ml' },
    ],
  },
  {
    product: 'Caramel Macchiato',
    ingredients: [
      { name: 'Coffee Beans', qty: 18, unit: 'g' },
      { name: 'Milk', qty: 200, unit: 'ml' },
      { name: 'Caramel Syrup', qty: 20, unit: 'ml' },
    ],
  },
  {
    product: 'Matcha Latte',
    ingredients: [
      { name: 'Matcha Powder', qty: 10, unit: 'g' },
      { name: 'Milk', qty: 200, unit: 'ml' },
    ],
  },
  {
    product: 'Cold Brew',
    ingredients: [
      { name: 'Coffee Beans', qty: 30, unit: 'g' },
      { name: 'Water', qty: 300, unit: 'ml' },
    ],
  },
]

const emptyIngredient = { name: '', qty: '', unit: '' }

export default function Recipe() {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [formProduct, setFormProduct] = useState('')
  const [formIngredients, setFormIngredients] = useState([{ ...emptyIngredient }])

  function openAdd() {
    setEditProduct(null)
    setFormProduct('')
    setFormIngredients([{ ...emptyIngredient }])
    setShowModal(true)
  }

  function openEdit(recipe) {
    setEditProduct(recipe.product)
    setFormProduct(recipe.product)
    setFormIngredients(recipe.ingredients.map((i) => ({ ...i })))
    setShowModal(true)
  }

  function handleSave() {
    const recipe = {
      product: formProduct,
      ingredients: formIngredients.filter((i) => i.name.trim()),
    }
    if (editProduct) {
      setRecipes(recipes.map((r) => (r.product === editProduct ? recipe : r)))
    } else {
      setRecipes([recipe, ...recipes])
    }
    setShowModal(false)
  }

  function updateIngredient(index, field, value) {
    const updated = [...formIngredients]
    updated[index] = { ...updated[index], [field]: value }
    setFormIngredients(updated)
  }

  function addIngredientRow() {
    setFormIngredients([...formIngredients, { ...emptyIngredient }])
  }

  function removeIngredientRow(index) {
    setFormIngredients(formIngredients.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Product Recipes</h1>
            <button
              onClick={openAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Recipe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.product} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === recipe.product ? null : recipe.product)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-base font-semibold text-gray-800">{recipe.product}</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${expanded === recipe.product ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expanded === recipe.product && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr className="text-left text-gray-500 font-medium">
                          <th className="pb-2">Ingredient</th>
                          <th className="pb-2 text-right">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipe.ingredients.map((ing) => (
                          <tr key={ing.name} className="border-t border-gray-50">
                            <td className="py-2 text-gray-700">{ing.name}</td>
                            <td className="py-2 text-gray-600 text-right">{ing.qty} {ing.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      onClick={() => openEdit(recipe)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                    >
                      Edit Recipe
                    </button>
                  </div>
                )}
                {expanded !== recipe.product && (
                  <div className="px-6 pb-4 text-sm text-gray-400">
                    {recipe.ingredients.length} ingredient{recipe.ingredients.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">{editProduct ? 'Edit Recipe' : 'Add Recipe'}</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text" value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Ingredients</label>
                      <button
                        onClick={addIngredientRow}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                      >
                        + Add Ingredient
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formIngredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text" placeholder="Ingredient" value={ing.name}
                            onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number" min="0" placeholder="Qty" value={ing.qty}
                            onChange={(e) => updateIngredient(i, 'qty', e.target.value)}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text" placeholder="Unit" value={ing.unit}
                            onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {formIngredients.length > 1 && (
                            <button onClick={() => removeIngredientRow(i)} className="text-red-400 hover:text-red-600 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                  <button onClick={() => setShowModal(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    {editProduct ? 'Save Changes' : 'Add Recipe'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
