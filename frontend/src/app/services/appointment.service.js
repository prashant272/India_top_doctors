import { baseURL, API } from '../utils/Utils'

export const createAppointments = async (body) => {
  const endpoint = `/appointment/createappointment`
  return API.post(endpoint, body)
}

export const getAppointments = async (role, id) => {
  const endpoint = `/appointment/getappointment`
  return API.get(endpoint, {
    params: { role, id }
  })
}

export const getAppointmentById = async (id) => {
  const endpoint = `/appointment/getappointment/${id}`
  return API.get(endpoint)
}

export const updateAppointment = async (id, body) => {
  const endpoint = `/appointment/${id}/update`
  return API.patch(endpoint, body)
}

export const confirmAppointment = async (id) => {
  const endpoint = `/appointment/${id}/confirm`
  return API.patch(endpoint)
}

export const cancelAppointment = async (id) => {
  const endpoint = `/appointment/${id}/cancel`
  return API.patch(endpoint)
}

export const joinCall = async (id, role) => {
  const endpoint = `/appointment/${id}/join`
  return API.patch(endpoint, { role })
}

export const leaveCall = async (id, role) => {
  const endpoint = `/appointment/${id}/leave`
  return API.patch(endpoint, { role })
}

export const deleteAppointment = async (id) => {
  const endpoint = `/appointment/${id}/delete`
  return API.delete(endpoint)
}
