const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
  allDoctors,
  allPatients,
  deleteDoctor,
  deletePatients,
  getAllAppointment,
  getAppointmentById,
  getAllAdmins,
  deleteAdmin,
  verifyHospital,
  toggleHospitalActiveStatus
} = require("../controllers/admin.controller");

const AdminRouter = express.Router();

AdminRouter.get("/dashboard-stats", authMiddleware, getDashboardStats);
AdminRouter.get("/doctors", authMiddleware, allDoctors);
AdminRouter.get("/patients", authMiddleware, allPatients);
AdminRouter.delete("/doctor/:id", authMiddleware, deleteDoctor);
AdminRouter.delete("/patient/:id", authMiddleware, deletePatients);
AdminRouter.get("/appointments", authMiddleware, getAllAppointment);
AdminRouter.get("/appointments/:id", authMiddleware, getAppointmentById);
AdminRouter.get("/getAllAdmins", authMiddleware, getAllAdmins);
AdminRouter.delete("/deleteAdmin/:adminId", authMiddleware, deleteAdmin);
AdminRouter.patch("/hospitals/:id/verify",        authMiddleware, verifyHospital)
AdminRouter.patch("/hospitals/:id/toggle-active", authMiddleware, toggleHospitalActiveStatus)

module.exports = AdminRouter;