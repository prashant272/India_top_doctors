const express = require('express')
const { doctorSignUp, doctorSignIn } = require('../controllers/auth/doctorAuth.controller')
const { patientSignUp, patientSignIn } = require('../controllers/auth/patientAuth.controller')
const { adminSignUp, adminSignIn } = require('../controllers/auth/adminAuth.controller')

const AuthRouter = express.Router()

AuthRouter.post("/doctor/signup", doctorSignUp)
AuthRouter.post("/doctor/signin", doctorSignIn)
AuthRouter.post("/patient/signup", patientSignUp)
AuthRouter.post("/patient/signin", patientSignIn)
AuthRouter.post("/admin/signup", adminSignUp)
AuthRouter.post("/admin/signin", adminSignIn)

module.exports = AuthRouter