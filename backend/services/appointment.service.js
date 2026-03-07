const Appointment = require("../models/Appointment");

exports.markExpiredAppointments = async () => {
  try {
    const now = new Date();

    const result = await Appointment.updateMany(
      {
        appointmentDate: { $lt: now },
        status: { $in: ["pending", "confirmed"] }
      },
      {
        $set: { status: "missed" }
      }
    );

    console.log(
      `Expired appointments updated: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error("Cron Error:", error.message);
  }
};