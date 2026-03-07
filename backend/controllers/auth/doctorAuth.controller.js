const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Doctor = require('../../models/Doctor');
const { verifyOTP, checkVerified } = require('../../services/otp.service');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getPublicId = (url, folder = 'doctors') => {
  const urlParts = url.split('/');
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split('.')[0];
  return `${folder}/${publicId}`;
};

exports.doctorSignUp = async (req, res) => {
  try {
    const { basicInfo, professionalInfo, availability, password, role, isAdminCreating } = req.body;

    if (!basicInfo?.email) {
      return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    const checkUser = await Doctor.findOne({ 'basicInfo.email': basicInfo.email });
    if (checkUser) {
      return res.status(409).json({ success: false, msg: 'Doctor already exists with this email' });
    }

    if (!isAdminCreating) {
      const otpCheck = await checkVerified(basicInfo.email);
      if (!otpCheck.verified) {
        return res.status(400).json({ success: false, msg: otpCheck.msg });
      }
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, msg: 'Password must be at least 6 characters long' });
    }

    if (!basicInfo.fullName || !professionalInfo?.specialization) {
      return res.status(400).json({ success: false, msg: 'Full name and specialization are required' });
    }

    let uploadedProfileImage = basicInfo.profileImage;
    if (basicInfo.profileImage) {
      const uploadResponse = await cloudinary.uploader.upload(basicInfo.profileImage, {
        folder: 'doctors',
        resource_type: 'auto',
      });
      uploadedProfileImage = uploadResponse.secure_url;
    }

    const Salt = await bcrypt.genSalt(12);
    const hashpassword = await bcrypt.hash(password, Salt);

    const NewDoctor = new Doctor({
      basicInfo: {
        fullName: basicInfo.fullName,
        email: basicInfo.email,
        phone: basicInfo.phone,
        gender: basicInfo.gender,
        dob: basicInfo.dob,
        profileImage: uploadedProfileImage,
      },
      professionalInfo: {
        specialization: professionalInfo.specialization,
        qualification: professionalInfo.qualification,
        experience: professionalInfo.experience,
        licenseNumber: professionalInfo.licenseNumber,
        consultationFee: professionalInfo.consultationFee,
      },
      availability: Array.isArray(availability) ? availability : [],
      password: hashpassword,
      role: role || 'doctor',
      isActive: true,
    });

    const doctor = await NewDoctor.save();
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    return res.status(201).json({
      success: true,
      doctor: doctorResponse,
      msg: 'Doctor account created successfully',
    });
  } catch (error) {
    console.error('Doctor signup error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


exports.doctorSignIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Email and password are required' });
    }

    const doctor = await Doctor.findOne({ 'basicInfo.email': email }).populate({
      path: 'currentPlan',
      select: 'name price features isActive',
    });

    if (!doctor) {
      return res.status(404).json({ success: false, msg: 'Doctor account does not exist' });
    }

    if (role && doctor.role !== role) {
      return res.status(403).json({
        success: false,
        msg: `This account is registered as ${doctor.role}, not ${role}`,
      });
    }

    if (!doctor.isActive) {
      return res.status(403).json({ success: false, msg: 'Account is deactivated. Please contact support.' });
    }

    const verify = await bcrypt.compare(password, doctor.password);
    if (!verify) {
      return res.status(401).json({ success: false, msg: 'Invalid password' });
    }

    const isActive =
      doctor.planDetails?.planExpiryDate &&
      new Date(doctor.planDetails.planExpiryDate) > new Date();

    const token = jwt.sign(
      {
        userId: doctor._id,
        email: doctor.basicInfo.email,
        role: doctor.role,
        specialization: doctor.professionalInfo.specialization,
      },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: doctor._id, role: doctor.role },
      process.env.REFRESH_SECRET || process.env.SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      refreshToken,
      doctor: {
        id: doctor._id,
        fullName: doctor.basicInfo.fullName,
        email: doctor.basicInfo.email,
        profileImage: doctor.basicInfo.profileImage,
        specialization: doctor.professionalInfo.specialization,
        role: doctor.role,
      },
      plan: doctor.currentPlan
        ? {
            planId: doctor.currentPlan._id,
            planName: doctor.currentPlan.name,
            price: doctor.currentPlan.price,
            features: doctor.currentPlan.features,
            billingCycle: doctor.planDetails?.billingCycle,
            planStartDate: doctor.planDetails?.planStartDate,
            planExpiryDate: doctor.planDetails?.planExpiryDate,
            isActive: isActive || doctor.planDetails?.isActive,
          }
        : null,
      msg: 'Login successful',
    });
  } catch (error) {
    console.error('Doctor signin error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateDoctorProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, msg: 'Doctor ID is required' });
    }

    if (!profileImage) {
      return res.status(400).json({ success: false, msg: 'profileImage is required' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: 'Doctor not found' });
    }

    if (doctor.basicInfo.profileImage) {
      try {
        const publicId = getPublicId(doctor.basicInfo.profileImage, 'doctors');
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    const uploadResponse = await cloudinary.uploader.upload(profileImage, {
      folder: 'doctors',
      resource_type: 'auto',
    });

    doctor.basicInfo.profileImage = uploadResponse.secure_url;
    await doctor.save();

    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    return res.status(200).json({
      success: true,
      doctor: doctorResponse,
      msg: 'Profile image updated successfully',
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error updating profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, msg: 'Doctor ID is required' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: 'Doctor not found' });
    }

    if (doctor.basicInfo.profileImage) {
      try {
        const publicId = getPublicId(doctor.basicInfo.profileImage, 'doctors');
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    await Doctor.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      deleted: true,
      msg: 'Doctor deleted successfully',
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Server error deleting doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
