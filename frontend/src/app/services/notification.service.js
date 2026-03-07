import { API, baseURL } from "../utils/Utils"

export const getNotifications = async () => {
  const endpoint = `${baseURL}/notification/getNotification`
  return API.get(endpoint)
}

export const markAsRead = async (id) => {
  const endpoint = `${baseURL}/notification/markAsRead/${id}`
  return API.put(endpoint)
}

export const getUnreadCount = async () => {
  const endpoint = `${baseURL}/notification/getUnreadCount`
  return API.get(endpoint)
}
