const DoctorGallery = require("../models/DoctorGallery");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.createGallery = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { title, description, imageUrl, linkUrl } = req.body;

    let uploadedImage = "";

    if (imageUrl && imageUrl.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: "doctorGallery",
      });
      uploadedImage = result.secure_url;
    }

    const gallery = await DoctorGallery.create({
      doctorId,
      title,
      description,
      imageUrl: uploadedImage,
      videoLink: linkUrl,
    });

    res.status(201).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
//         console.log("🔥 FULL ERROR:", error);
//   console.log("🔥 ERROR MESSAGE:", error.message);
//   console.log("🔥 ERROR STACK:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDoctorGallery = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const gallery = await DoctorGallery.find({
      doctorId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await DoctorGallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const { title, description, imageUrl, linkUrl } = req.body;

    const gallery = await DoctorGallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery not found",
      });
    }

    if (imageUrl && imageUrl.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: "doctorGallery",
      });
      gallery.imageUrl = result.secure_url;
    }

    if (title) gallery.title = title;
    if (description) gallery.description = description;
    if (linkUrl) gallery.videoLink = linkUrl;

    await gallery.save();

    res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    await DoctorGallery.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};