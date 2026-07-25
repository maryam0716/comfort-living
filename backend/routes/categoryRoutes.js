const express = require("express");

const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  getAdminCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// PUBLIC ROUTES

router.get("/", getCategories);

// ADMIN ROUTES

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminCategories
);

router.post(
  "/",
  protect,
  adminOnly,
  createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCategory
);

module.exports = router;
