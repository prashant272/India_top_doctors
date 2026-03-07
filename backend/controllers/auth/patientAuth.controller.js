const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Patient = require('../../models/Patient');
const { verifyOTP, checkVerified } = require('../../services/otp.service');

exports.patientSignUp = async (req, res) => {
  try {
    const { name, email, phone, dob, gender, address, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    const checkUser = await Patient.findOne({ 'basicInfo.email': email });
    if (checkUser) {
      return res.status(409).json({ success: false, msg: 'Patient already exists with this email' });
    }

    const otpCheck = await checkVerified(email);
    if (!otpCheck.verified) {
      return res.status(400).json({ success: false, msg: otpCheck.msg });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    if (!name) {
      return res.status(400).json({ success: false, msg: 'Full name is required' });
    }

    const Salt = await bcrypt.genSalt(12);
    const hashpassword = await bcrypt.hash(password, Salt);

    const NewPatient = new Patient({
      basicInfo: {
        fullName: name,
        email,
        phone,
        gender,
        age: dob ? calculateAge(dob) : null,
        address: address?.city && address?.state ? `${address.city}, ${address.state}` : '',
      },
      medicalInfo: { allergies: '', history: '', currentMedication: '' },
      password: hashpassword,
      role: role || 'patient',
    });

    const patient = await NewPatient.save();
    const patientResponse = patient.toObject();
    delete patientResponse.password;

    const token = jwt.sign(
      { userId: patient._id, email: patient.basicInfo.email, role: patient.role },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: patient._id, role: patient.role },
      process.env.REFRESH_SECRET || process.env.SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      refreshToken,
      patient: patientResponse,
      msg: 'Patient account created successfully',
    });
  } catch (error) {
    console.error('Patient signup error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.patientSignIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Email and password are required' });
    }

    const patient = await Patient.findOne({ 'basicInfo.email': email });

    if (!patient) {
      return res.status(404).json({ success: false, msg: 'Patient account does not exist' });
    }

    if (role && patient.role !== role) {
      return res.status(403).json({
        success: false,
        msg: `This account is registered as ${patient.role}, not ${role}`,
      });
    }

    const verify = await bcrypt.compare(password, patient.password);
    if (!verify) {
      return res.status(401).json({ success: false, msg: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: patient._id, email: patient.basicInfo.email, role: patient.role },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: patient._id, role: patient.role },
      process.env.REFRESH_SECRET || process.env.SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      patient: {
        id: patient._id,
        fullName: patient.basicInfo.fullName,
        email: patient.basicInfo.email,
        phone: patient.basicInfo.phone,
        gender: patient.basicInfo.gender,
        age: patient.basicInfo.age,
        bloodGroup: patient.basicInfo.bloodGroup,
        address: patient.basicInfo.address,
        role: patient.role,
      },
      msg: 'Login successful',
    });
  } catch (error) {
    console.error('Patient signin error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
