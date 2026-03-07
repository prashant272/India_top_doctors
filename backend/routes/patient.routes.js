const express = require('express')
const { getDoctors } = require('../controllers/patient.controller')

const PatientRouter = express.Router()

PatientRouter.get("/getdoctors",getDoctors)

module.exports = PatientRouter