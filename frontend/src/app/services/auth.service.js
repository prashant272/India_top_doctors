import { API, baseURL } from "@/app/utils/Utils";

export const signUp = async (body, role) => {
  const endpoint = `${baseURL}/auth/${role}/signup`;
  return API.post(endpoint, body);
};

export const signIn = async (body, role) => {
  const endpoint = `${baseURL}/auth/${role}/signin`;
  return API.post(endpoint, body);
};

export const refreshToken = async (refreshToken) => {
  return API.post(`${baseURL}/auth/refresh`, { refreshToken });
};

export const updateProfile = async (body) => {
  return API.put(`${baseURL}/profile/update`, body);
};

export const updatePassword = async (body) => {
  return API.put(`${baseURL}/profile/updatepassword`, body);
};
