const API_URL = import.meta.env.VITE_API_URL + '/products'
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' })

export function fetchProducts(page = 1) {
  return fetch(`${API_URL}?page=${page}`, { headers: getHeaders() }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch products')
    return res.json()
  })
}

export function fetchCategories() {
  return fetch(`${import.meta.env.VITE_API_URL}/categories`, { headers: getHeaders() }).then((r) => r.json())
}

export function fetchProductDetails(id) {
  return fetch(`${API_URL}/${id}`, { headers: getHeaders() }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch product details')
    return res.json()
  })
}

export function toggleFeatured(id, isFeatured) {
  return fetch(`${API_URL}/${id}/featured`, {
    method: 'PATCH',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_featured: isFeatured }),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to update best seller')
    return res.json()
  })
}

export function deleteProduct(id) {
  return fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() }).then((res) => {
    if (!res.ok) throw new Error('Failed to delete')
  })
}
