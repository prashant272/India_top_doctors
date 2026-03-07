const mongoose = require("mongoose");

const doctorGallerySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    title: String,

    description: String,

    imageUrl: String,

    videoLink: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DoctorGallery",
  doctorGallerySchema
);