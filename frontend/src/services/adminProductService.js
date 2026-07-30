import { adminApi } from './adminApi'

export async function fetchAdminProducts() {
  const res = await adminApi.get('/products?limit=1000&includeInactive=true')
  return res.data || []
}

export async function fetchProductStats() {
  const res = await adminApi.get('/products/stats/dashboard')
  return res.data
}

// payload: plain object of fields; imageFiles: { thumbnail: File, images: File[] }
function buildProductFormData(payload, imageFiles = {}) {
  const form = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, value)
    }
  })

  if (imageFiles.thumbnail) {
    form.append('thumbnail', imageFiles.thumbnail)
  }

  if (imageFiles.images && imageFiles.images.length > 0) {
    imageFiles.images.forEach((file) => form.append('images', file))
  }

  return form
}

export async function createAdminProduct(payload, imageFiles) {
  const form = buildProductFormData(payload, imageFiles)
  const res = await adminApi.post('/products', form)
  return res.data
}

export async function updateAdminProduct(id, payload, imageFiles) {
  const form = buildProductFormData(payload, imageFiles)
  const res = await adminApi.put(`/products/${id}`, form)
  return res.data
}

export async function deleteAdminProduct(id) {
  return adminApi.delete(`/products/${id}`)
}

export async function restoreAdminProduct(id) {
  return adminApi.patch(`/products/restore/${id}`)
}

// Fully removes a product (and its image files) so it can be recreated
// without a "Product already exists" duplicate-key error. Irreversible.
export async function permanentDeleteAdminProduct(id) {
  return adminApi.delete(`/products/permanent/${id}`)
}

// image: the exact image path (e.g. "/uploads/xyz.jpg") to remove
export async function deleteAdminProductImage(id, image) {
  const res = await adminApi.deleteWithBody(`/products/${id}/images`, { image })
  return res.data
}

// images: full array of image paths in the new order
export async function reorderAdminProductImages(id, images) {
  return adminApi.patch(`/products/${id}/images/reorder`, { images })
}
