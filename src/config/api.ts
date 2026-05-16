import axios from 'axios';

export const BASE_API_URL =
    import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

// Optional: Thêm interceptors nếu cần xử lý token, error chung
axiosInstance.interceptors.request.use(
    (config) => {
        // Có thể thêm token vào header ở đây
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
