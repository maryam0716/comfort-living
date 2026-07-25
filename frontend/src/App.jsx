import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/common/ScrollToTop'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CategoriesPage from './pages/CategoriesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import WishlistPage from './pages/WishlistPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TrackOrderPage from './pages/TrackOrderPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import CmsPageView from './pages/CmsPageView'

import AdminProtectedRoute from './components/admin/AdminProtectedRoute'

// Admin pages are lazy-loaded — a storefront visitor never downloads any
// admin code, and the ~20 admin screens are only fetched once someone
// actually navigates to /admin. This is what brings the initial bundle
// down; nothing about how these pages work or render has changed.
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminForgotPasswordPage = lazy(() => import('./pages/admin/AdminForgotPasswordPage'))
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminCmsPage = lazy(() => import('./pages/admin/AdminCmsPage'))
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'))
const AdminAboutPage = lazy(() => import('./pages/admin/AdminAboutPage'))
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'))
const AdminFaqsPage = lazy(() => import('./pages/admin/AdminFaqsPage'))
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'))
const AdminContactMessagesPage = lazy(() => import('./pages/admin/AdminContactMessagesPage'))
const AdminWebsiteSettingsPage = lazy(() => import('./pages/admin/AdminWebsiteSettingsPage'))
const AdminSeoSettingsPage = lazy(() => import('./pages/admin/AdminSeoSettingsPage'))
const AdminNewsletterPage = lazy(() => import('./pages/admin/AdminNewsletterPage'))
const AdminEmailTemplatesPage = lazy(() => import('./pages/admin/AdminEmailTemplatesPage'))
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))

function AdminFallback() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>

        {/* ADMIN — separate shell, no storefront Navbar/Footer */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/forgot-password"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/reset-password/:token"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboardPage /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProductsPage /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<AdminFallback />}><AdminCategoriesPage /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrdersPage /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<AdminFallback />}><AdminCouponsPage /></Suspense>} />
          <Route path="reviews" element={<Suspense fallback={<AdminFallback />}><AdminReviewsPage /></Suspense>} />

          {/* CMS module */}
          <Route path="cms/home" element={<Suspense fallback={<AdminFallback />}><AdminHomePage /></Suspense>} />
          <Route path="cms/about" element={<Suspense fallback={<AdminFallback />}><AdminAboutPage /></Suspense>} />
          <Route path="cms/pages" element={<Suspense fallback={<AdminFallback />}><AdminCmsPage /></Suspense>} />
          <Route path="cms/banners" element={<Suspense fallback={<AdminFallback />}><AdminBannersPage /></Suspense>} />
          <Route path="cms/faqs" element={<Suspense fallback={<AdminFallback />}><AdminFaqsPage /></Suspense>} />
          <Route path="cms/team" element={<Suspense fallback={<AdminFallback />}><AdminTeamPage /></Suspense>} />
          <Route path="cms/website-settings" element={<Suspense fallback={<AdminFallback />}><AdminWebsiteSettingsPage /></Suspense>} />
          <Route path="cms/contact-messages" element={<Suspense fallback={<AdminFallback />}><AdminContactMessagesPage /></Suspense>} />
          <Route path="cms/seo" element={<Suspense fallback={<AdminFallback />}><AdminSeoSettingsPage /></Suspense>} />

          <Route path="newsletter" element={<Suspense fallback={<AdminFallback />}><AdminNewsletterPage /></Suspense>} />
          <Route path="email-templates" element={<Suspense fallback={<AdminFallback />}><AdminEmailTemplatesPage /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<AdminFallback />}><AdminNotificationsPage /></Suspense>} />
          <Route path="logs" element={<Suspense fallback={<AdminFallback />}><AdminLogsPage /></Suspense>} />
        </Route>

        {/* STOREFRONT — unchanged from before */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/pages/:key" element={<CmsPageView />} />
              </Routes>
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App