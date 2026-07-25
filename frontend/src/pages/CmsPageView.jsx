import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchCmsPageByKey } from '../services/cmsPageService'
import { resolveImageUrl } from '../services/api'
import { useSeo } from '../hooks/useSeo'

function CmsPageView() {
  const { key } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    fetchCmsPageByKey(key)
      .then((data) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setPage(data)
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [key])

  useSeo({
    title: page?.title,
    description: page?.content ? page.content.replace(/<[^>]*>/g, '').slice(0, 160) : undefined,
    image: page?.image ? resolveImageUrl(page.image) : undefined,
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-brand mb-2">Page not found</h2>
          <p className="text-gray-500 text-sm mb-6">This page doesn't exist or isn't published yet.</p>
          <Link
            to="/"
            className="bg-primary text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {page.image ? (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={resolveImageUrl(page.image)}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl md:text-5xl text-white font-bold text-center"
            >
              {page.title}
            </motion.h1>
            {page.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/80 text-sm md:text-base text-center mt-3 max-w-xl"
              >
                {page.subtitle}
              </motion.p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-accent py-16 px-4 text-center border-b border-secondary/30">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-brand font-bold"
          >
            {page.title}
          </motion.h1>
          {page.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-sm md:text-base mt-3 max-w-xl mx-auto"
            >
              {page.subtitle}
            </motion.p>
          )}
        </div>
      )}

      {page.content && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto px-4 py-16"
        >
          <div
            className="prose prose-sm max-w-none text-gray-600 leading-relaxed [&_h2]:font-serif [&_h2]:text-brand [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: page.content || '' }}
          />
        </motion.div>
      )}

      {page.sections && page.sections.length > 0 && (
        <div className={page.content ? 'pb-4' : 'pt-4'}>
          {page.sections.map((section, index) => (
            <section
              key={section._id || index}
              className={`py-16 px-4 ${index % 2 === 1 ? 'bg-accent' : ''}`}
            >
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-2' : ''}
                >
                  {section.image ? (
                    <img
                      src={resolveImageUrl(section.image)}
                      alt={section.title}
                      className="rounded-3xl w-full object-cover aspect-video lg:aspect-square"
                    />
                  ) : (
                    <div className="rounded-3xl w-full aspect-video lg:aspect-square bg-secondary/30" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={index % 2 === 1 ? 'lg:order-1' : ''}
                >
                  {section.subtitle && (
                    <p className="text-primary text-sm uppercase tracking-widest font-medium mb-3">
                      {section.subtitle}
                    </p>
                  )}
                  {section.title && (
                    <h2 className="font-serif text-3xl md:text-4xl text-brand font-bold mb-6 leading-tight">
                      {section.title}
                    </h2>
                  )}
                  {section.description && (
                    <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                      {section.description}
                    </p>
                  )}
                </motion.div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default CmsPageView
