import { API, baseURL } from "../utils/Utils";

export const getDashboardStats = async () =>
  API.get(`/admin/dashboard-stats`);

export const getAllDoctors = async () =>
  API.get(`/admin/doctors`);

export const getAllPatients = async () =>
  API.get(`/admin/patients`);

export const deleteDoctor = async (id) =>
  API.delete(`/admin/doctor/${id}`);

export const deletePatient = async (id) =>
  API.delete(`/admin/patient/${id}`);

export const getAllAppointment = async () =>
  API.get(`/admin/appointments`);

export const getAppointmentById = async (id) =>
  API.get(`/admin/appointments/${id}`);

export const getAllAdmins = async () =>
  API.get(`/admin/getAllAdmins`);

export const deleteAdmin = async (id) =>
  API.delete(`/admin/deleteAdmin/${id}`);

export const getAllHospitals = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return API.get(`/hospitals${query ? `?${query}` : ""}`);
};

export const verifyHospital = async (id) =>
  API.patch(`/admin/hospitals/${id}/verify`);

export const toggleHospitalActiveStatus = async (id) =>
  API.patch(`/admin/hospitals/${id}/toggle-active`);

export const getAllProviders = async () =>
  API.get(`/admin/providers`);

export const deleteProvider = async (id) =>
  API.delete(`/admin/provider/${id}`);

export const getProviderById = async (id) =>
  API.get(`/admin/provider/${id}`);
