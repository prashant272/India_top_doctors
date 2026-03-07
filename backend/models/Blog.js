const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["doctor", "platform"],
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
    },

    excerpt: {
      type: String,
      maxlength: 500,
    },

    featuredImage: {
      public_id: String,
      url: String,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "authorModel",
      required: true,
    },

    authorModel: {
      type: String,
      enum: ["Doctor", "Admin"],
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    publishedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

blogSchema.index({ type: 1, status: 1, isActive: 1 });
blogSchema.index({ doctor: 1, status: 1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ title: "text", tags: "text" });

module.exports = mongoose.model("Blog", blogSchema);