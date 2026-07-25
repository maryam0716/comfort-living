const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// LOGIN (Public)
router.post("/admin-login", loginAdmin);

// FORGOT / RESET PASSWORD (Public)
router.post("/admin-forgot-password", forgotPassword);
router.post("/admin-reset-password/:token", resetPassword);

// ADMIN ONLY MANAGEMENT ROUTES
router.post("/register", protect, adminOnly, registerAdmin);
router.get("/users", protect, adminOnly, getUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;