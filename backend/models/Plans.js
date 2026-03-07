const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: {
    monthly: Number,
    halfYearly: Number,
    yearly: Number,
  },
  features: {
    blogAccess: Boolean,
    verifiedBadge: Boolean,
    onlineBooking: Boolean,
    onlineConsultation: Boolean,
    searchBoost: Number,
  },

  platformFee: {
    percentage: { type: Number, default: 0 },      
    maxFeePerTransaction: { type: Number, default: null }, 
    description: { type: String, default: "" }, 
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Plan", planSchema);
