import { API, baseURL } from "../utils/Utils";

export const createBlog = async (data) => {
  return API.post(`${baseURL}/blog/create`, data);
};

export const getDoctorBlogs = async (doctorId, params) => {
  return API.get(`${baseURL}/blog/doctor/${doctorId}`, { params });
};

export const getDoctorBlogsByStatus = async (doctorId, status) => {
  return API.get(`${baseURL}/blog/doctor/${doctorId}`, {
    params: { status },
  });
};

export const getPlatformBlogs = async (params) => {
  return API.get(`${baseURL}/blog/platform`, { params });
};

export const getBlogById = async (id) => {
  return API.get(`${baseURL}/blog/${id}`);
};

export const updateBlog = async (id, data) => {
  return API.put(`${baseURL}/blog/${id}`, data);
};

export const deleteBlog = async (id) => {
  return API.delete(`${baseURL}/blog/${id}`);
};