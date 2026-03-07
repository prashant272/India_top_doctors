const express = require("express");
const BlogRouter = express.Router();
const blogController = require("../controllers/blog.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

BlogRouter.post("/create", authMiddleware, blogController.createBlog);

BlogRouter.get("/platform", blogController.getPlatformBlogs);

BlogRouter.get("/doctor/:doctorId", authMiddleware, blogController.getDoctorBlogs);

BlogRouter.get("/:id", blogController.getBlogById);

BlogRouter.put("/:id", authMiddleware, blogController.updateBlog);

BlogRouter.delete("/:id", authMiddleware, blogController.deleteBlog);

module.exports = BlogRouter;