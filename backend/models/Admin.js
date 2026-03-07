const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    permissions: {
      manageDoctors: {
        type: Boolean,
        default: true,
      },
      managePatients: {
        type: Boolean,
        default: true,
      },
      manageAppointments: {
        type: Boolean,
        default: true,
      },
      manageReports: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetOtp: {
      type: String,
      select: false,
    },
    passwordResetOtpExpiry: {
      type: Date,
      select: false,
    },
    passwordResetOtpVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
