import { api } from './api'

// Public — no auth needed. Returns a single active page by its key, or null if not found.
export async function fetchCmsPageByKey(key) {
  try {
    const res = await api.get(`/cms/${key}`)
    return res.page
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// Public — no auth needed. Returns { key, title } for every published page,
// in the order they were created — used to build navigation links.
export async function fetchPublishedCmsPages() {
  const res = await api.get('/cms/public/list')
  return res.pages || []
}
