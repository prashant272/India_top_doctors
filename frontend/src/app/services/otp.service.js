import { API, baseURL } from "../utils/Utils";

export const sendOTP = async (data) => {
  return API.post(`${baseURL}/otp/send`, data);
};

export const verifyOTP = async (data) => {
  return API.post(`${baseURL}/otp/verify`, data);
};
