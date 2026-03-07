const Doctor = require("../models/Doctor");
const Review = require("../models/Review");

exports.createReview = async (req, res) => {
  try {
    const { type, doctorId, appointment, rating, reviewText } = req.body;
    const patient = req.user.id;

    const review = await Review.create({
      type,
      doctor: type === "doctor" ? doctorId : null,
      patient,
      appointment: appointment || null,
      rating,
      reviewText,
      isVerified: appointment ? true : false,
    });

    if (type === "doctor") {
      const stats = await Review.aggregate([
        { $match: { doctor: review.doctor, isActive: true, type: "doctor" } },
        {
          $group: {
            _id: "$doctor",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      await Doctor.findByIdAndUpdate(review.doctor, {
        averageRating: stats[0]?.avgRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
      });
    }

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({
      doctor: doctorId,
      type: "doctor",
      isActive: true,
    })
      .populate("patient", "basicInfo.fullName basicInfo.profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPlatformReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      type: "platform",
      isActive: true,
    })
      .populate("patient", "basicInfo.fullName basicInfo.profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("patient", "basicInfo.fullName basicInfo.profileImage")
      .populate("doctor", "basicInfo.fullName");

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const patient = req.user.id;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, patient },
      { rating, reviewText },
      { new: true }
    );

    if (review.type === "doctor") {
      const stats = await Review.aggregate([
        { $match: { doctor: review.doctor, isActive: true, type: "doctor" } },
        {
          $group: {
            _id: "$doctor",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      await Doctor.findByIdAndUpdate(review.doctor, {
        averageRating: stats[0]?.avgRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (String(review.patient) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    review.isActive = false;
    await review.save();

    if (review.type === "doctor") {
      const stats = await Review.aggregate([
        { $match: { doctor: review.doctor, isActive: true, type: "doctor" } },
        {
          $group: {
            _id: "$doctor",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      await Doctor.findByIdAndUpdate(review.doctor, {
        averageRating: stats[0]?.avgRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const patient = req.user.id;

    const reviews = await Review.find({
      patient,
      isActive: true,
    })
      .populate("doctor", "basicInfo.fullName basicInfo.profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true })
      .populate("patient", "basicInfo.fullName basicInfo.profileImage")
      .populate("doctor", "basicInfo.fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
