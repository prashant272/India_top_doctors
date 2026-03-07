import { useState } from "react";
import {
  createBlog,
  getDoctorBlogs,
  getDoctorBlogsByStatus,
  getPlatformBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../services/blog.service";

export const useBlog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateBlog = async (data) => {
    try {
      setLoading(true);
      const res = await createBlog(data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetDoctorBlogs = async (doctorId, params) => {
    try {
      setLoading(true);
      const res = await getDoctorBlogs(doctorId, params);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetDoctorBlogsByStatus = async (doctorId, status) => {
    try {
      setLoading(true);
      const res = await getDoctorBlogsByStatus(doctorId, status);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetPlatformBlogs = async (params) => {
    try {
      setLoading(true);
      const res = await getPlatformBlogs(params);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetBlogById = async (id) => {
    try {
      setLoading(true);
      const res = await getBlogById(id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (id, data) => {
    try {
      setLoading(true);
      const res = await updateBlog(id, data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      setLoading(true);
      const res = await deleteBlog(id);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleCreateBlog,
    handleGetDoctorBlogs,
    handleGetDoctorBlogsByStatus,
    handleGetPlatformBlogs,
    handleGetBlogById,
    handleUpdateBlog,
    handleDeleteBlog,
  };
};
