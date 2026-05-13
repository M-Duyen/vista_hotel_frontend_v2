import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";
import { API_CONFIG } from "@/config/api.config";

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - common error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const endpoint = error.config?.url;
      const errorMessage =
        (error.response?.data as Record<string, unknown>)?.message ||
        error.message;

      if (status === 401) {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
        console.error(`[401] Unauthorized at ${endpoint}:`, errorMessage);
      }

            if (status === 403) {
                console.error(`[403] Forbidden at ${endpoint}:`, errorMessage);
                console.warn(
                  "You do not have permission to access this resource.",
                );
            }

      if (status && status >= 500) {
        console.error(`[${status}] Server error at ${endpoint}:`, errorMessage);
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export const api = createApiClient(API_CONFIG.BASE_URL);
export const authApi = createApiClient(
  `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`,
);
export const usersApi = createApiClient(
  `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
);
export const bookingsApi = createApiClient(
  `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BOOKINGS}`,
);
export const emailApi = createApiClient(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMAIL}`,
);
export const roomsApi = createApiClient(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMS}`,
);
export const roomTypesApi = createApiClient(
  `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMTYPES}`,
);
export const promotionsApi = createApiClient(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS}`,
);
export const promotionTypesApi = createApiClient(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS_TYPES}`,
);
export const roomTypePromotionsApi = createApiClient(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOM_TYPE_PROMOTIONS}`,
)