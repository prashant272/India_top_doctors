const express = require('express')
const {
  updateDoctorProfile,
  getDoctorProfile,
  getDoctorAvailability,
  getAllPatientsOfDoctor,
  addHospitalAffiliation,
  removeHospitalAffiliation,
  getAffiliationHistory,
} = require('../controllers/doctors.controller')
const { authMiddleware } = require('../middleware/authMiddleware')

const DoctorRouter = express.Router()

DoctorRouter.patch("/updateDoctorprofile",        authMiddleware, updateDoctorProfile)
DoctorRouter.get("/getDoctorProfile",             authMiddleware, getDoctorProfile)
DoctorRouter.get("/availability/:id",                            getDoctorAvailability)
DoctorRouter.get("/getAllpatientofDoctor",         authMiddleware, getAllPatientsOfDoctor)

DoctorRouter.post("/affiliations/add",            authMiddleware, addHospitalAffiliation)
DoctorRouter.post("/affiliations/remove",         authMiddleware, removeHospitalAffiliation)
DoctorRouter.get("/affiliations/history",         authMiddleware, getAffiliationHistory)

module.exports = DoctorRouter
