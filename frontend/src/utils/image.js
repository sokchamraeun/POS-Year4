export function getImageUrl(image) {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${import.meta.env.VITE_STORAGE_URL}/${image}`
}
