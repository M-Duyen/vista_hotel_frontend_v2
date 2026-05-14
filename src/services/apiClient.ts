import axios from "axios";
import { refreshToken } from "./authService";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Tự động thêm JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Auto refresh token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn (401) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã retry

      try {
        const result = await refreshToken(); // Gọi API refresh token

        if (result.success && result.token) {
          // Refresh thành công → Cập nhật token mới
          originalRequest.headers.Authorization = `Bearer ${result.token}`;
          return api(originalRequest); // Retry request gốc với token mới
        } else {
          // Refresh thất bại, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
      } catch (refreshError) {
        // Lỗi khi refresh → Logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
)