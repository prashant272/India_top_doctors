import { API, baseURL } from "../utils/Utils";

export const createGallery = async (data) => {
  return API.post(`${baseURL}/doctorGallery/create`, data);
};

export const getDoctorGallery = async (doctorId) => {
  return API.get(`${baseURL}/doctorGallery/doctor/${doctorId}`);
};

export const getGalleryById = async (id) => {
  return API.get(`${baseURL}/doctorGallery/${id}`);
};

export const updateGallery = async (id, data) => {
  return API.put(`${baseURL}/doctorGallery/update/${id}`, data);
};

export const deleteGallery = async (id) => {
  return API.delete(`${baseURL}/doctorGallery/delete/${id}`);
};
