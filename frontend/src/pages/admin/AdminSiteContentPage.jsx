import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import { fetchSiteContentBlock, saveSiteContentBlock } from '../../services/adminSiteContentService'
import ImageUploader from '../../components/admin/ImageUploader'

// Editor for the homepage content blocks that used to be hardcoded in
// components (Hero slides, Marquee strip, Why Choose Us, Testimonials,
// Newsletter banner). This is separate from "Home Page" (Add Section),
// which manages the additional dynamic sections feature and is untouched.

const TABS = [
  { key: 'hero', label: 'Hero Slides' },
  { key: 'marquee', label: 'Marquee Strip' },
  { key: 'whyChooseUs', label: 'Why Choose Us' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'newsletter', label: 'Newsletter Banner' },
]

const inputClass = "bg-[#0d1829] border border-[#1e3a4a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary w-full"

const defaultHero = {
  slides: [
    { title: 'Sleep in Pure Luxury', subtitle: 'Premium Home Textiles', description: 'Experience the comfort of 100% pure cotton bedsheets, blankets, pillows and more.', cta: 'Shop Bedsheets', link: '/shop?category=Bedsheets', image: '' },
  ],
}
const defaultMarquee = { items: ['Premium Bedsheets', 'Warm Blankets', 'Leather Bags', 'Free Delivery over Rs. 2,999'] }
const defaultWhyChooseUs = {
  subtitle: 'Our Promise', title: 'Why Choose Us',
  items: [
    { title: 'Free Delivery', description: 'Free shipping on all orders above Rs. 2,999 across Pakistan.' },
    { title: 'Premium Quality', description: 'Every product is carefully selected and quality tested before dispatch.' },
    { title: 'Easy Returns', description: 'Not satisfied? Return within 7 days for a full refund or exchange.' },
    { title: 'Trusted Brand', description: 'Thousands of happy customers across Pakistan trust Comfort Livings.' },
  ],
}
const defaultTestimonials = {
  subtitle: 'Happy Customers', title: 'What Our Customers Say',
  items: [
    { name: 'Ayesha Khan', location: 'Lahore', rating: 5, review: 'Absolutely love the bedsheet quality!', product: 'Royal Cotton Bedsheet Set' },
  ],
}
const defaultNewsletter = { title: 'Get Exclusive Offers', subtitle: 'Subscribe to our newsletter and get 10% off your first order plus early access to new arrivals.' }

