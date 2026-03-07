const bcrypt = require('bcrypt');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const { generateAndSendOTP, verifyOTP } = require('../services/otp.service');


exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, msg: 'Email and role are required' });
    }

    let user = null;

    if (role === 'doctor') {
      user = await Doctor.findOne({ 'basicInfo.email': email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ 'basicInfo.email': email });
    } else if (role === 'admin' || role === 'superadmin') {
      user = await Admin.findOne({ email });
    } else {
      return res.status(400).json({ success: false, msg: 'Invalid role' });
    }

    if (!user) {
      return res.status(404).json({ success: false, msg: `No ${role} account found with this email` });
    }

    if (role === 'admin' || role === 'superadmin') {
      if (!user.isActive) {
        return res.status(403).json({ success: false, msg: 'Admin account is deactivated' });
      }
    }

    const name =
      role === 'doctor' || role === 'patient'
        ? user.basicInfo.fullName
        : user.fullName;

    await generateAndSendOTP(email, name || 'User');

    return res.status(200).json({ success: true, msg: 'OTP sent to your email for password reset' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, msg: 'Email and OTP are required' });
    }

    const result = await verifyOTP(email, otp);

    if (!result.valid) {
      return res.status(400).json({ success: false, msg: result.msg });
    }

    return res.status(200).json({ success: true, msg: 'OTP verified. You can now reset your password' });
  } catch (error) {
    console.error('Verify forgot OTP error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, role, newPassword, confirmPassword } = req.body;

    if (!email || !role || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, msg: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, msg: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    let user = null;

    if (role === 'doctor') {
      user = await Doctor.findOne({ 'basicInfo.email': email });
    } else if (role === 'patient') {
      user = await Patient.findOne({ 'basicInfo.email': email });
    } else if (role === 'admin' || role === 'superadmin') {
      user = await Admin.findOne({ email }).select('+password');
    } else {
      return res.status(400).json({ success: false, msg: 'Invalid role' });
    }

    if (!user) {
      return res.status(404).json({ success: false, msg: `No ${role} account found with this email` });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, msg: 'New password cannot be the same as the current password' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, msg: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
