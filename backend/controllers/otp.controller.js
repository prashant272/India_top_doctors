const { generateAndSendOTP, verifyOTP } = require("../services/otp.service");
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.sendOTP = async (req, res) => {
  try {
    const { email, fullName, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    if (role === 'doctor') {
      const existingDoctor = await Doctor.findOne({ 'basicInfo.email': email });
      if (existingDoctor) {
        return res.status(409).json({ success: false, msg: 'Doctor already exists with this email' });
      }
    }

    if (role === 'patient') {
      const existingPatient = await Patient.findOne({ 'basicInfo.email': email });
      if (existingPatient) {
        return res.status(409).json({ success: false, msg: 'Patient already exists with this email' });
      }
    }

    await generateAndSendOTP(email, fullName || 'User');

    return res.status(200).json({ success: true, msg: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.confirmOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, msg: 'Email and OTP are required' });
    }

    const result = await verifyOTP(email, otp);

    if (!result.valid) {
      return res.status(400).json({ success: false, msg: result.msg });
    }

    return res.status(200).json({ success: true, msg: 'OTP verified successfully' });
  } catch (error) {
    console.error('Confirm OTP error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
