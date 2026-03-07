const cron = require("node-cron");
const Doctor = require("../models/Doctor");
const { io, getReceiverSocketId } = require("../services/socket.service");

const runPlanExpiryJob = async () => {
  console.log("Running Plan Expiry Cron...");

  const now = new Date();

  const expiredDoctors = await Doctor.find({
    "planDetails.planExpiryDate": { $lt: now },
    "planDetails.isActive": true,
  }).select("_id");

  if (!expiredDoctors.length) {
    console.log("No expired plans found");
    return;
  }

  await Doctor.updateMany(
    { _id: { $in: expiredDoctors.map((d) => d._id) } },
    {
      $set: {
        "planDetails.isActive": false,
        currentPlan: null,
        currentPlanName: "Basic Plan",
      },
    }
  );

  expiredDoctors.forEach((doctor) => {
    const socketId = getReceiverSocketId(doctor._id.toString());
    if (socketId) {
      io.to(socketId).emit("plan:expired", {
        message: "Your subscription plan has expired",
      });
    }
  });

  console.log(`Expired plans updated: ${expiredDoctors.length}`);
};

const startPlanExpiryCron = () => {
  cron.schedule("0 0 * * *", runPlanExpiryJob);
};

module.exports = { startPlanExpiryCron, runPlanExpiryJob };
