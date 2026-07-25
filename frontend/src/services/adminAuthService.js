import { adminApi, setAdminSession } from './adminApi'

export async function loginAdmin({ email, password }) {
  const res = await adminApi.post('/auth/admin-login', { email, password })
  setAdminSession(res.token, res.user)
  return res.user
}

export function logoutAdmin() {
  setAdminSession(null, null)
}

export async function forgotAdminPassword(email) {
  return adminApi.post('/auth/admin-forgot-password', { email })
}

export async function resetAdminPassword(token, password) {
  return adminApi.post(`/auth/admin-reset-password/${token}`, { password })
}
