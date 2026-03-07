const express = require('express')
const { addPrescription, getPrescriptionByRole, getPrescriptionById } = require('../controllers/prescription.controller')
const { authMiddleware } = require('../middleware/authMiddleware')

const PrescriptionRouter = express.Router()

PrescriptionRouter.post("/addPrescription",addPrescription)
PrescriptionRouter.get("/getPrescriptionsbyRole",authMiddleware,getPrescriptionByRole)
PrescriptionRouter.get("/getPrescriptionsbyId/:id",getPrescriptionById)

module.exports = PrescriptionRouter