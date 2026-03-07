const Doctor = require("../models/Doctor");

const markExpiredPlans = async () => {
  try {
    const now = new Date();

    const result = await Doctor.updateMany(
      {
        "planDetails.planExpiryDate": { $lt: now },
        "planDetails.isActive": true,
      },
      {
        $set: {
          "planDetails.isActive": false,
          currentPlan: null,
          currentPlanName: "Basic Plan",
        },
      }
    );

    console.log(`Expired plans updated: ${result.modifiedCount}`);
  } catch (err) {
    console.error("Plan expiry cron error:", err);
  }
};

module.exports = markExpiredPlans;