const express = require("express");
const ReviewRouter = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/review.controller");

ReviewRouter.post("/create", authMiddleware, reviewController.createReview);
ReviewRouter.get("/all", authMiddleware, reviewController.getAllReviews);
ReviewRouter.get("/doctor/:doctorId", reviewController.getDoctorReviews);
ReviewRouter.get("/platform", reviewController.getPlatformReviews);
ReviewRouter.get("/my-reviews", authMiddleware, reviewController.getMyReviews);
ReviewRouter.get("/:id", reviewController.getSingleReview);
ReviewRouter.put("/:id", authMiddleware, reviewController.updateReview);
ReviewRouter.delete("/:id", authMiddleware, reviewController.deleteReview);

module.exports = ReviewRouter;
