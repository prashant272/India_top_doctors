import { API, baseURL } from "../utils/Utils";

export const getDashboardStats = async () =>
  API.get(`${baseURL}/admin/dashboard-stats`);

export const getAllDoctors = async () =>
  API.get(`${baseURL}/admin/doctors`);

export const getAllPatients = async () =>
  API.get(`${baseURL}/admin/patients`);

export const deleteDoctor = async (id) =>
  API.delete(`${baseURL}/admin/doctor/${id}`);

export const deletePatient = async (id) =>
  API.delete(`${baseURL}/admin/patient/${id}`);

export const getAllAppointment = async () =>
  API.get(`${baseURL}/admin/appointments`);

export const getAppointmentById = async (id) =>
  API.get(`${baseURL}/admin/appointments/${id}`);

export const getAllAdmins = async () =>
  API.get(`${baseURL}/admin/getAllAdmins`);

export const deleteAdmin = async (id) =>
  API.delete(`${baseURL}/admin/deleteAdmin/${id}`);

export const getAllHospitals = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return API.get(`${baseURL}/hospitals${query ? `?${query}` : ''}`)
}

export const verifyHospital = async (id) =>
  API.patch(`${baseURL}/admin/hospitals/${id}/verify`);

export const toggleHospitalActiveStatus = async (id) =>
  API.patch(`${baseURL}/admin/hospitals/${id}/toggle-active`);

export const getAllProviders = async () =>
  API.get(`${baseURL}/admin/providers`);

export const deleteProvider = async (id) =>
  API.delete(`${baseURL}/admin/provider/${id}`);

export const getProviderById = async (id) =>
  API.get(`${baseURL}/admin/provider/${id}`);
