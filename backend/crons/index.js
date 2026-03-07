const { startPlanExpiryCron, runPlanExpiryJob } = require("./planExpiry.cron");
const { startAppointmentCron, runMissedAppointmentJob } = require("./appointment.cron");

const startAllCrons = async () => {
  console.log("Starting all cron jobs...");

  await runPlanExpiryJob();
  await runMissedAppointmentJob();

//   startPlanExpiryCron();
//   startAppointmentCron();
};

module.exports = startAllCrons;
