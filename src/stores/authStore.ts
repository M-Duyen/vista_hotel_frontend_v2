import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { API_CONFIG } from "@/config/api.config";
import * as authService from "@/services/authService";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  StoredUser,
} from "@/services/authService";
import type { User } from "@/types/auth";

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  loadFromStorage: () => void;
}

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (value instanceof Set) {
    return Array.from(value).filter(
      (item): item is string => typeof item === "string",
    );
  }
  return [];
};

const normalizeRole = (role: string): string =>
  role.trim().toUpperCase().replace(/^ROLE_/, "");

const normalizeStoredUser = (
  storedUser: authService.StoredUser | null,
): User | null => {
  if (!storedUser || typeof storedUser !== "object") return null;

  const raw = storedUser as Record<string, unknown>;
  const roles = toArray(raw.roles).map(normalizeRole);

  return {
    id: String(raw.id ?? raw.userId ?? ""),
    userName: String(raw.userName ?? raw.username ?? ""),
    username: String(raw.username ?? raw.userName ?? ""),
    fullName: String(raw.fullName ?? ""),
    email: String(raw.email ?? ""),
    phone: typeof raw.phone === "string" ? raw.phone : undefined,
    address: typeof raw.address === "string" ? raw.address : undefined,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
    isEnabled: raw.isEnabled !== false,
    roles,
    permissions: toArray(raw.permissions),
    userRole: roles[0] ?? "GUEST",
  };
};

const getStoredAuthState = () => {
  const token = authService.getToken();
  const user = normalizeStoredUser(authService.getUser());

  return {
    user,
    token,
    refreshToken: localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN),
    isAuthenticated: Boolean(token && user),
    isInitialized: true,
  };
};

/**
 * Auth Store - Manage authentication state with Zustand
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      ...getStoredAuthState(),
      // Initial state
      isLoading: false,
      error: null,

      /**
       * Login action
       */
      login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.handleLogin(payload);

          if (response.success && response.data && response.token) {
            const user: User = {
              id: response.data.id || "",
              userName: response.data.userName || "",
              fullName: response.data.fullName || "",
              email: response.data.email || "",
              phone: response.data.phone,
              address: response.data.address,
              avatarUrl: response.data.avatarUrl,
              isEnabled: response.data.isEnabled ?? true,
              roles: (response.data.roles ?? []).map(normalizeRole),
              permissions: response.data.permissions ?? [],
              userRole: response.data.roles?.[0]
                ? normalizeRole(response.data.roles[0])
                : "GUEST",
            };

            authService.saveTokens(response.token, response.refreshToken);
            authService.saveUser(user as StoredUser);

            set({
              user,
              token: response.token,
              refreshToken: response.refreshToken || null,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              isInitialized: true,
              error: response.message || "Login failed",
            });
          }

          return response;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            isInitialized: true,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      /**
       * Register action
       */
      register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.handleRegister(payload);

          if (response.success) {
            // Registration might not return token
            const user = response.data
              ? {
                  id: response.data.id || "",
                  userName: response.data.userName || "",
                  fullName: response.data.fullName || "",
                  email: response.data.email || "",
                  phone: response.data.phone,
                  address: response.data.address,
                  avatarUrl: response.data.avatarUrl,
                  isEnabled: response.data.isEnabled ?? true,
                  roles: (response.data.roles ?? []).map(normalizeRole),
                  permissions: response.data.permissions ?? [],
                  userRole: response.data.roles?.[0]
                    ? normalizeRole(response.data.roles[0])
                    : "GUEST",
                }
              : null;

            if (response.token && user) {
              authService.saveTokens(response.token, response.refreshToken);
              authService.saveUser(user as StoredUser);
            }

            set({
              user,
              token: response.token || null,
              refreshToken: response.refreshToken || null,
              isAuthenticated: Boolean(response.token),
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              isInitialized: true,
              error: response.message || "Registration failed",
            });
          }

          return response;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({
            isLoading: false,
            isInitialized: true,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      /**
       * Logout action
       */
      logout: () => {
        authService.handleLogout();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
          error: null,
          isLoading: false,
        });
      },

      /**
       * Set user action
       */
      setUser: (user: User | null) => {
        if (user) {
          authService.saveUser(user as StoredUser);
        }
        set({ user });
      },

      /**
       * Set token action
       */
      setToken: (token: string | null) => {
        if (token) {
          authService.saveTokens(token);
        } else {
          authService.handleLogout();
        }
        set({
          token,
          isAuthenticated: token !== null,
        });
      },

      /**
       * Clear error action
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Load authentication data from localStorage on app startup
       */
      loadFromStorage: () => {
        const token = authService.getToken();
        const user = normalizeStoredUser(authService.getUser());

        if (token && user) {
          set({
            token,
            user,
            isAuthenticated: true,
            isInitialized: true,
          });
        } else {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: "auth-store", // for devtools
    },
  ),
);
