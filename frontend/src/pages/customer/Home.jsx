import Navbar from '../../components/customer/Navbar.jsx'
import HeroSlider from '../../components/customer/HeroSlider.jsx'
import ProductCard from '../../components/customer/ProductCard.jsx'

const coffeeProducts = [
  {
    id: 1,
    name: 'Americano',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
    price: 8.90,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Caramel', price: 1.00 },
    ],
  },
  {
    id: 2,
    name: 'Caffe Latte',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=300&fit=crop',
    price: 10.90,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Vanilla', price: 1.00 },
    ],
  },
  {
    id: 3,
    name: 'Mocha',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    price: 12.50,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Chocolate Drizzle', price: 1.50 },
    ],
  },
  {
    id: 4,
    name: 'Espresso',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop',
    price: 7.50,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
    ],
  },
  {
    id: 5,
    name: 'Cappuccino',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop',
    price: 11.50,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Cinnamon', price: 1.00 },
    ],
  },
  {
    id: 6,
    name: 'Caramel Macchiato',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop',
    price: 13.90,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Caramel Drizzle', price: 1.50 },
    ],
  },
  {
    id: 7,
    name: 'Matcha Latte',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop',
    price: 12.90,
    addOns: [
      { name: 'Extra Shot', price: 2.00 },
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Vanilla', price: 1.00 },
    ],
  },
  {
    id: 8,
    name: 'Cold Brew',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    price: 9.90,
    addOns: [
      { name: 'Whipped Cream', price: 1.50 },
      { name: 'Vanilla', price: 1.00 },
    ],
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <HeroSlider />

      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Coffee</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {coffeeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
