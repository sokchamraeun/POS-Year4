const API = import.meta.env.VITE_API_URL || '/api'
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export async function fetchRoles() {
  const res = await fetch(`${API}/roles`, { headers: getHeaders() })
  const data = await res.json()
  return data.data || data
}

export async function fetchPermissions() {
  const res = await fetch(`${API}/permissions`, { headers: getHeaders() })
  const data = await res.json()
  return data.data || data
}

export async function saveRole(role, editing) {
  const url = editing ? `${API}/roles/${editing.id}` : `${API}/roles`
  const method = editing ? 'PUT' : 'POST'
  const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(role) })
  if (!res.ok) throw new Error('Failed to save role')
}

export async function deleteRole(id) {
  const res = await fetch(`${API}/roles/${id}`, { method: 'DELETE', headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to delete role')
}
