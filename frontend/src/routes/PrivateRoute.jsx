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
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">Your account has no role assigned. Contact an administrator.</p>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/staff/login' }}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return children
}
