const Blog = require("../models/Blog");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.createBlog = async (req, res, next) => {
  try {
    const { type, image } = req.body;

    let uploadedImage = {};

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "blogs",
        resource_type: "auto",
      });
      uploadedImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const { image: _image, ...rest } = req.body;

    const blog = await Blog.create({
      ...rest,
      featuredImage: uploadedImage,
      author: req.user.id,
      authorModel: type === "doctor" ? "Doctor" : "Admin",
      doctor: type === "doctor" ? req.user.id : null,
      publishedAt: rest.status === "published" ? new Date() : null,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorBlogs = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ success: false });
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {
      doctor: doctorId,
      type: "doctor",
      isActive: true,
    };

    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlatformBlogs = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, status } = req.query;

    const query = {
      type: "platform",
      isActive: true,
    };

    if (status) {
      query.status = status;
    } else {
      query.status = "published";
    }

    if (search) query.$text = { $search: search };

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false });
    }

    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "basicInfo.fullName email"
    );

    if (!blog) {
      return res.status(404).json({ success: false });
    }

    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const { image, featuredImage: _fi, ...rest } = req.body;

    if (image) {
      if (blog.featuredImage?.public_id) {
        await cloudinary.uploader.destroy(blog.featuredImage.public_id);
      }

      const result = await cloudinary.uploader.upload(image, {
        folder: "blogs",
        resource_type: "auto",
      });

      blog.featuredImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    Object.assign(blog, rest);

    if (rest.status === "published" && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user.id,
    });

    if (!blog) {
      return res.status(404).json({ success: false });
    }

    if (blog.featuredImage?.public_id) {
      await cloudinary.uploader.destroy(blog.featuredImage.public_id);
    }

    blog.isActive = false;
    await blog.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
