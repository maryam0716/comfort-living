const SiteContent = require("../models/SiteContent");

// Known block keys. Kept as a whitelist so the admin API can't be used to
// create arbitrary/unbounded documents, and so a typo in a key doesn't
// silently create a duplicate, forgotten block.
const ALLOWED_KEYS = [
  "hero",
  "marquee",
  "whyChooseUs",
  "testimonials",
  "newsletter",
];

/*
====================================
GET ALL CONTENT BLOCKS (public)
Returns a { key: data } map so the frontend can pull whichever
block it needs without an extra round trip per component.
====================================
*/
const getAllContent = async (req, res) => {
  try {
    const docs = await SiteContent.find({});
    const map = {};
    docs.forEach((doc) => {
      map[doc.key] = doc.data;
    });

    res.json({
      success: true,
      content: map,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================
GET ONE CONTENT BLOCK (admin)
====================================
*/
const getContentByKey = async (req, res) => {
  try {
    const { key } = req.params;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: "Unknown content key",
      });
    }

    const doc = await SiteContent.findOne({ key });

    res.json({
      success: true,
      data: doc ? doc.data : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================
UPSERT CONTENT BLOCK (admin)
====================================
*/
const upsertContent = async (req, res) => {
  try {
    const { key } = req.params;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: "Unknown content key",
      });
    }

    const doc = await SiteContent.findOneAndUpdate(
      { key },
      { key, data: req.body.data },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Content updated successfully",
      data: doc.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllContent,
  getContentByKey,
  upsertContent,
};
