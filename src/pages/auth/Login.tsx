import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import logoImage from "../../assets/images/logoWhite.png";
import googleLogo from "../../assets/images/google-logo.svg";
import Button from "../../components/common/Button";
import FloatingInput from "../../components/common/FloatingInput";
import CustomCaptcha from "../../components/common/CustomCaptcha";
import type { CustomCaptchaRef } from "../../components/common/CustomCaptcha";
import { useAuth } from "../../hooks/useAuth";
import {
  validateEmailOrPhoneOrUsername,
  validatePasswordCombined,
  detectInputType,
} from "../../utils/validators";
import { useToastContext } from "../../hooks/useToastContext";
import { getDefaultRouteForRoles } from "../../utils/authRedirect";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState(""); // Email hoặc phone
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [identifierSuccess, setIdentifierSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef<CustomCaptchaRef>(null);
  const navigate = useNavigate();
  const toast = useToastContext();

  // Real-time validation cho identifier
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (value.trim()) {
      const error = validateEmailOrPhoneOrUsername(value);
      setIdentifierError(error);
      setIdentifierSuccess(!error);
    } else {
      setIdentifierError("");
      setIdentifierSuccess(false);
    }
  };

  // Real-time validation for password
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.trim()) {
      const error = validatePasswordCombined(value);
      setPasswordError(error);
      setPasswordSuccess(!error);
    } else {
      setPasswordError("");
      setPasswordSuccess(false);
    }
  };

  // Xử lý submit form đăng nhập
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate identifier
    const idErr = validateEmailOrPhoneOrUsername(identifier);
    setIdentifierError(idErr);
    setIdentifierSuccess(!idErr);

    // Validate password (check password strength)
    const pwErr = validatePasswordCombined(password);
    setPasswordError(pwErr);
    setPasswordSuccess(!pwErr);

    // Validate captcha
    if (!isCaptchaVerified) {
      setCaptchaError("Please enter the correct verification code");
      setShakeKey((prev) => prev + 1);
      return;
    }

    // Nếu có lỗi validation
    if (idErr || pwErr) {
      setShakeKey((prev) => prev + 1); // Trigger shake animation
      return;
    }

    setLoading(true);

    // Kiểm tra xem email, phone hay username và gửi payload tương ứng
    const inputType = detectInputType(identifier.trim());
    const loginPayload: {
      email?: string;
      phone?: string;
      userName?: string;
      password: string;
    } = {
      password,
    };

    if (inputType === "email") {
      loginPayload.email = identifier.trim();
    } else if (inputType === "phone") {
      loginPayload.phone = identifier.trim();
    } else if (inputType === "username") {
      loginPayload.userName = identifier.trim();
    }

    const res = await login(loginPayload);
    setLoading(false);

    if (res.success) {
      toast.success("Login successful!", { duration: 2000 });
      const redirectTo = getDefaultRouteForRoles(
        res.data?.roles,
        res.data?.userRole,
      );

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);
    } else {
      // Phân biệt các loại lỗi dựa vào error message từ backend
      const errorMessage = res.message.toLowerCase();
      
      if (errorMessage.includes("account not found")) {
        // Lỗi tài khoản không tồn tại
        setIdentifierError("Account not found");
        setIdentifierSuccess(false);
        setPasswordError("");
        setPasswordSuccess(false);
        toast.error("Account not found. Please check your email, phone or username.", { duration: 3000 });
      } else if (errorMessage.includes("password is incorrect")) {
        // Lỗi mật khẩu sai
        setPasswordError("Password is incorrect");
        setPasswordSuccess(false);
        setIdentifierError("");
        setIdentifierSuccess(true);
        toast.error("Password is incorrect. Please try again.", { duration: 3000 });
      } else if (errorMessage.includes("invalid credentials") || errorMessage.includes("check your credentials")) {
        // Lỗi không rõ (có thể sai cả tài khoản và mật khẩu)
        setIdentifierError("Invalid credentials");
        setPasswordError("Invalid credentials");
        setIdentifierSuccess(false);
        setPasswordSuccess(false);
        toast.error("Invalid email, phone, username or password.", { duration: 3000 });
      } else {
        // Lỗi khác
        setPasswordError(res.message);
        setPasswordSuccess(false);
        setIdentifierError("");
        setIdentifierSuccess(false);
        toast.error(res.message, { duration: 3000 });
      }
      
      setIsCaptchaVerified(false);
      // Tự động refresh captcha khi đăng nhập thất bại
      captchaRef.current?.refresh();
    }
  };

  // Chuyển đến quên mật khẩu
  const handleForgotPassword = () => navigate("/auth/forgot-password");

  // Chuyển đến đăng ký
  const handleRegister = () => navigate("/auth/register");

  const handleGoogleLogin = () => {
    // Trỏ thẳng đến service-auth (bypass gateway)
    // vì OAuth2 cần session state - không thể proxy qua reactive gateway
    const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL || import.meta.env.VITE_API_GATEWAY_URL;
    window.location.href = `${authUrl}/oauth2/authorization/google`;
  };

  const handleFacebookLogin = () => {
    const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL || import.meta.env.VITE_API_GATEWAY_URL;
    window.location.href = `${authUrl}/oauth2/authorization/facebook`;
  };

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col space-y-4">
        <div className="flex justify-center mb-2">
          <img src={logoImage} alt="Logo Vista" className="h-20 w-auto" />
        </div>

        <div className="text-center mb-3">
          <h1 className="text-[30px] font-bold text-yellow-50 mb-2">Login</h1>
          <p className="text-sm text-yellow-50">Welcome back to Vista Hotel</p>
        </div>

        {/* Email hoặc Số điện thoại  */}
        <div
          key={`identifier-${shakeKey}`}
          className={`min-h-[70px] mt-5 ${
            identifierError ? "animate-[shake_400ms_ease-in-out]" : ""
          }`}
        >
          <FloatingInput
            label="Email, Phone or Username"
            type="text"
            value={identifier}
            onChange={handleIdentifierChange}
            iconLeft={faEnvelope}
            size="md"
            borderColor={
              identifierError
                ? "border-red-500"
                : identifierSuccess
                  ? "border-green-500"
                  : "border-white/40"
            }
            focusBorderColor={
              identifierError
                ? "focus:border-red-500"
                : identifierSuccess
                  ? "focus:border-green-500"
                  : "focus:border-[#c3923c]"
            }
            labelColor={
              identifierError
                ? "text-red-500"
                : identifierSuccess
                  ? "text-green-500"
                  : "text-white/80"
            }
            focusLabelColor={
              identifierError
                ? "text-red-500"
                : identifierSuccess
                  ? "text-green-500"
                  : "text-[#c3923c]"
            }
            iconColor="text-white"
            eyeIconColor="text-white"
            className="bg-transparent text-white"
          />
          {identifierError && (
            <p className="text-red-500 text-xs mt-1">{identifierError}</p>
          )}
          {identifierSuccess && !identifierError && (
            <p className="text-green-500 text-xs mt-1">
              ✓{" "}
              {detectInputType(identifier) === "email"
                ? "Email"
                : detectInputType(identifier) === "phone"
                  ? "Phone"
                  : "Username"}{" "}
              is valid
            </p>
          )}
        </div>

        {/* Mật khẩu  */}
        <div
          key={`password-${shakeKey}`}
          className={`min-h-[70px] ${
            passwordError ? "animate-[shake_400ms_ease-in-out]" : ""
          }`}
        >
          <FloatingInput
            label="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            iconLeft={faLock}
            size="md"
            borderColor={
              passwordError
                ? "border-red-500"
                : passwordSuccess
                  ? "border-green-500"
                  : "border-white/40"
            }
            focusBorderColor={
              passwordError
                ? "focus:border-red-500"
                : passwordSuccess
                  ? "focus:border-green-500"
                  : "focus:border-[#c3923c]"
            }
            labelColor={
              passwordError
                ? "text-red-500"
                : passwordSuccess
                  ? "text-green-500"
                  : "text-white/80"
            }
            focusLabelColor={
              passwordError
                ? "text-red-500"
                : passwordSuccess
                  ? "text-green-500"
                  : "text-[#c3923c]"
            }
            iconColor="text-white"
            eyeIconColor="text-white"
            className="bg-transparent text-white"
          />
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">{passwordError}</p>
          )}
          {passwordSuccess && !passwordError && (
            <p className="text-green-500 text-xs mt-1">✓ Password is valid</p>
          )}
        </div>

        {/* Captcha */}
        <div
          key={`captcha-${shakeKey}`}
          className={`min-h-[100px] ${
            captchaError ? "animate-[shake_400ms_ease-in-out]" : ""
          }`}
        >
          <CustomCaptcha
            ref={captchaRef}
            onVerify={(isValid) => {
              setIsCaptchaVerified(isValid);
              if (isValid) setCaptchaError("");
            }}
            autoRefreshMinutes={2}
            className="my-2"
          />
          {captchaError && (
            <p className="text-red-500 text-xs mt-1">{captchaError}</p>
          )}
        </div>

        {/* Quên mật khẩu? */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-[#eab354] hover:text-[#c3923c] text-sm font-medium transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Button đăng nhập */}
        <Button
          text={loading ? "Logging in..." : "Login"}
          color="bg-[#c3923c]"
          textColor="text-white"
          size="lg"
          rounded="md"
          fullWidth
          shadow
          type="submit"
          disabled={loading}
          className="font-semibold hover:bg-[#b4893e] transition-all"
          loading={loading}
        />

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-white/30" />
          <span className="text-white/70 text-xs">Or continue with</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>
        {/* Đăng nhập với mạng xã hội  */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-white/50 rounded-md text-white font-medium text-sm hover:border-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <img src={googleLogo} alt="Google" className="w-5 h-5" />
            Google
          </button>
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-white/50 rounded-md text-white font-medium text-sm hover:border-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
            </svg>
            Facebook
          </button>
        </div>

        {/* Chuyển đến đăng ký */}
        <p className="text-center text-xs text-white/70 leading-relaxed">
          By logging in, you agree to our{" "}
          <a
            href="#"
            className="text-[#eab354] hover:text-[#c3923c] hover:underline font-medium"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-[#eab354] hover:text-[#c3923c] hover:underline font-medium"
          >
            Privacy Policy
          </a>
        </p>

        {/* Chuyển đến đăng ký  */}
        <p className="text-center text-sm text-white/80">
          Not a member yet?{" "}
          <button
            type="button"
            onClick={handleRegister}
            className="text-[#eab354] hover:text-[#c3923c] font-semibold transition-colors cursor-pointer"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
