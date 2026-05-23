import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CustomerAuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('customer')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('customer_token'))

  const isLoggedIn = !!token

  useEffect(() => {
    if (token) {
      localStorage.setItem('customer_token', token)
    } else {
      localStorage.removeItem('customer_token')
    }
  }, [token])

  useEffect(() => {
    if (customer) {
      localStorage.setItem('customer', JSON.stringify(customer))
    } else {
      localStorage.removeItem('customer')
    }
  }, [customer])

  const login = useCallback(async (phone, password) => {
    let res
    try {
      res = await fetch(`${API_URL}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
    } catch (err) {
      throw new Error(`Cannot reach server — ${err.message}`)
    }
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error(`Server returned ${res.status} with non-JSON response`)
    }
    if (!res.ok) throw new Error(data.message || `Login failed (${res.status})`)
    setCustomer(data.customer)
    setToken(data.token)
    return data
  }, [])

  const register = useCallback(async (name, phone, password) => {
    let res
    try {
      res = await fetch(`${API_URL}/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, phone, password }),
      })
    } catch (err) {
      throw new Error(`Cannot reach server at ${API_URL}/customer/register — ${err.message}`)
    }
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error(`Server returned ${res.status} with non-JSON response`)
    }
    if (!res.ok) {
      const msg = data.message || data.errors?.[Object.keys(data.errors)[0]]?.[0] || `Registration failed (${res.status})`
      throw new Error(msg)
    }
    setCustomer(data.customer)
    setToken(data.token)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/customer/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch {
    } finally {
      setCustomer(null)
      setToken(null)
    }
  }, [token])

  const value = { customer, token, isLoggedIn, login, register, logout }

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
