import { api } from './api'

// Public — no auth needed.
export async function validateCoupon(code, totalAmount) {
  const res = await api.post('/coupons/validate', { code, totalAmount })
  return res
}
