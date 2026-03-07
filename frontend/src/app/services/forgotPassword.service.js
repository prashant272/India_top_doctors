import { API, baseURL } from "../utils/Utils";

export const sendForgotOTP = async (data) => {
  return API.post(`${baseURL}/forgot-password/send-otp`, data);
};

export const verifyForgotOTP = async (data) => {
  return API.post(`${baseURL}/forgot-password/verify-otp`, data);
};

export const resetPassword = async (data) => {
  return API.post(`${baseURL}/forgot-password/reset`, data);
};
