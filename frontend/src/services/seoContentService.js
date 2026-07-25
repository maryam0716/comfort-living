import { api } from './api'

// Public — no auth needed. Returns the site-wide default SEO settings.
export async function fetchSiteSeoDefaults() {
  const res = await api.get('/seo')
  return res.seo
}
