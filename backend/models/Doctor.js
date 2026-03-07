const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    basicInfo: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      phone: String,
      gender: String,
      dob: Date,
      profileImage: String,
      socialLinks: {
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        youtube: { type: String, default: null },
        x: { type: String, default: null },
        twitter: { type: String, default: null },
        linkedin: { type: String, default: null },
        threads: { type: String, default: null },
        website: { type: String, default: null },
      },
    },

    professionalInfo: {
      specialization: { type: String, required: true },
      qualification: String,
      experience: Number,
      licenseNumber: String,
      consultationFee: Number,
    },

    availability: [
      {
        workingDays: [String],
        startTime: String,
        endTime: String,
        slotDuration: { type: Number, default: 30 },
        consultationMode: {
          type: String,
          enum: ["online", "offline", "both"],
          default: "offline",
        },
        location: {
          clinicName: String,
          addressLine: String,
          city: String,
          state: String,
          country: { type: String, default: "India" },
          pincode: String,
          coordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: undefined },
          },
        },
      },
    ],

    hospitalAffiliations: [
      {
        hospital: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hospital",
          required: true,
        },
        hospitalName: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date, default: null },
        isCurrent: { type: Boolean, default: true },
      },
    ],

    role: { type: String, default: "doctor" },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    currentPlanName: { type: String, default: "Basic Plan" },
    planDetails: {
      billingCycle: { type: String, enum: ["monthly", "halfYearly", "yearly"] },
      planStartDate: Date,
      planExpiryDate: Date,
      isActive: { type: Boolean, default: false },
      autoRenew: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

doctorSchema.virtual("isPlanActive").get(function () {
  if (!this.planDetails?.planExpiryDate) return false;
  return this.planDetails.planExpiryDate > new Date();
});

doctorSchema.index({ "availability.location.coordinates": "2dsphere" }, { sparse: true });
doctorSchema.index({ "planDetails.planExpiryDate": 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