function AdminSiteContentPage() {
  const [activeTab, setActiveTab] = useState('hero')
  const [hero, setHero] = useState(defaultHero)
  const [marquee, setMarquee] = useState(defaultMarquee)
  const [whyChooseUs, setWhyChooseUs] = useState(defaultWhyChooseUs)
  const [testimonials, setTestimonials] = useState(defaultTestimonials)
  const [newsletter, setNewsletter] = useState(defaultNewsletter)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchSiteContentBlock('hero'),
      fetchSiteContentBlock('marquee'),
      fetchSiteContentBlock('whyChooseUs'),
      fetchSiteContentBlock('testimonials'),
      fetchSiteContentBlock('newsletter'),
    ])
      .then(([h, m, w, t, n]) => {
        // Use whatever was actually saved, including an empty list (the
        // admin may have intentionally deleted every slide/item). Only
        // fall back to the built-in defaults when nothing has ever been
        // saved for that block (h/m/t is null), so a deletion sticks
        // after refresh instead of reverting to the sample content.
        if (h) setHero({ ...h, slides: Array.isArray(h.slides) ? h.slides : [] })
        if (m) setMarquee({ ...m, items: Array.isArray(m.items) ? m.items : [] })
        if (w?.items?.length) setWhyChooseUs(w)
        if (t) setTestimonials({ ...t, items: Array.isArray(t.items) ? t.items : [] })
        if (n?.title || n?.subtitle) setNewsletter(n)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const showSuccess = () => {
    setSuccess('Saved successfully')
    setTimeout(() => setSuccess(''), 2500)
  }

  const handleSave = async (key, data) => {
    setSaving(true)
    setError('')
    try {
      await saveSiteContentBlock(key, data)
      showSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ---- Hero slide helpers ----
  const updateSlide = (index, field, value) => {
    const slides = hero.slides.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    setHero({ ...hero, slides })
  }
  const addSlide = () => setHero({ ...hero, slides: [...hero.slides, { title: '', subtitle: '', description: '', cta: 'Shop Now', link: '/shop', image: '' }] })
  const removeSlide = (index) => setHero({ ...hero, slides: hero.slides.filter((_, i) => i !== index) })

  // ---- Marquee helpers ----
  const updateMarqueeItem = (index, value) => {
    const items = marquee.items.map((it, i) => (i === index ? value : it))
    setMarquee({ ...marquee, items })
  }
  const addMarqueeItem = () => setMarquee({ ...marquee, items: [...marquee.items, ''] })
  const removeMarqueeItem = (index) => setMarquee({ ...marquee, items: marquee.items.filter((_, i) => i !== index) })

  // ---- Why choose us helpers (fixed at 4 cards, matching the 4 fixed icons on the storefront) ----
  const updateReason = (index, field, value) => {
    const items = whyChooseUs.items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    setWhyChooseUs({ ...whyChooseUs, items })
  }

  // ---- Testimonial helpers ----
  const updateTestimonial = (index, field, value) => {
    const items = testimonials.items.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    setTestimonials({ ...testimonials, items })
  }
  const addTestimonial = () => setTestimonials({ ...testimonials, items: [...testimonials.items, { name: '', location: '', rating: 5, review: '', product: '' }] })
  const removeTestimonial = (index) => setTestimonials({ ...testimonials, items: testimonials.items.filter((_, i) => i !== index) })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Homepage Content</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit the hero slider, marquee strip, "Why Choose Us", testimonials and newsletter banner text/images shown on the Home page.
        </p>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>}
      {success && <div className="bg-green-950 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">{success}</div>}

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-primary text-white' : 'bg-[#1e293b] text-gray-300 hover:bg-[#334155]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-[#050a14] border border-[#1a2a3a] rounded-xl p-6">

          {activeTab === 'hero' && (
            <div className="space-y-6">
              {hero.slides.map((slide, index) => (
                <div key={index} className="border border-[#1a2a3a] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">Slide {index + 1}</p>
                    <button onClick={() => removeSlide(index)} className="p-1.5 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Title" value={slide.title} onChange={(e) => updateSlide(index, 'title', e.target.value)} className={inputClass} />
                    <input placeholder="Subtitle" value={slide.subtitle} onChange={(e) => updateSlide(index, 'subtitle', e.target.value)} className={inputClass} />
                    <textarea placeholder="Description" value={slide.description} onChange={(e) => updateSlide(index, 'description', e.target.value)} className={`${inputClass} md:col-span-2 min-h-[70px]`} />
                    <input placeholder="Button text" value={slide.cta} onChange={(e) => updateSlide(index, 'cta', e.target.value)} className={inputClass} />
                    <input placeholder="Button link (e.g. /shop)" value={slide.link} onChange={(e) => updateSlide(index, 'link', e.target.value)} className={inputClass} />
                    <ImageUploader label="Slide background image" value={slide.image} onChange={(img) => updateSlide(index, 'image', img)} className="md:col-span-2" />
                  </div>
                </div>
              ))}
              <button onClick={addSlide} className="flex items-center gap-2 bg-[#1e293b] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#334155] transition-colors">
                <FiPlus size={14} /> Add Slide
              </button>
              <button onClick={() => handleSave('hero', hero)} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Hero Slides'}
              </button>
            </div>
          )}

          {activeTab === 'marquee' && (
            <div className="space-y-4">
              {marquee.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input value={item} onChange={(e) => updateMarqueeItem(index, e.target.value)} className={inputClass} placeholder="Marquee text" />
                  <button onClick={() => removeMarqueeItem(index)} className="p-2 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors shrink-0">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addMarqueeItem} className="flex items-center gap-2 bg-[#1e293b] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#334155] transition-colors">
                <FiPlus size={14} /> Add Item
              </button>
              <div>
                <button onClick={() => handleSave('marquee', marquee)} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                  <FiSave size={14} /> {saving ? 'Saving...' : 'Save Marquee'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'whyChooseUs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Section subtitle (e.g. Our Promise)" value={whyChooseUs.subtitle}
                  onChange={(e) => setWhyChooseUs({ ...whyChooseUs, subtitle: e.target.value })} className={inputClass} />
                <input placeholder="Section title (e.g. Why Choose Us)" value={whyChooseUs.title}
                  onChange={(e) => setWhyChooseUs({ ...whyChooseUs, title: e.target.value })} className={inputClass} />
              </div>
              {whyChooseUs.items.map((item, index) => (
                <div key={index} className="border border-[#1a2a3a] rounded-lg p-4 space-y-3">
                  <p className="text-white font-medium text-sm">Card {index + 1}</p>
                  <input placeholder="Title" value={item.title} onChange={(e) => updateReason(index, 'title', e.target.value)} className={inputClass} />
                  <textarea placeholder="Description" value={item.description} onChange={(e) => updateReason(index, 'description', e.target.value)} className={`${inputClass} min-h-[60px]`} />
                </div>
              ))}
              <button onClick={() => handleSave('whyChooseUs', whyChooseUs)} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Why Choose Us'}
              </button>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Section subtitle (e.g. Happy Customers)" value={testimonials.subtitle}
                  onChange={(e) => setTestimonials({ ...testimonials, subtitle: e.target.value })} className={inputClass} />
                <input placeholder="Section title (e.g. What Our Customers Say)" value={testimonials.title}
                  onChange={(e) => setTestimonials({ ...testimonials, title: e.target.value })} className={inputClass} />
              </div>
              {testimonials.items.map((t, index) => (
                <div key={index} className="border border-[#1a2a3a] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">Review {index + 1}</p>
                    <button onClick={() => removeTestimonial(index)} className="p-1.5 rounded-lg bg-[#1e293b] text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Customer name" value={t.name} onChange={(e) => updateTestimonial(index, 'name', e.target.value)} className={inputClass} />
                    <input placeholder="Location" value={t.location} onChange={(e) => updateTestimonial(index, 'location', e.target.value)} className={inputClass} />
                    <input placeholder="Product name" value={t.product} onChange={(e) => updateTestimonial(index, 'product', e.target.value)} className={inputClass} />
                    <select value={t.rating} onChange={(e) => updateTestimonial(index, 'rating', Number(e.target.value))} className={inputClass}>
                      {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                    <textarea placeholder="Review text" value={t.review} onChange={(e) => updateTestimonial(index, 'review', e.target.value)} className={`${inputClass} md:col-span-2 min-h-[60px]`} />
                  </div>
                </div>
              ))}
              <button onClick={addTestimonial} className="flex items-center gap-2 bg-[#1e293b] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#334155] transition-colors">
                <FiPlus size={14} /> Add Review
              </button>
              <div>
                <button onClick={() => handleSave('testimonials', testimonials)} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                  <FiSave size={14} /> {saving ? 'Saving...' : 'Save Testimonials'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="space-y-4 max-w-xl">
              <input placeholder="Title" value={newsletter.title} onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })} className={inputClass} />
              <textarea placeholder="Subtitle" value={newsletter.subtitle} onChange={(e) => setNewsletter({ ...newsletter, subtitle: e.target.value })} className={`${inputClass} min-h-[70px]`} />
              <button onClick={() => handleSave('newsletter', newsletter)} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60">
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Newsletter'}
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default AdminSiteContentPage
