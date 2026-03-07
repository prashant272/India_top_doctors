import { API, baseURL } from "../utils/Utils";

export const createReview = async (data) => {
  return API.post(`${baseURL}/review/create`, data);
};

export const getAllReviews = async () => {
  return API.get(`${baseURL}/review/all`);
};

export const getDoctorReviews = async (doctorId) => {
  return API.get(`${baseURL}/review/doctor/${doctorId}`);
};

export const getPlatformReviews = async () => {
  return API.get(`${baseURL}/review/platform`);
};

export const getMyReviews = async () => {
  return API.get(`${baseURL}/review/my-reviews`);
};

export const getReviewById = async (id) => {
  return API.get(`${baseURL}/review/${id}`);
};

export const updateReview = async (id, data) => {
  return API.put(`${baseURL}/review/${id}`, data);
};

export const deleteReview = async (id) => {
  return API.delete(`${baseURL}/review/${id}`);
};
