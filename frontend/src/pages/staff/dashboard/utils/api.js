// src/pages/staff/dashboard/utils/api.js

const API_URL = import.meta.env.VITE_API_URL

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

export async function fetchAllPages(endpoint) {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_URL}${endpoint}?page=1`, { headers })
  const first = await response.json()
  
  let all = first.data ?? []
  const lastPage = first.last_page ?? 1
  const pages = []
  
  for (let p = 2; p <= lastPage; p++) {
    pages.push(
      fetch(`${API_URL}${endpoint}?page=${p}`, { headers })
        .then(r => r.json())
        .then(j => j.data ?? [])
    )
  }
  
  const rest = await Promise.all(pages)
  for (const arr of rest) all = all.concat(arr)
  return all
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

export async function fetchOrders() {
  return fetchAllPages('/orders')
}

export async function fetchProducts() {
  return fetchAllPages('/products')
}

export async function fetchCustomers() {
  return fetchAllPages('/customers')
}