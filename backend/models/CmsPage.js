const mongoose = require("mongoose");

const cmsPageSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
        },

        subtitle: {
            type: String,
            default: "",
        },

        content: {
            type: String,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        // Optional content blocks for the page, each rendered with the
        // site's existing image/text layout (see CmsPageView). Purely
        // additive — pages with no sections render exactly as before.
        sections: {
            type: [
                {
                    title: { type: String, default: "" },
                    subtitle: { type: String, default: "" },
                    description: { type: String, default: "" },
                    image: { type: String, default: "" },
                },
            ],
            default: [],
        },

        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("CmsPage", cmsPageSchema);