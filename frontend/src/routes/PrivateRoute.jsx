import { Navigate } from 'react-router-dom'

function safeParseUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/staff/login" replace />
  }

  const user = safeParseUser()
  if (!user?.role) {
    return <Navigate to="/" replace />
  }

  return children
}
