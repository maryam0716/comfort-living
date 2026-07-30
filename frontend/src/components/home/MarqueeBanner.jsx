import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchSiteContent } from '../../services/siteContentService'

const defaultItems = [
  ' Premium Bedsheets',
  ' Warm Blankets',
  ' Leather Bags',
  ' Ladies Handbags',
  ' Mattress Protectors',
  ' Memory Foam Pillows',
  ' Genuine Leather Belts',
  ' Laptop Bags',
  ' Mattress Toppers',
  ' Premium Quality',
  ' Free Delivery over Rs. 2,999',
]

function MarqueeBanner() {
  const [items, setItems] = useState(defaultItems)

  useEffect(() => {
    fetchSiteContent()
      .then((content) => {
        const marqueeItems = content?.marquee?.items
        if (Array.isArray(marqueeItems) && marqueeItems.length > 0) {
          setItems(marqueeItems)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-brand text-white py-3 overflow-hidden mb-2">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="flex whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-sm font-medium tracking-wider uppercase">
            {item}
            <span className="mx-8 text-secondary">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default MarqueeBanner