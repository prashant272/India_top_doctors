import { API, baseURL } from "@/app/utils/Utils";

export const signUp = async (body, role) => {
  const endpoint = `/auth/${role.toLowerCase()}/signup`;
  return API.post(endpoint, body);
};

export const signIn = async (body, role) => {
  const endpoint = `/auth/${role.toLowerCase()}/signin`;
  return API.post(endpoint, body);
};

export const refreshToken = async (refreshToken) => {
  return API.post(`/auth/refresh`, { refreshToken });
};

export const updateProfile = async (body) => {
  return API.put(`/profile/update`, body);
};

export const updatePassword = async (body) => {
  return API.put(`/profile/updatepassword`, body);
};
