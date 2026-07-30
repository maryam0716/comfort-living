import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi'
import { staggerContainer, fadeUp, revealText } from '../../utils/animations'
import { fetchSiteContent } from '../../services/siteContentService'

// Icons stay fixed per position (they aren't stored as CMS data — only
// the section heading and each card's title/description are editable),
// so the admin edits copy without needing to pick from an icon library.
const icons = [
  <FiTruck size={32} />,
  <FiShield size={32} />,
  <FiRefreshCw size={32} />,
  <FiStar size={32} />,
]

const defaultHeading = { subtitle: 'Our Promise', title: 'Why Choose Us' }

const defaultReasons = [
  {
    title: "Free Delivery",
    description: "Free shipping on all orders above Rs. 2,999 across Pakistan.",
  },
  {
    title: "Premium Quality",
    description: "Every product is carefully selected and quality tested before dispatch.",
  },
  {
    title: "Easy Returns",
    description: "Not satisfied? Return within 7 days for a full refund or exchange.",
  },
  {
    title: "Trusted Brand",
    description: "Thousands of happy customers across Pakistan trust Comfort Livings.",
  },
]

function WhyChooseUs() {
  const [heading, setHeading] = useState(defaultHeading)
  const [reasons, setReasons] = useState(defaultReasons)

  useEffect(() => {
    fetchSiteContent()
      .then((content) => {
        const block = content?.whyChooseUs
        if (block?.subtitle || block?.title) {
          setHeading({ subtitle: block.subtitle || defaultHeading.subtitle, title: block.title || defaultHeading.title })
        }
        if (Array.isArray(block?.items) && block.items.length > 0) {
          setReasons(block.items.slice(0, 4).map((item, i) => ({
            title: item.title || defaultReasons[i]?.title || '',
            description: item.description || defaultReasons[i]?.description || '',
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-12"
        >
          <motion.p variants={revealText} className="text-primary text-sm uppercase tracking-widest font-medium mb-2">
            {heading.subtitle}
          </motion.p>
          <motion.h2 variants={revealText} className="font-serif text-3xl md:text-4xl text-brand font-bold">
            {heading.title}
          </motion.h2>
          <motion.div variants={fadeUp} className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              custom={index}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300"
              >
                {icons[index] || <FiStar size={32} />}
              </motion.div>
              <h3 className="font-semibold text-brand text-lg mb-2">{reason.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default WhyChooseUs
