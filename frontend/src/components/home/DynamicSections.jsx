import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchHomeSections } from '../../services/homeContentService'
import { resolveImageUrl } from '../../services/api'

// Renders homepage content sections created in the admin CMS (CMS > Home
// Page), in the order they were added, alternating image left/right to
// match the "Our Story"-style layout used elsewhere on the site. Purely
// additive — renders nothing if no sections exist yet.
function DynamicSections() {
  const [sections, setSections] = useState([])

  useEffect(() => {
    fetchHomeSections().then(setSections).catch(() => {})
  }, [])

  if (sections.length === 0) return null

  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section._id}
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
                  className="rounded-3xl w-full h-auto object-contain"
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
              <h2 className="font-serif text-3xl md:text-4xl text-brand font-bold mb-6 leading-tight">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-gray-500 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {section.content}
                </p>
              )}
              {section.buttonText && (
                <Link
                  to={section.buttonLink || '/shop'}
                  className="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all hover:scale-105"
                >
                  {section.buttonText}
                </Link>
              )}
            </motion.div>
          </div>
        </section>
      ))}
    </>
  )
}

export default DynamicSections
