const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    alternatePhone: { type: String },
    website: { type: String },
    description: { type: String, maxlength: 2000 },
    emergencyContact: { type: String },
    established: { type: Number },
    beds: { type: Number },
    accreditation: { type: String },

    contactPerson: {
      name:            { type: String, trim: true,   default: null },
      email:           { type: String, lowercase: true, default: null },
      phone:           { type: String, default: null },
      alternatePhone:  { type: String, default: null },
      designation:     { type: String, trim: true,   default: null },
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
      location: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] },
      },
    },

    logo:       { public_id: String, url: String },
    images:     [{ public_id: String, url: String }],
    specialties:  [{ type: String, trim: true }],
    departments:  [{ type: String, trim: true }],
    facilities:   [{ type: String }],
    doctors:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],

    isActive:   { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

hospitalSchema.index({ "address.location": "2dsphere" });

module.exports = mongoose.model("Hospital", hospitalSchema);
