import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../utils/image.js'

function safeParseUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function Topbar() {
  const [user, setUser] = useState(safeParseUser)
  const [newOrdersCount, setNewOrdersCount] = useState(
    () => Number(localStorage.getItem('newOrdersCount') || 0)
  )

  useEffect(() => {
    function refresh() { setUser(safeParseUser()) }
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  useEffect(() => {
    function onCount(e) { setNewOrdersCount(e.detail) }
    window.addEventListener('newOrdersCountChanged', onCount)
    return () => window.removeEventListener('newOrdersCountChanged', onCount)
  }, [])

  const initial = user?.name?.[0]?.toUpperCase() || 'S'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Welcome back, {user?.name || 'Staff'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/staff/orders"
          className="relative text-gray-500 hover:text-teal-700 transition-colors"
          title="New Orders"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {newOrdersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {newOrdersCount > 99 ? '99+' : newOrdersCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          {user?.avatar ? (
            <img src={getImageUrl(user.avatar)} alt={user?.name || 'User'} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {initial}
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium text-gray-800">{user?.name || 'Staff User'}</p>
            <p className="text-gray-500 text-xs">{user?.role?.name || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
