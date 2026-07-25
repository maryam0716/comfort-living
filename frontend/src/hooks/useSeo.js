import { useEffect } from 'react'

const SITE_NAME = 'Comfort Livings'

function setMetaTag(name, content) {
  if (!content) return
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setOgTag(property, content) {
  if (!content) return
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

// Sets the browser tab title and meta description for the current page.
// Restores the site defaults on unmount so navigating away (e.g. to a page
// that doesn't call this hook) doesn't leave a stale title/description behind.
export function useSeo({ title, description, image } = {}) {
  useEffect(() => {
    const previousTitle = document.title

    if (title) {
      document.title = `${title} | ${SITE_NAME}`
    }
    if (description) {
      setMetaTag('description', description)
      setOgTag('og:description', description)
    }
    if (title) {
      setOgTag('og:title', title)
    }
    if (image) {
      setOgTag('og:image', image)
    }

    return () => {
      document.title = previousTitle
    }
  }, [title, description, image])
}
