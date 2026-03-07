const { baseURL, API } = require("../utils/Utils")

export const updateDoctorProfile = async (id, body) => {
  return API.patch(`${baseURL}/doctor/updateDoctorprofile`, body)
}

export const getDoctorProfile = async (id) => {
  return API.get(`${baseURL}/doctor/getDoctorprofile`)
}

export const getAllpatientofDoctor = async () => {
  return API.get(`${baseURL}/doctor/getAllpatientofDoctor`)
}

export const addHospitalAffiliation = async (hospitalId) => {
  return API.post(`${baseURL}/doctor/affiliations/add`, { hospitalId })
}

export const removeHospitalAffiliation = async (hospitalId) => {
  return API.post(`${baseURL}/doctor/affiliations/remove`, { hospitalId })
}

export const getAffiliationHistory = async () => {
  return API.get(`${baseURL}/doctor/affiliations/history`)
}

export const searchHospitals = async (query) => {
  return API.get(`${baseURL}/hospitals/search?q=${encodeURIComponent(query)}`)
}
