import { api, resolveImageUrl } from './api'

// Neutral placeholder shown when a category has no image uploaded yet,
// so the Categories page never renders a broken/empty <img>.
const CATEGORY_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' +
      '<rect width="100%" height="100%" fill="#e7e0d6"/>' +
      '<text x="50%" y="50%" font-family="serif" font-size="20" fill="#9a8f7d" text-anchor="middle" dominant-baseline="middle">No image</text>' +
      '</svg>'
  )

// Fetch a large page so existing components (which filter/sort/search
// client-side) keep working exactly as they did with the dummy data array.
export async function fetchAllProducts() {
  const res = await api.get('/products?limit=1000&sort=latest')
  return res.data || []
}

export async function fetchProductBySlug(slug) {
  const res = await api.get(`/products/slug/${slug}`)
  return res.data
}

export async function fetchCategories() {
  const res = await api.get('/categories')
  const categories = res.data || []
  return categories.map((cat) => ({
    ...cat,
    image: cat.image ? resolveImageUrl(cat.image) : CATEGORY_PLACEHOLDER,
  }))
}
