import { api } from './api'

// Public — no auth needed.
export async function fetchActiveFaqs() {
  const res = await api.get('/faqs')
  return (res.faqs || []).filter((f) => f.active !== false)
}
