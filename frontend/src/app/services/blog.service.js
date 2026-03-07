import { API, baseURL } from "../utils/Utils";

export const createBlog = async (data) => {
  return API.post(`/blog/create`, data);
};

export const getDoctorBlogs = async (doctorId, params) => {
  return API.get(`/blog/doctor/${doctorId}`, { params });
};

export const getDoctorBlogsByStatus = async (doctorId, status) => {
  return API.get(`/blog/doctor/${doctorId}`, {
    params: { status },
  });
};

export const getPlatformBlogs = async (params) => {
  return API.get(`/blog/platform`, { params });
};

export const getBlogById = async (id) => {
  return API.get(`/blog/${id}`);
};

export const updateBlog = async (id, data) => {
  return API.put(`/blog/${id}`, data);
};

export const deleteBlog = async (id) => {
  return API.delete(`/blog/${id}`);
};