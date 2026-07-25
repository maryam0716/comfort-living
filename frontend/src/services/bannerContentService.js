import { api } from './api'

// Public — no auth needed. Only returns active:true banners, sorted by position.
export async function fetchActiveBanners() {
  const res = await api.get('/banners')
  return res.banners || []
}
