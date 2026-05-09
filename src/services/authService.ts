/* eslint-disable */
import { authApi } from "./apiClient";
import { API_CONFIG } from "@/config/api.config";
import { sendEmail } from "./emailService";
import {
  loginWelcomeBackEmail,
  registerSuccessEmail,
  otpEmailTemplate,
  passwordChangedTemplate,
} from "../utils/emailTemplates/authEmails";
import type { PasswordChangeRequest } from "../types/UserProfile";

export type StoredUser = AuthResponse["data"] | Record<string, unknown>;

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
};

export interface LoginPayload {
  email?: string;
  phone?: string;
  userName?: string;
  password: string;
}

interface BackendLoginPayload {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface BackendRegisterPayload {
  username: string;
  fullName: string;
  password: string;
  email: string;
  phone: string;
}

interface BackendAuthResponse {
  token?: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  message?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    userRole: string;
    avatarUrl: string;
  };
  token?: string;
  refreshToken?: string;
}

const toAuthResponse = (
  payload: BackendAuthResponse,
  fallbackMessage: string,
): AuthResponse => {
  const hasUserProfile = Boolean(
    payload.userId ||
    payload.username ||
    payload.email ||
    payload.phone ||
    payload.fullName,
  );

  return {
    success: true,
    message: payload.message || fallbackMessage,
    token: payload.token,
    refreshToken: payload.refreshToken,
    data: hasUserProfile
      ? {
          id: payload.userId || "",
          userName: payload.username || "",
          fullName: payload.fullName || "",
          email: payload.email || "",
          phone: payload.phone || "",
          address: "",
          userRole: "",
          avatarUrl: "",
        }
      : undefined,
  };
};

/**
 * Login user
 */
export const handleLogin = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  try {
    const requestBody: BackendLoginPayload = {
      username: payload.userName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    };

    const response = await authApi.post<BackendAuthResponse>(
      "/login",
      requestBody,
    );

    const authResponse = toAuthResponse(response.data, "Login successfully");

    // Gửi email chào mừng khi đăng nhập thành công
    if (authResponse.data?.email) {
      const html = loginWelcomeBackEmail(
        authResponse.data.fullName ||
          authResponse.data.userName ||
          "Khách hàng",
      );
      sendEmail({
        to: authResponse.data.email,
        subject: "Chào mừng bạn trở lại Vista Hotel",
        htmlContent: html,
      });
    }

    return authResponse;
  } catch (err: unknown) {
    return {
      success: false,
      message: extractErrorMessage(err, "Login failed. Please try again."),
    };
  }
};

/**
 * Register user
 */
export const handleRegister = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  try {
    if (
      !payload.userName ||
      !payload.fullName ||
      !payload.password ||
      !payload.email ||
      !payload.phone
    ) {
      return {
        success: false,
        message: "Username, full name, password, email, and phone are required.",
      };
    }

    const requestBody: BackendRegisterPayload = {
      username: payload.userName,
      fullName: payload.fullName,
      password: payload.password,
      email: payload.email,
      phone: payload.phone,
    };

    const response = await authApi.post<BackendAuthResponse>(
      "/register",
      requestBody,
    );

    const authResponse = toAuthResponse(response.data, "Register successfully");

    // Gửi email chào mừng sau khi đăng ký thành công
    if (authResponse.data?.email) {
      const html = registerSuccessEmail(
        authResponse.data.fullName ||
          authResponse.data.userName ||
          "Khách hàng",
      );
      sendEmail({
        to: authResponse.data.email,
        subject: "Đăng ký Vista Hotel thành công",
        htmlContent: html,
      });
    }

    return authResponse;
  } catch (error: unknown) {
    return {
      success: false,
      message: extractErrorMessage(
        error,
        "Registration failed. Please try again.",
      ),
    };
  }
};

/**
 * Save token to localStorage
 */
export const saveTokens = (token: string, refreshToken?: string) => {
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, token);
  if (refreshToken) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
};

/**
 * Save user to localStorage
 */
export const saveUser = (user: StoredUser) => {
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * Get stored token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
};

/**
 * Get stored user
 */
export const getUser = (): StoredUser | null => {
  const user = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
  return user ? (JSON.parse(user) as StoredUser) : null;
};

/**
 * Logout
 */
export const handleLogout = () => {
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const validateToken = async (): Promise<AuthResponse> => {
  try {
    const { data } = await authApi.get("/validate");
    return data;
  } catch (err: unknown) {
    return {
      success: false,
      message: "Token is invalid or has expired",
    };
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const token = getToken();
    if (!token) {
      return {
        success: false,
        message: "Token not found",
      };
    }

    const { data } = await authApi.post(
      "/refresh-token",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (err: unknown) {
    return {
      success: false,
      message: "Unable to refresh token",
    };
  }
};

/**
 * Đổi mật khẩu người dùng
 * Backend endpoint: POST /api/auth/change-password
 * Request body: { userId, currentPassword, newPassword }
 */
export const changePassword = async (
  userId: string,
  data: PasswordChangeRequest,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await authApi.post(`/change-password`, {
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    // Nếu đổi mật khẩu thành công và user đang login → gửi email
    const userRaw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
    if (response.data.success && userRaw) {
      const user = JSON.parse(userRaw);
      if (user.email) {
        const html = passwordChangedTemplate(user.fullName ?? "Khách hàng");

        await sendEmail({
          to: user.email,
          subject: "Vista Hotel - Mật khẩu đã thay đổi",
          htmlContent: html,
        });
      }
    }

    return {
      success: response.data.success,
      message: response.data.message || "Password changed successfully!",
    };
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to change password",
    );
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await authApi.post("/reset-password", {
      email,
      newPassword,
    });

    // Nếu reset thành công thì gửi email thông báo
    if (data.success) {
      const html = passwordChangedTemplate("Khách hàng");

      await sendEmail({
        to: email,
        subject: "Vista Hotel - Mật khẩu đã được đặt lại",
        htmlContent: html,
      });
    }

    return {
      success: data.success,
      message:
        data.message ||
        (data.success
          ? "Password reset successfully!"
          : "Password reset failed"),
    };
  } catch (error: any) {
    console.error("Error reset password:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Reset password failed. Please try again.",
    };
  }
};

export const sendOtpEmail = async (
  identifier: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await authApi.post("/send-otp", {
      email: identifier,
    });

    if (!data.success) {
      return {
        success: false,
        message: data.message || "Failed to send OTP email.",
      };
    }

    const otp = data.otp;

    await sendEmail({
      to: identifier,
      subject: "Vista Hotel - Mã xác thực OTP của bạn",
      htmlContent: otpEmailTemplate(otp),
    });

    return {
      success: true,
      message: "OTP email sent successfully.",
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return {
      success: false,
      message: "Failed to send OTP email. Please try again.",
    };
  }
};

export const handleOAuthSuccess = (
  token: string,
  userJson: string,
  refreshToken?: string,
) => {
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, token);

  // decode & parse JSON
  const decodedUserJson = decodeURIComponent(userJson);
  const userObj = JSON.parse(decodedUserJson);

  localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(userObj));

  if (refreshToken) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
};
