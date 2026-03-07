const express = require('express');
const ForgotPassrouter = express.Router();
const {
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
} = require('../controllers/forgotPassword.controller');

ForgotPassrouter.post('/send-otp', forgotPassword);
ForgotPassrouter.post('/verify-otp', verifyForgotOTP);
ForgotPassrouter.post('/reset', resetPassword);

module.exports = ForgotPassrouter;
