const express = require('express');
const { initiatePayment, verifyPayment } = require('../controllers/payment.controller');
const PaymentRouter = express.Router();

PaymentRouter.post('/initiate', initiatePayment);
PaymentRouter.post('/verify/success', verifyPayment);
PaymentRouter.post('/verify/failure', verifyPayment);
PaymentRouter.post('/verify', verifyPayment);

module.exports = PaymentRouter;
