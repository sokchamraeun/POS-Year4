export function mergeOrderItems(items, getKey) {
  const map = new Map()
  for (const item of items) {
    const key = getKey(item)
    if (map.has(key)) {
      const existing = map.get(key)
      existing.qty += (item.qty ?? 1)
    } else {
      map.set(key, { ...item })
    }
  }
  return Array.from(map.values())
}
