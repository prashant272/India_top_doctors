const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const { io, getReceiverSocketId } = require("../services/socket.service");

const runMissedAppointmentJob = async () => {
  console.log("Checking missed appointments...");

  const now = new Date();

  const missedAppointments = await Appointment.find({
    appointmentDate: { $lt: now },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("Patient", "_id basicInfo")
    .populate("doctor", "_id basicInfo");

  if (!missedAppointments.length) {
    console.log("No missed appointments found");
    return;
  }

  await Appointment.updateMany(
    { _id: { $in: missedAppointments.map((a) => a._id) } },
    { $set: { status: "missed" } }
  );

  missedAppointments.forEach((appointment) => {
    const doctorId = appointment.doctor?._id?.toString();
    const patientId = appointment.Patient?._id?.toString();

    const doctorSocketId = getReceiverSocketId(doctorId);
    const patientSocketId = getReceiverSocketId(patientId);

    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timeSlot = `${appointment.timeSlot?.start} - ${appointment.timeSlot?.end}`;

    if (doctorSocketId) {
      io.to(doctorSocketId).emit("appointment:missed", {
        appointmentId: appointment._id,
        message: `Appointment with ${appointment.Patient?.basicInfo?.fullName || "a patient"} on ${appointmentDate} at ${timeSlot} was missed.`,
        patientName: appointment.Patient?.basicInfo?.fullName,
        appointmentDate,
        timeSlot,
      });
    }

    if (patientSocketId) {
      io.to(patientSocketId).emit("appointment:missed", {
        appointmentId: appointment._id,
        message: `Your appointment with Dr. ${appointment.doctor?.basicInfo?.fullName || "your doctor"} on ${appointmentDate} at ${timeSlot} was missed.`,
        doctorName: appointment.doctor?.basicInfo?.fullName,
        appointmentDate,
        timeSlot,
      });
    }
  });

  console.log(`Missed appointments updated: ${missedAppointments.length}`);
};

const startAppointmentCron = () => {
  cron.schedule("0 0 * * *", runMissedAppointmentJob);
};

module.exports = { startAppointmentCron, runMissedAppointmentJob };
