import { API, baseURL } from "../utils/Utils";

export const createGallery = async (data) => {
  return API.post(`/doctorGallery/create`, data);
};

export const getDoctorGallery = async (doctorId) => {
  return API.get(`/doctorGallery/doctor/${doctorId}`);
};

export const getGalleryById = async (id) => {
  return API.get(`/doctorGallery/${id}`);
};

export const updateGallery = async (id, data) => {
  return API.put(`/doctorGallery/update/${id}`, data);
};

export const deleteGallery = async (id) => {
  return API.delete(`/doctorGallery/delete/${id}`);
};
