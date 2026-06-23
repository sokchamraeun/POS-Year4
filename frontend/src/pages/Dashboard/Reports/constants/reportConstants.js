export const API_URL = import.meta.env.VITE_API_URL

export const CHART_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#ef4444']

export const tabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'products', label: 'Products' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'profit', label: 'Profit' },
  { key: 'staff', label: 'Staff' },
  { key: 'customers', label: 'Customers' },
  { key: 'payments', label: 'Payments' },
]

export const presets = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '1 Year', days: 365 },
]
