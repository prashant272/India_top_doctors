const express = require('express');
const { sendOTP, confirmOTP } = require('../controllers/otp.controller');
const Otprouter = express.Router();


Otprouter.post('/send', sendOTP);
Otprouter.post('/verify', confirmOTP);

module.exports = Otprouter;
