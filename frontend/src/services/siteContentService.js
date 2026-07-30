import { api } from './api'

// Public — no auth needed. Returns a { key: data } map, e.g.
// { hero: {...}, marquee: {...}, whyChooseUs: {...}, testimonials: {...}, newsletter: {...} }
// Components fall back to their existing hardcoded defaults when a key
// is missing, so the site looks exactly the same until the admin edits it.
export async function fetchSiteContent() {
  const res = await api.get('/site-content')
  return res.content || {}
}
