import { API, baseURL } from "../utils/Utils";

export const createReview = async (data) => {
  return API.post(`/review/create`, data);
};

export const getAllReviews = async () => {
  return API.get(`/review/all`);
};

export const getDoctorReviews = async (doctorId) => {
  return API.get(`/review/doctor/${doctorId}`);
};

export const getPlatformReviews = async () => {
  return API.get(`/review/platform`);
};

export const getMyReviews = async () => {
  return API.get(`/review/my-reviews`);
};

export const getReviewById = async (id) => {
  return API.get(`/review/${id}`);
};

export const updateReview = async (id, data) => {
  return API.put(`/review/${id}`, data);
};

export const deleteReview = async (id) => {
  return API.delete(`/review/${id}`);
};
