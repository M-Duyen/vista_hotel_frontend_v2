/* eslint-disable */
import { api } from "./apiClient";
import { sendEmail } from "./emailService";
import {
  loginWelcomeBackEmail,
  registerSuccessEmail,
  otpEmailTemplate,
  passwordChangedTemplate,
} from "../utils/emailTemplates/authEmails";
import type { PasswordChangeRequest } from "../types/UserProfile";

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
  role?: string;
}

export interface RegisterData {
  userName: string;
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  address?: string;
  gender?: string;
  birthDate?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  refreshToken?: string;
}

export const handleLogin = async (
  payload: LoginData
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post("/auth/login", payload);

    // Kiểm tra response từ backend
    if (data.success === false) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    // Lưu tokens vào localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    if (data.data) {
      localStorage.setItem("user", JSON.stringify(data.data));
    }

    // Gửi email chào mừng khi đăng nhập thành công
    const user = data.data;
    if (user?.email) {
      const html = loginWelcomeBackEmail(
        user.fullName || user.userName || "Khách hàng"
      );
      sendEmail({
        to: user.email,
        subject: "Chào mừng bạn trở lại Vista Hotel",
        htmlContent: html,
      });
    }

    return {
      success: true,
      message: data.message || "Login successful!",
      data: data.data,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message:
        error.response?.data?.message || "Login failed. Please try again.",
    };
  }
};

export const handleRegister = async (
  payload: RegisterData
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post("/auth/register", payload);

    // Kiểm tra response từ backend
    if (data.success === false) {
      return {
        success: false,
        message: data.message || "Registration failed!",
      };
    }

    // Gửi email chào mừng sau khi đăng ký thành công
    const user = data.data;
    if (user?.email) {
      const html = registerSuccessEmail(
        user.fullName || user.userName || "Khách hàng"
      );
      sendEmail({
        to: user.email,
        subject: "Đăng ký Vista Hotel thành công",
        htmlContent: html,
      });
    }

    return {
      success: true,
      message: data.message || "Registration successful!",
      data: data.data ?? data,
    };
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Registration failed. Please try again.",
    };
  }
};

export const handleLogout = (): AuthResponse => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  return {
    success: true,
    message: "Logout successful!",
  };
};

export const validateToken = async (): Promise<AuthResponse> => {
  try {
    const { data } = await api.get("/auth/validate");
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
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return {
        success: false,
        message: "Refresh token not found",
      };
    }

    const { data } = await api.post(
      "/auth/refresh-token",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
      }
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
 * Backend endpoint: POST /auth/change-password
 * Request body: { userId, currentPassword, newPassword }
 */
export const changePassword = async (
  userId: string,
  data: PasswordChangeRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(`/auth/change-password`, {
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    // Nếu đổi mật khẩu thành công và user đang login → gửi email
    const userRaw = localStorage.getItem("user");
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
      error?.response?.data?.message || "Failed to change password"
    );
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await api.post("/auth/reset-password", {
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
  identifier: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data } = await api.post("/auth/send-otp", { email: identifier });

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
  refreshToken?: string
) => {
  localStorage.setItem("token", token);

  // decode & parse JSON
  const decodedUserJson = decodeURIComponent(userJson);
  const userObj = JSON.parse(decodedUserJson);

  localStorage.setItem("user", JSON.stringify(userObj));

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};
