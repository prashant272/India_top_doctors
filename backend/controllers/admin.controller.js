const Admin = require("../models/Admin");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");
const Hospital = require("../models/Hospital");
const { SAFE_PATIENT_FIELDS, SAFE_DOCTOR_FIELDS } = require("../utils/selectFields");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalDoctors,
      totalPatients,
      newDoctorsThisMonth,
      newPatientsThisWeek,
      totalAppointmentsToday,
      pendingAppointments,
      monthlyRevenueAgg,
      lastMonthRevenueAgg,
      totalRevenueAgg,
      totalPaidAppointments,
      basicDoctors,
      standardDoctors,
      premiumDoctors,
      premiumDoctorsThisMonth,
      topDoctors,
      reviewStats,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Patient.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Appointment.countDocuments({ appointmentDate: { $gte: startOfDay } }),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Appointment.aggregate([
        {
          $match: {
            isPaid: true,
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
              $lt: startOfMonth,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Appointment.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Appointment.countDocuments({ isPaid: true }),
      Doctor.countDocuments({ currentPlanName: "Basic Plan" }),
      Doctor.countDocuments({ currentPlanName: "Standard Plan" }),
      Doctor.countDocuments({ currentPlanName: "Premium Plan" }),
      Doctor.countDocuments({
        currentPlanName: "Premium Plan",
        "planDetails.planStartDate": { $gte: startOfMonth },
      }),

      Doctor.find({ averageRating: { $gt: 0 } })
        .sort({ averageRating: -1, totalReviews: -1 })
        .limit(5)
        .select(
          "basicInfo.fullName basicInfo.profileImage professionalInfo.specialization averageRating totalReviews totalPatients"
        )
        .lean(),

      Review.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            satisfiedCount: {
              $sum: { $cond: [{ $gte: ["$rating", 4] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total || 0;
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const revenueGrowth =
      lastMonthRevenue === 0
        ? monthlyRevenue > 0 ? "+100%" : "0%"
        : `${monthlyRevenue >= lastMonthRevenue ? "+" : ""}${(
          ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        ).toFixed(1)}%`;

    const satisfactionRate = reviewStats[0]?.totalReviews
      ? Math.round((reviewStats[0].satisfiedCount / reviewStats[0].totalReviews) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        newDoctorsThisMonth,
        totalPatients,
        newPatientsThisWeek,
        totalAppointmentsToday,
        pendingAppointments,
        monthlyRevenue,
        revenueGrowth,
        totalRevenue,
        totalPaidAppointments,
        basicDoctors,
        standardDoctors,
        premiumDoctors,
        premiumDoctorsThisMonth,
        topDoctors,
        satisfactionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};



exports.allDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select("-password");

    if (!doctors) {
      return next(new AppError("Failed to fetch doctors", 404));
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

exports.allPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().select("-password");

    if (!patients) {
      return next(new AppError("Failed to fetch patients", 404));
    }

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Doctor ID is required", 400));
    }

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return next(new AppError("Doctor not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePatients = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Patient ID is required", 400));
    }

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return next(new AppError("Patient not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};


exports.getAllAppointment = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate({ path: "Patient", select: SAFE_PATIENT_FIELDS, strictPopulate: false })
      .populate({ path: "doctor", select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

    if (!appointments) {
      return next(new AppError("Failed to fetch appointments", 404));
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid appointment ID", 400));
    }

    const appointment = await Appointment.findById(id)
      .populate({ path: "Patient", select: SAFE_PATIENT_FIELDS, strictPopulate: false })
      .populate({ path: "doctor", select: SAFE_DOCTOR_FIELDS, strictPopulate: false });

    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });

  } catch (error) {
    console.error("Error fetching admins:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await Admin.findByIdAndDelete(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting admin:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
    });
  }
};


exports.verifyHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    )
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" })

    res.json({ success: true, message: "Hospital verified successfully", hospital })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.toggleHospitalActiveStatus = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital)
      return res.status(404).json({ success: false, message: "Hospital not found" })

    hospital.isActive = !hospital.isActive
    await hospital.save()

    res.json({ success: true, message: `Hospital ${hospital.isActive ? "activated" : "deactivated"}`, hospital })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
