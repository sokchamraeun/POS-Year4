const API_URL = import.meta.env.VITE_API_URL

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

async function fetchAll(endpoint) {
  try {
    const headers = getAuthHeaders()
    const res = await fetch(`${API_URL}${endpoint}`, { headers })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : [])
  } catch {
    return []
  }
}

export async function updateOrder(orderId, data) {
  const headers = getAuthHeaders()
  return fetch(`${API_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  })
}

export async function markOrderPrinted(orderId) {
  const headers = getAuthHeaders()
  return fetch(`${API_URL}/orders/${orderId}/mark-printed`, { 
    method: 'POST', 
    headers 
  }).catch(() => {})
}

export async function fetchOrders(page = 1) {
  return fetchAll(`/orders?per_page=50&page=${page}`)
}

export async function fetchProducts() {
  return fetchAll('/products?per_page=200')
}

export async function fetchCustomers() {
  return fetchAll('/customers?per_page=200')
}