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
    CUSTOMER: "/api/customers",
    CART: "/api/cart-beans",
    BOOKINGS: "/api/bookings",
    PAYMENTS: "/api/payments",
    ROOMS: "/api/rooms",
    ROOMTYPES: "/api/room-types",
    EMAIL: "/api/email",
    PROMOTIONS: "/api/promotions",
    CUSTOMER_VOUCHER: "/api/customer-vouchers",
    PROMOTIONS_TYPES: "/api/promotion-types",
    ROOM_TYPE_PROMOTIONS: "/api/room-type-promotions",
    SERVICE: "/api/services",
    VOUCHERS: "/api/vouchers",
    CUSTOMER_VOUCHERS: "/api/customer-vouchers",
    HOLIDAY_VOUCHERS: "/api/holiday-vouchers",
    BIRTHDAY_VOUCHERS: "/api/birthday-vouchers",
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
