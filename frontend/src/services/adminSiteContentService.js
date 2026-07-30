import { adminApi } from './adminApi'

// Admin-side access to the site-content blocks (Hero slides, Marquee,
// Why Choose Us, Testimonials, Newsletter). Separate from adminHomeService,
// which manages the existing "Add Section" (HomeSection) feature — this
// module is purely additive and does not touch that one.

export async function fetchSiteContentBlock(key) {
  const res = await adminApi.get(`/site-content/${key}`)
  return res.data
}

export async function saveSiteContentBlock(key, data) {
  const res = await adminApi.put(`/site-content/${key}`, { data })
  return res.data
}
