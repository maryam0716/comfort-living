const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");


// IMAGE UPLOAD
// Returns a web-usable path (e.g. "/uploads/xyz.png") that the frontend's
// resolveImageUrl() helper can turn into a full URL. req.file.path was
// previously returned as-is, which gives a raw filesystem path
// ("uploads/xyz.png", or "uploads\xyz.png" on Windows) instead of a URL —
// that mismatch is why uploaded images failed to render.
router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "No image file was uploaded",
    });
  }

  res.status(200).json({
    message: "Image uploaded successfully",
    image: `/uploads/${req.file.filename}`,
  });

});


module.exports = router;