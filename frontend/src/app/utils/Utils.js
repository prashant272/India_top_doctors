import axios from "axios";

const isDevelopment = (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168."))) ||
  (process.env.NODE_ENV === 'development');

let rawBaseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.indiatopdoctors.com";

if (rawBaseURL && !rawBaseURL.startsWith("http://") && !rawBaseURL.startsWith("https://")) {
  rawBaseURL = `https://${rawBaseURL}`;
}

const baseURL = rawBaseURL;

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("UserData");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      const token = parsedUser?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { axios, API, baseURL };
