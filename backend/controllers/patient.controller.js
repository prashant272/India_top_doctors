const Doctor = require('../models/Doctor');
const Review = require('../models/Review');
const { PUBLIC_DOCTOR_LIST_FIELDS } = require('../utils/selectFields');

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find(
      { isActive: true },
      PUBLIC_DOCTOR_LIST_FIELDS
    )
      .populate({ path: "currentPlan", select: "name price features isActive" })
      .populate({ path: "hospitalAffiliations.hospital", select: "name website logo isVerified isActive" })

    console.log(`[getDoctors] Found ${doctors?.length || 0} active doctors`);

    if (!doctors) {
      return res.status(404).json({ success: false, message: "Failed to fetch doctors" });
    }

    const doctorIds = doctors.map(d => d._id);

    const reviews = await Review.find(
      { doctor: { $in: doctorIds }, isActive: true },
      "doctor rating reviewText patient createdAt"
    ).populate("patient", "name profileImage");

    const reviewsByDoctor = reviews.reduce((acc, review) => {
      const id = review.doctor.toString();
      if (!acc[id]) acc[id] = [];
      acc[id].push(review);
      return acc;
    }, {});

    const doctorsWithReviews = doctors.map(doctor => {
      const docReviews = reviewsByDoctor[doctor._id.toString()] || [];
      const totalReviews = docReviews.length;
      const avgRating = totalReviews > 0
        ? parseFloat((docReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : null;
      const affiliations = doctor.hospitalAffiliations || []
      const currentHospitals = affiliations
        .filter(a => a.isCurrent && a.hospital)
        .map(a => ({
          ...a.hospital.toObject?.() ?? a.hospital,
          joinedAt: a.joinedAt,
        }))
      const pastHospitals = affiliations
        .filter(a => !a.isCurrent && a.hospital)
        .map(a => ({
          ...a.hospital.toObject?.() ?? a.hospital,
          joinedAt: a.joinedAt,
          leftAt: a.leftAt,
        }))

      return {
        ...doctor.toObject(),
        reviews: docReviews,
        totalReviews,
        averageRating: avgRating,
        currentHospitals,
        pastHospitals,
      };
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      DoctorList: doctorsWithReviews,
    });
  } catch (error) {
    console.log("🔥 FULL ERROR:", error);
    console.log("🔥 ERROR MESSAGE:", error.message);
    console.log("🔥 ERROR STACK:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

