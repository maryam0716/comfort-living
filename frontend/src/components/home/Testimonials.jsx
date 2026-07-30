import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import { staggerContainer, fadeUp, revealText } from '../../utils/animations'
import { fetchSiteContent } from '../../services/siteContentService'

const defaultHeading = { subtitle: 'Happy Customers', title: 'What Our Customers Say' }

const defaultTestimonials = [
  {
    id: 1,
    name: "Ayesha Khan",
    location: "Lahore",
    rating: 5,
    review: "Absolutely love the bedsheet quality! Super soft and the colors are exactly as shown. Will definitely order again.",
    product: "Royal Cotton Bedsheet Set",
  },
  {
    id: 2,
    name: "Fatima Malik",
    location: "Karachi",
    rating: 5,
    review: "The comforter is incredibly warm and fluffy. Perfect for winter nights. Fast delivery and beautiful packaging!",
    product: "Velvet Comfort Comforter",
  },
  {
    id: 3,
    name: "Sara Ahmed",
    location: "Islamabad",
    rating: 5,
    review: "Great quality curtains! They block sunlight perfectly and look so elegant. My bedroom looks like a 5-star hotel now.",
    product: "Blackout Curtains",
  },
]

function Testimonials() {
  const [heading, setHeading] = useState(defaultHeading)
  const [testimonials, setTestimonials] = useState(defaultTestimonials)

  useEffect(() => {
    fetchSiteContent()
      .then((content) => {
        const block = content?.testimonials
        if (block?.subtitle || block?.title) {
          setHeading({ subtitle: block.subtitle || defaultHeading.subtitle, title: block.title || defaultHeading.title })
        }
        if (Array.isArray(block?.items) && block.items.length > 0) {
          setTestimonials(block.items.map((t, i) => ({
            id: t.id || i + 1,
            name: t.name || '',
            location: t.location || '',
            rating: Number(t.rating) || 5,
            review: t.review || '',
            product: t.product || '',
          })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4 bg-accent">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={index}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/30"
            >
              <div className="flex text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <FiStar key={i} size={16} className="fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                "{t.review}"
              </p>
              <div className="border-t border-accent pt-4">
                <p className="font-semibold text-brand text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location} · {t.product}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default Testimonials
