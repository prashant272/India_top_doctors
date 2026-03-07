const express = require("express");
const DoctorGalleryRouter = express.Router();
const galleryController = require("../controllers/gallery.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

DoctorGalleryRouter.post("/create",authMiddleware, galleryController.createGallery);

DoctorGalleryRouter.get("/doctor/:doctorId", galleryController.getDoctorGallery);

DoctorGalleryRouter.get("/:id", galleryController.getGalleryById);

DoctorGalleryRouter.put("/update/:id", galleryController.updateGallery);

DoctorGalleryRouter.delete("/delete/:id", galleryController.deleteGallery);

module.exports = DoctorGalleryRouter;