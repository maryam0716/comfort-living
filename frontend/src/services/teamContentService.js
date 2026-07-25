import { api } from './api'

// Public — no auth needed. Only returns active:true members, sorted by displayOrder.
export async function fetchActiveTeamMembers() {
  const res = await api.get('/team')
  return res.members || []
}
