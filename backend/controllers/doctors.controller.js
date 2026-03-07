const { default: mongoose } = require("mongoose");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcrypt");
const Appointment = require("../models/Appointment");
const { SAFE_DOCTOR_FIELDS, SAFE_PATIENT_FIELDS } = require("../utils/selectFields");

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await Doctor.findById(doctorId)
      .populate("currentPlan")
      .populate("hospitalAffiliations.hospital", "name email phone address logo isVerified isActive")
      .select("-password");

    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found" });
    }

    if (
      doctor.planDetails?.planExpiryDate &&
      doctor.planDetails.planExpiryDate < new Date()
    ) {
      doctor.planDetails.isActive = false;
      await doctor.save();
    }

    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { basicInfo, professionalInfo, availability, password, isPremium } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found" });
    }

    if (basicInfo) {
      if (basicInfo.email && basicInfo.email !== doctor.basicInfo.email) {
        const emailExists = await Doctor.findOne({
          "basicInfo.email": basicInfo.email,
          _id: { $ne: doctorId },
        });
        if (emailExists) {
          return res.status(409).json({ success: false, msg: "Email already in use" });
        }
      }

      if (basicInfo.socialLinks) {
        doctor.basicInfo.socialLinks = {
          ...doctor.basicInfo.socialLinks?.toObject?.() ?? doctor.basicInfo.socialLinks ?? {},
          ...basicInfo.socialLinks,
        };
        delete basicInfo.socialLinks;
      }

      Object.assign(doctor.basicInfo, basicInfo);
    }

    if (professionalInfo) {
      Object.assign(doctor.professionalInfo, professionalInfo);
    }

    if (availability && Array.isArray(availability)) {
      availability.forEach((slot) => {
        const coords = slot.location?.coordinates?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          slot.location.coordinates = {
            type: "Point",
            coordinates: [Number(coords[0]), Number(coords[1])],
          };
        } else if (!coords || coords.length === 0) {
          if (slot.location?.coordinates) delete slot.location.coordinates;
        }
      });
      doctor.availability = availability;
    }

    if (typeof isPremium === "boolean") {
      doctor.isPremium = isPremium;
      if (isPremium && !doctor.premiumActivatedAt) {
        doctor.premiumActivatedAt = new Date();
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(12);
      doctor.password = await bcrypt.hash(password, salt);
    }

    await doctor.save();

    const updatedDoctor = doctor.toObject();
    delete updatedDoctor.password;

    return res.status(200).json({
      success: true,
      doctor: updatedDoctor,
      msg: "Profile updated successfully",
    });
  } catch (error) {
    console.error("🔥 FULL ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error while updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.addHospitalAffiliation = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { hospitalId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ success: false, msg: "Invalid hospital ID" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, msg: "Hospital not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found" });
    }

    const alreadyCurrent = doctor.hospitalAffiliations.some(
      (a) => a.hospital.toString() === hospitalId && a.isCurrent
    );
    if (alreadyCurrent) {
      return res.status(409).json({ success: false, msg: "Already affiliated with this hospital" });
    }

    doctor.hospitalAffiliations.push({
      hospital: hospitalId,
      hospitalName: hospital.name,
      joinedAt: new Date(),
      leftAt: null,
      isCurrent: true,
    });

    await doctor.save();

    await Hospital.findByIdAndUpdate(hospitalId, {
      $addToSet: { doctors: doctorId },
    });

    const updated = await Doctor.findById(doctorId)
      .populate("hospitalAffiliations.hospital", "name email phone address logo isVerified isActive")
      .select("-password");

    return res.status(200).json({
      success: true,
      msg: `Affiliated with ${hospital.name}`,
      doctor: updated,
    });
  } catch (error) {
    console.error("Add affiliation error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.removeHospitalAffiliation = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { hospitalId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ success: false, msg: "Invalid hospital ID" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found" });
    }

    const affiliation = doctor.hospitalAffiliations.find(
      (a) => a.hospital.toString() === hospitalId && a.isCurrent
    );

    if (!affiliation) {
      return res.status(404).json({ success: false, msg: "Active affiliation not found" });
    }

    affiliation.isCurrent = false;
    affiliation.leftAt = new Date();

    await doctor.save();

    await Hospital.findByIdAndUpdate(hospitalId, {
      $pull: { doctors: doctorId },
    });

    const updated = await Doctor.findById(doctorId)
      .populate("hospitalAffiliations.hospital", "name email phone address logo isVerified isActive")
      .select("-password");

    return res.status(200).json({
      success: true,
      msg: "Affiliation ended",
      doctor: updated,
    });
  } catch (error) {
    console.error("Remove affiliation error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.getAffiliationHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await Doctor.findById(doctorId)
      .populate("hospitalAffiliations.hospital", "name email phone address logo isVerified isActive")
      .select("hospitalAffiliations basicInfo");

    if (!doctor) {
      return res.status(404).json({ success: false, msg: "Doctor not found" });
    }

    const current = doctor.hospitalAffiliations.filter(a => a.isCurrent);
    const past = doctor.hospitalAffiliations.filter(a => !a.isCurrent);

    return res.status(200).json({
      success: true,
      current,
      past,
      total: doctor.hospitalAffiliations.length,
    });
  } catch (error) {
    console.error("Get affiliation history error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID" });
    }

    const doctor = await Doctor.findOne(
      { _id: id, role: "doctor", isActive: true },
      { availability: 1, basicInfo: 1, professionalInfo: 1 }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        name: doctor.basicInfo?.fullName || "",
        specialization: doctor.professionalInfo?.specialization || "",
        availability: doctor.availability || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

exports.getAllPatientsOfDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID not found" });
    }

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate({ path: "Patient", select: SAFE_PATIENT_FIELDS })
      .sort({ appointmentDate: -1 });

    const uniquePatientsMap = new Map();
    appointments.forEach((appt) => {
      if (appt.Patient && !uniquePatientsMap.has(appt.Patient._id.toString())) {
        uniquePatientsMap.set(appt.Patient._id.toString(), appt.Patient);
      }
    });

    const uniquePatients = Array.from(uniquePatientsMap.values());

    return res.status(200).json({
      success: true,
      count: uniquePatients.length,
      patients: uniquePatients,
    });
  } catch (error) {
    console.error("Error fetching patients of doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
