import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8086";

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
