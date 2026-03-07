const Doctor = require("../models/Doctor");
const Plans = require("../models/Plans");
const { calculatePlatformFee } = require("../utils/platformFee");

exports.createPlan = async (req, res, next) => {
  try {
    const { name, price, features, platformFee, isActive } = req.body;

    const plan = await Plans.create({
      name,
      price,
      features,
      platformFee,
      isActive,
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plans.find({});

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plan = await Plans.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    await Plans.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedPlan = await Plans.findOneAndReplace(
      { _id: id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    next(error);
  }
};

exports.purchasePlan = async (req, res, next) => {
  try {
    const { doctorId, planId, billingCycle } = req.body;

    const plan = await Plans.findById(planId);

    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive plan",
      });
    }

    const now = new Date();
    let expiryDate = new Date();

    if (billingCycle === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (billingCycle === "halfYearly") {
      expiryDate.setMonth(expiryDate.getMonth() + 6);
    } else if (billingCycle === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle",
      });
    }

    await Doctor.findByIdAndUpdate(doctorId, {
      currentPlan: plan._id,
      currentPlanName: plan.name,
      planDetails: {
        billingCycle,
        planStartDate: now,
        planExpiryDate: expiryDate,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Plan purchased successfully",
      plan: {
        planId: plan._id,
        planName: plan.name,
        price: plan.price,
        features: plan.features,
        platformFee: plan.platformFee,
        billingCycle,
        planStartDate: now,
        planExpiryDate: expiryDate,
        isActive: expiryDate > new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.processConsultationPayment = async (req, res, next) => {
  try {
    const { doctorId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const BASIC_PLAN_ID = "699d85fe1e84f37a5e4c2f51";
    const planId = doctor.currentPlan || BASIC_PLAN_ID;

    const plan = await Plans.findById(planId);

    if (!plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "No active plan found",
      });
    }

    const feeBreakdown = calculatePlatformFee(amount, plan.platformFee);

    res.status(200).json({
      success: true,
      payment: {
        ...feeBreakdown,
        planName: plan.name,
        feeDescription: plan.platformFee.description,
      },
    });
  } catch (error) {
    next(error);
  }
};
