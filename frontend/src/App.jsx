import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/customer/Home.jsx'
import Dashboard from './pages/staff/Dashboard.jsx'
import Products from './pages/staff/Product/Products.jsx'
import CreateProduct from './pages/staff/Product/Create.jsx'
import EditProduct from './pages/staff/Product/Edit.jsx'
import ViewProduct from './pages/staff/Product/View.jsx'
import Orders from './pages/staff/Orders.jsx'
import Inventory from './pages/staff/Inventory/Inventory.jsx'
import Recipe from './pages/staff/Recipe/Recipe.jsx'
import RecipeBatchEdit from './pages/staff/Recipe/RecipeBatchEdit.jsx'
import MenuOrder from './pages/staff/MenuOrder/MenuOrder.jsx'
import Permissions from './pages/staff/Permissions.jsx'
import Users from './pages/staff/Users.jsx'
import Customers from './pages/staff/Customers.jsx'
import Roles from './pages/staff/Roles.jsx'
import Reports from './pages/staff/Reports.jsx'
import Tables from './pages/staff/Tables.jsx'
import Addon from './pages/staff/Addons/Addon.jsx'
import AddonIngredient from './pages/staff/Addons/AddonIngredient.jsx'
import Ingredients from './pages/staff/Ingredients/Ingredients.jsx'
import Category from './pages/staff/Category/Category.jsx'
import UserTest from './pages/staff/UserTest.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff/dashboard" element={<Dashboard />} />
        <Route path="/staff/products" element={<Products />} />
        <Route path="/staff/products/add" element={<CreateProduct />} />
        <Route path="/staff/products/edit/:id" element={<EditProduct />} />
        <Route path="/staff/products/:id" element={<ViewProduct />} />
        <Route path="/staff/orders" element={<Orders />} />
        <Route path="/staff/inventory" element={<Inventory />} />
        <Route path="/staff/recipe" element={<Recipe />} />
        <Route path="/staff/recipe/batch-edit/:productId/:sizeId" element={<RecipeBatchEdit />} />
        <Route path="/staff/menu-order" element={<MenuOrder />} />
        <Route path="/staff/permissions" element={<Permissions />} />
        <Route path="/staff/users" element={<Users />} />
        <Route path="/staff/customers" element={<Customers />} />
        <Route path="/staff/roles" element={<Roles />} />
        <Route path="/staff/reports" element={<Reports />} />
        <Route path="/staff/tables" element={<Tables />} />
        <Route path="/staff/addons" element={<Addon />} />
        <Route path="/staff/addon-ingredients" element={<AddonIngredient />} />
        <Route path="/staff/ingredients" element={<Ingredients />} />
        <Route path="/staff/categories" element={<Category />} />
        <Route path="/staff/user-test" element={<UserTest />} />
        <Route path="/staff/login" element={<Login />} />
        <Route path="/staff/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}
