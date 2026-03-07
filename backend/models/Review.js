const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ doctor: 1, type: 1, isActive: 1 });
reviewSchema.index({ patient: 1, isActive: 1 });
reviewSchema.index({ type: 1, isActive: 1 });
reviewSchema.index(
  { doctor: 1, patient: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "doctor" } }
);

module.exports = mongoose.model("Review", reviewSchema);