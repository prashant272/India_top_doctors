import { baseURL, API } from '../utils/Utils'

export const hospitalSignup = async (body) => {
  return API.post(`${baseURL}/hospitals/signup`, body)
}

export const hospitalSignin = async (body) => {
  return API.post(`${baseURL}/hospitals/signin`, body)
}

export const getMe = async () => {
  return API.get(`${baseURL}/hospitals/me`)
}

export const updateMe = async (body) => {
  return API.patch(`${baseURL}/hospitals/me`, body)
}

export const createHospital = async (body) => {
  return API.post(`${baseURL}/hospitals`, body)
}

export const getMyCreatedHospitals = async (params) => {
  return API.get(`${baseURL}/hospitals/my-created`, { params })
}

export const getHospitals = async (params) => {
  return API.get(`${baseURL}/hospitals`, { params })
}

export const getHospitalById = async (id) => {
  return API.get(`${baseURL}/hospitals/${id}`)
}

export const getNearbyHospitals = async ({ lat, lng, distance }) => {
  return API.get(`${baseURL}/hospitals/nearby`, { params: { lat, lng, distance } })
}

export const searchHospitals = async (q) => {
  return API.get(`${baseURL}/hospitals/search`, { params: { q } })
}

export const updateHospital = async (id, body) => {
  return API.patch(`${baseURL}/hospitals/${id}`, body)
}

export const deleteHospital = async (id) => {
  return API.delete(`${baseURL}/hospitals/${id}`)
}

export const verifyHospital = async (id) => {
  return API.patch(`${baseURL}/hospitals/verify/${id}`)
}

export const toggleActiveStatus = async (id) => {
  return API.patch(`${baseURL}/hospitals/toggle/${id}`)
}

export const addDoctor = async (body) => {
  return API.post(`${baseURL}/hospitals/add-doctor`, body)
}

export const removeDoctor = async (body) => {
  return API.post(`${baseURL}/hospitals/remove-doctor`, body)
}
