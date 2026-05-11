import axios from "axios";

export const BASE_API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

console.log("[API Config] Base URL:", BASE_API_URL);

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor - Automatically add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
