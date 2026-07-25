import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { fetchActiveFaqs } from '../services/faqContentService'

// Groups the flat FAQ list from the backend into { category, questions: [...] }
// so the existing rendering below (unchanged) keeps working exactly as it did
// with the old static array.
function groupByCategory(faqs) {
  const groups = []
  faqs.forEach((faq) => {
    let group = groups.find((g) => g.category === faq.category)
    if (!group) {
      group = { category: faq.category || 'General', questions: [] }
      groups.push(group)
    }
    group.questions.push({ q: faq.question, a: faq.answer })
  })
  return groups
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-secondary/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent transition-colors"
      >
        <span className="font-medium text-brand text-sm pr-4">{q}</span>
        <span className="text-primary shrink-0">
          {open ? <FiMinus size={16} /> : <FiPlus size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-secondary/30 pt-3">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveFaqs()
      .then((data) => setFaqs(groupByCategory(data)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="bg-accent py-16 px-4 text-center border-b border-secondary/30">
        <p className="text-primary text-sm uppercase tracking-widest font-medium mb-2">
          Help Center
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-brand font-bold">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
          Find answers to the most common questions about our products and services.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {loading && (
          <p className="text-center text-gray-400 text-sm">Loading...</p>
        )}
        {!loading && faqs.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No FAQs published yet.</p>
        )}
        {faqs.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-xl text-primary font-bold mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-primary inline-block" />
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item, j) => (
                <FAQItem key={j} q={item.q} a={item.a} />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Still need help */}
        <div className="bg-primary rounded-3xl p-8 text-center text-white">
          <h3 className="font-serif text-2xl font-bold mb-2">
            Still have questions?
          </h3>
          <p className="text-white/70 text-sm mb-6">
            Our team is happy to help you with anything.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full text-sm hover:bg-secondary transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FAQPage