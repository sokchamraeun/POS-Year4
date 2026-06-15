const API_URL = import.meta.env.VITE_API_URL

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  Accept: 'application/json',
})

async function fetchAll(endpoint, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const headers = getAuthHeaders()
      const res = await fetch(`${API_URL}${endpoint}`, { headers })
      if (res.status === 401) return []
      if (!res.ok) {
        if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)))
        continue
      }
      const json = await res.json()
      return Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : [])
    } catch {
      if (i >= retries) return []
      await new Promise(r => setTimeout(r, 500 * (i + 1)))
    }
  }
  return []
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

export async function fetchProfitToday() {
  try {
    const res = await fetch(`${API_URL}/dashboard/profit-today`, { headers: getAuthHeaders() })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}