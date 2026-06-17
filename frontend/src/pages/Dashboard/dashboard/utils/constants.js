// src/pages/staff/dashboard/utils/constants.js

export const periods = [
  { key: 'hourly', label: 'Hourly' },
  { key: 'daily', label: 'Daily' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom' },
]

export const statusColors = {
  Completed: 'text-green-600 bg-green-100',
  Processing: 'text-blue-600 bg-blue-100',
  New: 'text-yellow-600 bg-yellow-100',
  Cancelled: 'text-red-600 bg-red-100',
}

export const paymentColors = {
  Paid: 'text-green-600 bg-green-100',
  Unpaid: 'text-red-600 bg-red-100',
  Refunded: 'text-gray-600 bg-gray-100',
}

export const SVG_WIDTH = 700
export const SVG_HEIGHT = 300
export const PAD = { top: 24, right: 20, bottom: 32, left: 56 }
export const plotW = SVG_WIDTH - PAD.left - PAD.right
export const plotH = SVG_HEIGHT - PAD.top - PAD.bottom

export const colorMap = ['#6366f1', '#3b82f6', '#f59e0b', '#8b5cf6']
export const chartColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']