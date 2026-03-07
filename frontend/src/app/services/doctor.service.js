import { API } from "../utils/Utils";

export const updateDoctorProfile = async (id, body) => {
  return API.patch(`/doctor/updatedoctorprofile`, body);
};

export const getDoctorProfile = async (id) => {
  return API.get(`/doctor/getdoctorprofile`);
};

export const getAllpatientofDoctor = async () => {
  return API.get(`/doctor/getallpatientofdoctor`);
};

export const addHospitalAffiliation = async (hospitalId) => {
  return API.post(`/doctor/affiliations/add`, { hospitalId });
};

export const removeHospitalAffiliation = async (hospitalId) => {
  return API.post(`/doctor/affiliations/remove`, { hospitalId });
};

export const getAffiliationHistory = async () => {
  return API.get(`/doctor/affiliations/history`);
};

export const searchHospitals = async (query) => {
  return API.get(`/hospitals/search?query=${query}`);
};
