const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    basicInfo: {
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      phone: String,
      age: Number,
      gender: String,
      bloodGroup: String,
      address: String
    },

    medicalInfo: {
      allergies: String,
      history: String,
      currentMedication: String
    },

    role: {
      type: String,
      default: "patient"
    },

    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient
