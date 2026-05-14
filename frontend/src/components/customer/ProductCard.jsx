import { useState } from 'react'

const sizes = ['Small', 'Medium', 'Large']
const sugarLevels = ['0%', '25%', '50%', '75%', '100%']

export default function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState('Medium')
  const [selectedSugar, setSelectedSugar] = useState('50%')
  const [selectedAddOn, setSelectedAddOn] = useState('')
  const [qty, setQty] = useState(1)

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      size: selectedSize,
      sugar: selectedSugar,
      addOn: selectedAddOn || null,
      qty,
    }
    console.log('Added to cart:', cartItem)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col">
      <div className="p-5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover rounded-lg"
        />
      </div>

      <div className="p-6 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <span className="text-lg font-bold text-blue-600">
            RM{product.price.toFixed(2)}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-gray-700 w-10">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="flex-1 px-3 py-2 sm:px-2 sm:py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium text-gray-700 w-10">Sugar</label>
            <select
              value={selectedSugar}
              onChange={(e) => setSelectedSugar(e.target.value)}
              className="flex-1 px-3 py-2 sm:px-2 sm:py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sugarLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 w-10">Add On</label>
            <select
              value={selectedAddOn}
              onChange={(e) => setSelectedAddOn(e.target.value)}
              className="flex-1 px-3 py-2 sm:px-2 sm:py-1 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              {product.addOns && product.addOns.map((addOn) => (
                <option key={addOn.name} value={addOn.name}>
                  {addOn.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 mt-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="text-lg font-semibold w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
