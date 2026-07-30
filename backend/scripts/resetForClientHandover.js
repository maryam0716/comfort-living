/*
==========================================
RESET FOR CLIENT HANDOVER (one-time, opt-in)
==========================================
Clears out the testing data behind the messy-looking dashboard numbers,
so the admin panel starts from a clean 0 for the client. This does NOT
touch any code, routes, or business logic — it only deletes documents
from your own database when you run it yourself.

WHAT THIS DELETES:
  - Products               (your test products + their uploaded image files)
  - Orders
  - Reviews
  - Wishlists
  - Carts
  - Inventory logs
  - Activity logs
  - Audit logs
  - Notifications
  - Customer accounts      (real shopper accounts — NOT the admin login)

WHAT THIS KEEPS (never touched):
  - Categories
  - Admin accounts/login
  - Coupons
  - Newsletter subscribers
  - Homepage content (hero slides, marquee, etc.), Home Page sections,
    Banners, About, Team, FAQs, CMS pages, Website/SEO settings,
    Email templates, Contact messages

USAGE:
  1. Make sure backend/.env points at the database you actually want to
     clear (double check MONGODB_URI before running this on production).
  2. Dry run first (shows counts, deletes nothing):
       node scripts/resetForClientHandover.js
  3. When you're sure, actually delete:
       node scripts/resetForClientHandover.js --yes
==========================================
*/

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const InventoryLog = require("../models/InventoryLog");
const ActivityLog = require("../models/ActivityLog");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Same best-effort file cleanup used elsewhere in the codebase
// (productController's removeUploadedFile) — never throws, so a
// missing/external file never blocks the rest of the reset.
const removeUploadedFile = (relativePath) => {
  try {
    if (!relativePath || !relativePath.startsWith("/uploads/")) return;
    const filePath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to remove uploaded file:", relativePath, error.message);
  }
};

const isLive = process.argv.includes("--yes");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const [
      productCount,
      orderCount,
      reviewCount,
      wishlistCount,
      cartCount,
      inventoryLogCount,
      activityLogCount,
      auditLogCount,
      notificationCount,
      customerCount,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Wishlist.countDocuments(),
      Cart.countDocuments(),
      InventoryLog.countDocuments(),
      ActivityLog.countDocuments(),
      AuditLog.countDocuments(),
      Notification.countDocuments(),
      User.countDocuments(),
    ]);

    console.log("This will permanently delete:");
    console.log(`  Products:      ${productCount}`);
    console.log(`  Orders:        ${orderCount}`);
    console.log(`  Reviews:       ${reviewCount}`);
    console.log(`  Wishlists:     ${wishlistCount}`);
    console.log(`  Carts:         ${cartCount}`);
    console.log(`  Inventory logs:${inventoryLogCount}`);
    console.log(`  Activity logs: ${activityLogCount}`);
    console.log(`  Audit logs:    ${auditLogCount}`);
    console.log(`  Notifications: ${notificationCount}`);
    console.log(`  Customer accounts: ${customerCount}`);
    console.log("");
    console.log("Categories, Admin login, Coupons, Newsletter subscribers,");
    console.log("and all CMS/homepage content will NOT be touched.");
    console.log("");

    if (!isLive) {
      console.log("Dry run only — nothing was deleted.");
      console.log("Re-run with --yes to actually delete the above.");
      process.exit();
    }

    const products = await Product.find().select("thumbnail images");
    products.forEach((product) => {
      removeUploadedFile(product.thumbnail);
      (product.images || []).forEach(removeUploadedFile);
    });

    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      Cart.deleteMany({}),
      InventoryLog.deleteMany({}),
      ActivityLog.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("✅ Done. Dashboard and admin panel now start from a clean 0.");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();
