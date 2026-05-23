import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomerAuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </CustomerAuthProvider>
  </StrictMode>,
)
