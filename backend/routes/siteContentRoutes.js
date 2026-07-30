const express = require("express");

const router = express.Router();

const {
  getAllContent,
  getContentByKey,
  upsertContent,
} = require("../controllers/siteContentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// PUBLIC — storefront reads all blocks in one call
router.get("/", getAllContent);

// ADMIN
router.get("/:key", protect, adminOnly, getContentByKey);
router.put("/:key", protect, adminOnly, upsertContent);

module.exports = router;
