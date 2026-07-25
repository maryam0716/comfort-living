import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchActiveBanners } from '../../services/bannerContentService'
import { resolveImageUrl } from '../../services/api'
import { staggerContainer, fadeUp } from '../../utils/animations'

// Renders banners created in the admin CMS, in their configured position
// order. Purely additive — doesn't touch HeroBanner/MarqueeBanner. Renders
// nothing if no banners exist yet, so it's a no-op until content is added.
function PromoBanners() {
  const [banners, setBanners] = useState([])

  useEffect(() => {
    fetchActiveBanners().then(setBanners).catch(() => {})
  }, [])

  if (banners.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={`grid grid-cols-1 ${banners.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}
        >
          {banners.map((banner, index) => (
            <motion.div
              key={banner._id}
              variants={fadeUp}
              custom={index}
              className="relative rounded-3xl overflow-hidden group h-64 md:h-80"
            >
              <img
                src={resolveImageUrl(banner.image)}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                {banner.subtitle && (
                  <p className="text-secondary text-xs uppercase tracking-[0.2em] font-medium mb-2">
                    {banner.subtitle}
                  </p>
                )}
                <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-4 max-w-sm">
                  {banner.title}
                </h3>
                {banner.buttonText && (
                  <Link
                    to={banner.buttonLink || '/shop'}
                    className="inline-block w-fit bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all hover:scale-105"
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PromoBanners
