import { api } from './api'

// Public — no auth needed. Only returns active:true sections (backend default).
// Sorted by creation time so sections appear in the order they were added —
// the schema has no explicit "order" field, so this is the most predictable
// stable sequence available.
export async function fetchHomeSections() {
  const res = await api.get('/home')
  const sections = res.sections || []
  return [...sections].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
}
