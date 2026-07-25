import { useState, useEffect } from 'react'
import HeroBanner from '../components/home/HeroBanner'
import MarqueeBanner from '../components/home/MarqueeBanner'
import PromoBanners from '../components/home/PromoBanners'
import CategorySection from '../components/home/CategorySection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BestSellers from '../components/home/BestSellers'
import NewArrivals from '../components/home/NewArrivals'
import WhyChooseUs from '../components/home/WhyChooseUs'
import Testimonials from '../components/home/Testimonials'
import DynamicSections from '../components/home/DynamicSections'
import Newsletter from '../components/home/Newsletter'
import { useSeo } from '../hooks/useSeo'
import { fetchSiteSeoDefaults } from '../services/seoContentService'

function HomePage() {
  const [seo, setSeo] = useState(null)

  useEffect(() => {
    fetchSiteSeoDefaults().then(setSeo).catch(() => {})
  }, [])

  useSeo({
    title: seo?.metaTitle,
    description: seo?.metaDescription,
    image: seo?.ogImage,
  })

  return (
    <main>
      <HeroBanner />
      <MarqueeBanner />
      <PromoBanners />
      <CategorySection />
      <FeaturedProducts />
      <WhyChooseUs />
      <BestSellers />
      <Testimonials />
      <NewArrivals />
      <DynamicSections />
      <Newsletter />
    </main>
  )
}

export default HomePage