const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  type: {
    type: String,
    enum: ["clinic", "hospital"],
    default: "clinic"
  }
});

module.exports = mongoose.model("Clinic", clinicSchema);