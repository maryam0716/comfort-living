const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sanitizeRequestBody = require("./middleware/sanitizeInput");
const connectDB = require("./config/db");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const homeRoutes = require("./routes/homeRoutes");
const siteContentRoutes = require("./routes/siteContentRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const contactRoutes = require("./routes/contactRoutes");
const teamRoutes = require("./routes/teamRoutes");

const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const websiteSettingsRoutes = require("./routes/websiteSettingsRoutes");
const faqRoutes = require("./routes/faqRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const auditRoutes = require("./routes/auditRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const seoRoutes = require("./routes/seoRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");
const cartRoutes = require("./routes/cartRoutes");
const app = express();

connectDB();

// CORS: restricts to CLIENT_URL when set (recommended for production).
// If CLIENT_URL isn't set, behaves exactly as before (open) so local/dev
// setups are never broken by this change — just set CLIENT_URL in .env
// when you're ready to lock it down.
app.use(
  cors(
    process.env.CLIENT_URL
      ? { origin: process.env.CLIENT_URL, credentials: true }
      : {}
  )
);

// Security middleware — helmet was already in package.json but never
// mounted; it's confirmed compatible with this Express version.
// (xss-clean and express-mongo-sanitize were also in package.json, but
// testing confirmed both crash EVERY request on this Express version —
// see middleware/sanitizeInput.js for the working replacement.)
app.use(helmet());

app.use(express.json());

// Runs after express.json() so req.body is populated.
app.use(sanitizeRequestBody);

// Rate-limit login endpoints only (5 attempts / 15 min) — does not affect
// any other route.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});
app.use("/api/auth/admin-login", loginLimiter);
app.use("/api/customers/login", loginLimiter);

app.use(
  "/uploads",
  // Helmet's default Cross-Origin-Resource-Policy header ("same-origin")
  // blocks the browser from loading these images when the frontend runs
  // on a different origin/port (e.g. localhost:5173 vs localhost:5000) —
  // that's why uploaded images showed as broken image icons on the site.
  // Scoped to /uploads only so the rest of the app keeps helmet's default
  // protections unchanged.
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/api/auth", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/team", teamRoutes);

app.use("/admin", express.static("admin"));
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/settings", websiteSettingsRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/customers", customerAuthRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", function (req, res) {
  res.send("Backend is running successfully");
});

app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

// Error middleware must be registered last so it catches errors
// thrown by every route above it (it was previously registered
// mid-list, which meant routes after it were never caught).
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("Server running on port " + PORT);
});
