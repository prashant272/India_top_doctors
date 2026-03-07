import { baseURL, API } from '../utils/Utils'

export const hospitalSignup = async (body) => {
  return API.post(`/hospitals/signup`, body)
}

export const hospitalSignin = async (body) => {
  return API.post(`/hospitals/signin`, body)
}

export const getMe = async () => {
  return API.get(`/hospitals/me`)
}

export const updateMe = async (body) => {
  return API.patch(`/hospitals/me`, body)
}

export const createHospital = async (body) => {
  return API.post(`/hospitals`, body)
}

export const getMyCreatedHospitals = async (params) => {
  return API.get(`/hospitals/my-created`, { params })
}

export const getHospitals = async (params) => {
  return API.get(`/hospitals`, { params })
}

export const getHospitalById = async (id) => {
  return API.get(`/hospitals/${id}`)
}

export const getNearbyHospitals = async ({ lat, lng, distance }) => {
  return API.get(`/hospitals/nearby`, { params: { lat, lng, distance } })
}

export const searchHospitals = async (q) => {
  return API.get(`/hospitals/search`, { params: { q } })
}

export const updateHospital = async (id, body) => {
  return API.patch(`/hospitals/${id}`, body)
}

export const deleteHospital = async (id) => {
  return API.delete(`/hospitals/${id}`)
}

export const verifyHospital = async (id) => {
  return API.patch(`/hospitals/verify/${id}`)
}

export const toggleActiveStatus = async (id) => {
  return API.patch(`/hospitals/toggle/${id}`)
}

export const addDoctor = async (body) => {
  return API.post(`/hospitals/add-doctor`, body)
}

export const removeDoctor = async (body) => {
  return API.post(`/hospitals/remove-doctor`, body)
}
