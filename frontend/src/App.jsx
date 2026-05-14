import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/customer/Home.jsx'
import Dashboard from './pages/staff/Dashboard.jsx'
import Products from './pages/staff/Products.jsx'
import Orders from './pages/staff/Orders.jsx'
import Inventory from './pages/staff/Inventory.jsx'
import Recipe from './pages/staff/Recipe.jsx'
import MenuOrder from './pages/staff/MenuOrder.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff/dashboard" element={<Dashboard />} />
        <Route path="/staff/products" element={<Products />} />
        <Route path="/staff/orders" element={<Orders />} />
        <Route path="/staff/inventory" element={<Inventory />} />
        <Route path="/staff/recipe" element={<Recipe />} />
        <Route path="/staff/menu-order" element={<MenuOrder />} />
      </Routes>
    </BrowserRouter>
  )
}
