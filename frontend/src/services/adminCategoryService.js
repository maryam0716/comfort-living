import { adminApi } from './adminApi'

export async function fetchAdminCategories() {
  const res = await adminApi.get('/categories/admin/all')
  return res.data || []
}

export async function createCategory(payload) {
  const res = await adminApi.post('/categories', payload)
  return res.data
}

export async function updateCategory(id, payload) {
  const res = await adminApi.put(`/categories/${id}`, payload)
  return res.data
}

export async function deleteCategory(id) {
  return adminApi.delete(`/categories/${id}`)
}
