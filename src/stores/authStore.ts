import { create } from "zustand";
import { devtools } from "zustand/middleware";
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

const getClaimsFromToken = (token?: string) => {
  try {
    const payload = token?.split(".")[1];
    if (!payload) return { roles: [], permissions: [] };

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return {
      roles: Array.isArray(decodedPayload.roles) ? decodedPayload.roles : [],
      permissions: Array.isArray(decodedPayload.permissions)
        ? decodedPayload.permissions
        : [],
    };
  } catch (error) {
    console.error("Error parsing token claims:", error);
    return { roles: [], permissions: [] };
  }
};

/**
 * Auth Store - Manage authentication state with Zustand
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      /**
       * Login action
       */
      login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.handleLogin(payload);

          if (response.success && response.data && response.token) {
            const tokenClaims = getClaimsFromToken(response.token);
            const user: User = {
              id: response.data.id || "",
              userName: response.data.userName || "",
              fullName: response.data.fullName || "",
              email: response.data.email || "",
              phone: response.data.phone,
              address: response.data.address,
              avatarUrl: response.data.avatarUrl,
              isEnabled: true,
              roles: tokenClaims.roles,
              permissions: tokenClaims.permissions,
              userRole: response.data.userRole || tokenClaims.roles[0] || "",
            };

            authService.saveTokens(response.token, response.refreshToken);
            authService.saveUser(user as StoredUser);

            void import("@/services/notificationApiService")
              .then(({ notificationApiService }) =>
                notificationApiService.createNotification({
                  type: "INFO",
                  category: "OTHER",
                  title: "Vista Hotel xin chào",
                  message: `Xin chào ${user.fullName || user.userName}, chúc bạn có một trải nghiệm tuyệt vời tại Vista Hotel.`,
                  toUserId: user.id,
                  toUserType: user.userRole?.includes("EMPLOYEE")
                    ? "EMPLOYEE"
                    : user.userRole?.includes("ADMIN")
                      ? "ADMIN"
                      : "CUSTOMER",
                  priority: "NORMAL",
                  needsAction: false,
                  status: "SENT",
                  isRealtime: true,
                  isRead: false,
                  dataJson: JSON.stringify({
                    eventType: "LOGIN_WELCOME",
                    loggedInAt: new Date().toISOString(),
                  }),
                }),
              )
              .catch((error) =>
                console.warn("Could not create login notification:", error),
              );

            set({
              user,
              token: response.token,
              refreshToken: response.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || "Login failed",
            });
          }

          return response;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
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
            const tokenClaims = getClaimsFromToken(response.token);
            const user = response.data
              ? {
                  id: response.data.id || "",
                  userName: response.data.userName || "",
                  fullName: response.data.fullName || "",
                  email: response.data.email || "",
                  phone: response.data.phone,
                  address: response.data.address,
                  avatarUrl: response.data.avatarUrl,
                  isEnabled: true,
                  roles: tokenClaims.roles,
                  permissions: tokenClaims.permissions,
                  userRole: response.data.userRole || tokenClaims.roles[0] || "",
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
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || "Registration failed",
            });
          }

          return response;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({
            isLoading: false,
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
        const user = authService.getUser();

        if (token && user) {
          set({
            token,
            user: user as User,
            isAuthenticated: true,
          });
        } else {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-store", // for devtools
    },
  ),
);
