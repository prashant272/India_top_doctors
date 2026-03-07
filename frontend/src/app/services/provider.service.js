import { baseURL, API } from '../utils/Utils'

export const providerSignup = async (body) => {
  return API.post(`${baseURL}/providers/signup`, body)
}

export const providerSignin = async (body) => {
  return API.post(`${baseURL}/providers/signin`, body)
}

export const getProviderMe = async () => {
  return API.get(`${baseURL}/providers/me`)
}

export const updateProviderMe = async (body) => {
  return API.patch(`${baseURL}/providers/me`, body)
}

export const providerCreateHospital = async (body) => {
  return API.post(`${baseURL}/providers/hospitals`, body)
}

export const providerGetMyHospitals = async (params) => {
  return API.get(`${baseURL}/providers/hospitals`, { params })
}

export const providerGetHospitalById = async (id) => {
  return API.get(`${baseURL}/providers/hospitals/${id}`)
}

export const providerUpdateHospital = async (id, body) => {
  return API.patch(`${baseURL}/providers/hospitals/${id}`, body)
}

export const providerDeleteHospital = async (id) => {
  return API.delete(`${baseURL}/providers/hospitals/${id}`)
}

export const providerToggleActiveStatus = async (id) => {
  return API.patch(`${baseURL}/providers/hospitals/${id}/toggle`)
}

export const providerAddDoctor = async (body) => {
  return API.post(`${baseURL}/providers/hospitals/add-doctor`, body)
}

export const providerRemoveDoctor = async (body) => {
  return API.post(`${baseURL}/providers/hospitals/remove-doctor`, body)
}
