/**
 * API Configuration - Static constants and settings
 * Centralized configuration for all API calls
 */

export const API_CONFIG = {
  // Base URL do API Gateway
  BASE_URL: import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080",

  // Service Endpoints
  ENDPOINTS: {
    AUTH: "/api/auth",
    USERS: "/api/users",
    BOOKINGS: "/api/bookings",
    ROOMS: "/api/rooms",
    ROOMTYPES: "/api/room-types",
    EMAIL: "/api/email",
    PROMOTIONS: "/api/promotions",
    PROMOTIONS_TYPES: "/api/promotion-types",
    ROOM_TYPE_PROMOTIONS: "/api/room-type-promotions",
    SEASONAL_PRICES: "/api/principle/seasonal-prices",
    CALCULATE_ROOM_PRICE: "/api/principle/calculate-room-price",
    CHECKIN_CHECKOUT_POLICIES: "/api/principle/checkin-checkout-policies",
    CHECKIN_CHECKOUT_POLICY_RULES: "/api/principle/checkin-checkout-policy-rules",
    HOURLY_RATE_POLICIES: "/api/principle/hourly-rate-policies",
  
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
