import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute.jsx'
import Home from './pages/customer/Home.jsx'
import CustomerProducts from './pages/customer/Products.jsx'
import Promotion from './pages/customer/Promotion.jsx'
import Cart from './pages/customer/Cart.jsx'
import History from './pages/customer/History.jsx'
import CustomerLogin from './pages/customer/CustomerLogin.jsx'
import CustomerRegister from './pages/customer/CustomerRegister.jsx'
import CustomerForgotPassword from './pages/customer/CustomerForgotPassword.jsx'
import Dashboard from "./pages/Dashboard/dashboard/Dashboard.jsx"
import Products from './pages/Dashboard/Product/Products.jsx'
import CreateProduct from './pages/Dashboard/Product/components/Create.jsx'
import { Navigate } from 'react-router-dom'
const EditProductOld = () => <Navigate to="/staff/products" replace />
import ViewProduct from './pages/Dashboard/Product/components/View.jsx'
import Orders from './pages/Dashboard/Orders.jsx'
import Inventory from './pages/Dashboard/Inventory/Inventory.jsx'
import Recipe from './pages/Dashboard/Recipe/Recipe.jsx'
import RecipeBatchEdit from './pages/Dashboard/Recipe/RecipeBatchEdit.jsx'
import MenuOrder from './pages/Dashboard/MenuOrder/MenuOrder.jsx'
import Permissions from './pages/Dashboard/Permissions.jsx'
import Users from './pages/Dashboard/Users.jsx'
import Customers from './pages/Dashboard/Customers.jsx'
import Roles from './pages/Dashboard/Roles/Roles.jsx'
import Reports from './pages/Dashboard/Reports/Reports.jsx'
import Tables from './pages/Dashboard/Tables.jsx'
import Addon from './pages/Dashboard/Addons/Addon.jsx'
import AddonIngredient from './pages/Dashboard/Addons/AddonIngredient.jsx'
import Ingredients from './pages/Dashboard/Ingredients/Ingredients.jsx'
import Category from './pages/Dashboard/Category/Category.jsx'
import SizePage from './pages/Dashboard/Size/Size.jsx'
import IceLevel from './pages/Dashboard/IceLevel/IceLevel.jsx'
import SugarLevel from './pages/Dashboard/SugarLevel/SugarLevel.jsx'
import Promotions from './pages/Dashboard/Promotion/Promotion.jsx'
import HeroSliderPage from './pages/Dashboard/HeroSlider/Heroslider.jsx'
import UserTest from './pages/Dashboard/UserTest.jsx'
import LoginHistory from './pages/Dashboard/LogHistory/LoginHistory.jsx'
import GlobalOrderNotification from './components/staff/GlobalOrderNotification.jsx'
import Login from './pages/auth/Login.jsx'
import ChangePassword from './pages/auth/ChangePassword.jsx'
import Register from './pages/auth/Register.jsx'


export default function App() {
  return (
    <BrowserRouter>
      <GlobalOrderNotification />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<CustomerProducts />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/history" element={<History />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/forgot-password" element={<CustomerForgotPassword />} />
        <Route path="/staff/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/staff/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/staff/products/add" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
        <Route path="/staff/products/edit/:id" element={<PrivateRoute><EditProductOld /></PrivateRoute>} />
        <Route path="/staff/products/:id" element={<PrivateRoute><ViewProduct /></PrivateRoute>} />
        <Route path="/staff/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/staff/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
        <Route path="/staff/recipe" element={<PrivateRoute><Recipe /></PrivateRoute>} />
        <Route path="/staff/recipe/batch-edit/:productId/:sizeId" element={<PrivateRoute><RecipeBatchEdit /></PrivateRoute>} />
        <Route path="/staff/menu-order" element={<PrivateRoute><MenuOrder /></PrivateRoute>} />
        <Route path="/staff/permissions" element={<PrivateRoute><Permissions /></PrivateRoute>} />
        <Route path="/staff/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/staff/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/staff/roles" element={<PrivateRoute><Roles /></PrivateRoute>} />
        <Route path="/staff/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/staff/tables" element={<PrivateRoute><Tables /></PrivateRoute>} />
        <Route path="/staff/addons" element={<PrivateRoute><Addon /></PrivateRoute>} />
        <Route path="/staff/addon-ingredients" element={<PrivateRoute><AddonIngredient /></PrivateRoute>} />
        <Route path="/staff/ingredients" element={<PrivateRoute><Ingredients /></PrivateRoute>} />
        <Route path="/staff/categories" element={<PrivateRoute><Category /></PrivateRoute>} />
        <Route path="/staff/sizes" element={<PrivateRoute><SizePage /></PrivateRoute>} />
        <Route path="/staff/ice-levels" element={<PrivateRoute><IceLevel /></PrivateRoute>} />
        <Route path="/staff/sugar-levels" element={<PrivateRoute><SugarLevel /></PrivateRoute>} />
        <Route path="/staff/promotions" element={<PrivateRoute><Promotions /></PrivateRoute>} />
        <Route path="/staff/hero-sliders" element={<PrivateRoute><HeroSliderPage /></PrivateRoute>} />
        <Route path="/staff/login-history" element={<PrivateRoute><LoginHistory /></PrivateRoute>} />
        <Route path="/staff/user-test" element={<PrivateRoute><UserTest /></PrivateRoute>} />
        <Route path="/staff/login" element={<Login />} />
        <Route path="/staff/register" element={<Register />} />
        <Route path="/staff/change-password" element={<ChangePassword />} />
      </Routes>
    </BrowserRouter>
  )
}
