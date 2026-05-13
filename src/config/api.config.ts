/**
 * API Configuration - Static constants and settings
 * Centralized configuration for all API calls
 */
const gatewayUrl = (
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const apiBaseUrl = gatewayUrl.endsWith("/api")
  ? gatewayUrl
  : `${gatewayUrl}/api`;

export const API_CONFIG = {
  // Base URL do API Gateway
  BASE_URL: apiBaseUrl,

  // Service Endpoints
  ENDPOINTS: {
    AUTH: "/auth",
    USERS: "/users",
    BOOKINGS: "/bookings",
  },

  // Timeouts (ms)
  TIMEOUTS: {
    REQUEST: 10000,
    RESPONSE: 10000,
  },

  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: "token",
    REFRESH_TOKEN: "refreshToken",
    USER: "user",
  },
};
