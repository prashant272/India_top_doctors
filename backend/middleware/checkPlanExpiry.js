const Doctor = require("../models/Doctor");

const checkPlanExpiry = async (req, res, next) => {
  const doctorId = req.user.id;

  const doctor = await Doctor.findById(doctorId);

  if (
    doctor?.planDetails?.planExpiryDate &&
    doctor.planDetails.planExpiryDate < new Date()
  ) {
    doctor.planDetails.isActive = false;
    doctor.currentPlan = null;
    doctor.currentPlanName = "Basic Plan";

    await doctor.save();
  }

  next();
};

module.exports = checkPlanExpiry;