const mongoose = require("mongoose");

// Generic key/value content-block store used to make previously hardcoded
// homepage blocks (Hero slides, Marquee strip, Why Choose Us, Testimonials,
// Newsletter banner) editable from the admin dashboard, in addition to the
// existing "Add Section" (HomeSection) feature which this does NOT replace
// or touch. Each document is one named block; `data` holds whatever shape
// that block needs (array of slides, list of strings, etc.), so no schema
// migration is needed if a block's fields change later.
const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteContent", siteContentSchema);
