import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveTokens, saveUser } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { useToastContext } from "../../hooks/useToastContext";
import type { User } from "../../types/auth";
import { sendEmail } from "../../services/emailService";
import { loginWelcomeBackEmail } from "../../utils/emailTemplates/authEmails";
import { getDefaultRouteForRoles } from "../../utils/authRedirect";

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { loadFromStorage } = useAuthStore();
  const toast = useToastContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const rawUser = params.get("user");
    const userJson = rawUser ? decodeURIComponent(rawUser) : null;

    if (token && userJson) {
      try {
        // Decode lần nữa nếu cần (backend có thể encode 2 lần)
        let parsedUser: User;
        try {
          parsedUser = JSON.parse(decodeURIComponent(userJson)) as User;
        } catch {
          parsedUser = JSON.parse(userJson) as User;
        }

        // Lưu token và user vào localStorage
        saveTokens(token, refreshToken || undefined);
        saveUser(parsedUser);

        // Đồng bộ lại Zustand store (giống như đăng nhập bình thường)
        loadFromStorage();

        // Gửi email chào mừng (bất đồng bộ, không block)
        const displayName =
          parsedUser.fullName || parsedUser.userName || parsedUser.username || "Khách hàng";
        if (parsedUser.email) {
          sendEmail({
            to: parsedUser.email,
            subject: "Chào mừng bạn trở lại Vista Hotel",
            htmlContent: loginWelcomeBackEmail(displayName),
          }).catch(() => {
            // Lỗi gửi email không block luồng đăng nhập
          });
        }

        // Hiển thị toast thành công giống Login.tsx
        toast.success("Login successful!", { duration: 2000 });
        const redirectTo = getDefaultRouteForRoles(
          parsedUser.roles,
          parsedUser.userRole,
        );

        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 1000);
      } catch (err) {
        console.error("OAuth parse error:", err);
        toast.error("Login failed. Please try again.");
        navigate("/auth/login");
      }
    } else {
      toast.error("OAuth login failed. No token received.");
      navigate("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#c3923c] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white text-lg font-medium">Đang đăng nhập...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
