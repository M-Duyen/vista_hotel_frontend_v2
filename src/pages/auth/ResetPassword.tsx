import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { faLock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoImage from "../../assets/images/logoWhite.png";
import Button from "../../components/common/Button";
import FloatingInput from "../../components/common/FloatingInput";
import { validatePasswordCombined } from "../../utils/validators";
import { resetPassword } from "../../services/authService";
import { useToastContext } from "../../hooks/useToastContext";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [newPasswordSuccess, setNewPasswordSuccess] = useState(false);
  const [confirmPasswordSuccess, setConfirmPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();

  // Lấy thông tin từ Forgot Password
  const state = (location.state as {
    verified?: boolean;
    identifier?: string;
    otpCode?: string;
  }) || { verified: false };

  const emailFromForgot = state.identifier;

  // Kiểm tra xem người dùng có đến từ xác minh OTP không
  useEffect(() => {
    if (!state?.verified) {
      navigate("/auth/forgot-password", { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Real-time validation for new password
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value) {
      const error = validatePasswordCombined(value);
      setNewPasswordError(error);
      setNewPasswordSuccess(!error);

      // Re-validate confirm password if it has value
      if (confirmPassword) {
        if (value !== confirmPassword) {
          setConfirmPasswordError("Password confirmation does not match");
          setConfirmPasswordSuccess(false);
        } else {
          setConfirmPasswordError("");
          setConfirmPasswordSuccess(true);
        }
      }
    } else {
      setNewPasswordError("");
      setNewPasswordSuccess(false);
    }
  };

  // Real-time validation for confirm password
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value) {
      if (value !== newPassword) {
        setConfirmPasswordError("Password confirmation does not match");
        setConfirmPasswordSuccess(false);
      } else {
        setConfirmPasswordError("");
        setConfirmPasswordSuccess(true);
      }
    } else {
      setConfirmPasswordError("");
      setConfirmPasswordSuccess(false);
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newPwErr = validatePasswordCombined(newPassword);
    const confirmPwErr =
      newPassword !== confirmPassword
        ? "Password confirmation does not match"
        : "";

    setNewPasswordError(newPwErr);
    setConfirmPasswordError(confirmPwErr);
    setNewPasswordSuccess(!newPwErr);
    setConfirmPasswordSuccess(!confirmPwErr);

    if (newPwErr || confirmPwErr) {
      setShakeKey((prev) => prev + 1);
      return;
    }

    if (!emailFromForgot) {
      toast.error("Email information not found. Please try again from the beginning.");
      navigate("/auth/forgot-password", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(emailFromForgot, newPassword);

      if (!result.success) {
        throw new Error(result.message);
      }

      setLoading(false);
      setShowSuccess(true);

      // Email thông báo được gửi bên trong resetPassword() (authService.ts)
      // Redirect về login sau 2.5 giây
      setTimeout(() => {
        navigate("/auth/login");
      }, 2500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Reset password failed:", error);
      setLoading(false);
      toast.error(error?.message || "Unable to reset password. Please try again.", { duration: 4000 });
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { label: "", color: "", width: "0%" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    switch (strength) {
      case 1:
        return { label: "Weak", color: "bg-red-500", width: "25%" };
      case 2:
        return { label: "Medium", color: "bg-yellow-500", width: "50%" };
      case 3:
        return { label: "Good", color: "bg-blue-500", width: "75%" };
      case 4:
        return { label: "Strong", color: "bg-green-500", width: "100%" };
      default:
        return { label: "", color: "", width: "0%" };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Success screen
  if (showSuccess) {
    return (
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6 py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-5xl text-white"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold text-white">Password Reset!</h1>
            <p className="text-white/80">
              Your password has been reset successfully.
            </p>
            <p className="text-white/60 text-sm">
              A confirmation email has been sent to{" "}
              <span className="text-[#c3923c] font-medium">{emailFromForgot}</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center w-full"
          >
            <p className="text-white/80 text-sm">
              Redirecting to login page...
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-[#eab354] rounded-full animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 bg-[#eab354] rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 bg-[#eab354] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </motion.div>

          <Button
            text="Go to Login Page"
            color="bg-[#c3923c]"
            textColor="text-white"
            size="lg"
            rounded="md"
            onClick={() => navigate("/auth/login")}
            className="font-semibold hover:bg-[#eab354] transition-colors"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoImage} alt="Logo Vista" className="h-24 w-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-yellow-50 mb-2">
            Reset Password
          </h1>
          <p className="text-sm text-yellow-50/80">
            Create a new password for{" "}
            <span className="text-[#c3923c] font-medium">{emailFromForgot}</span>
          </p>
        </div>

        {/* New Password */}
        <div
          key={`newPassword-${shakeKey}`}
          className={`min-h-[90px] ${
            newPasswordError ? "animate-[shake_400ms_ease-in-out]" : ""
          }`}
        >
          <FloatingInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            iconLeft={faLock}
            size="md"
            borderColor={
              newPasswordError
                ? "border-red-500"
                : newPasswordSuccess
                ? "border-green-500"
                : "border-white/40"
            }
            focusBorderColor={
              newPasswordError
                ? "focus:border-red-500"
                : newPasswordSuccess
                ? "focus:border-green-500"
                : "focus:border-[#c3923c]"
            }
            labelColor={
              newPasswordError
                ? "text-red-500"
                : newPasswordSuccess
                ? "text-green-500"
                : "text-white/80"
            }
            focusLabelColor={
              newPasswordError
                ? "text-red-500"
                : newPasswordSuccess
                ? "text-green-500"
                : "text-[#c3923c]"
            }
            textColor="text-white"
            iconColor="text-white/80"
            className="bg-transparent"
          />

          {/* Password Strength Indicator */}
          {newPassword && !newPasswordError && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Password strength:</span>
                <span
                  className={`font-medium ${passwordStrength.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${passwordStrength.color} rounded-full`}
                />
              </div>
            </div>
          )}

          {newPasswordError && (
            <p className="text-red-500 text-xs mt-1">{newPasswordError}</p>
          )}
          {newPasswordSuccess && !newPasswordError && (
            <p className="text-green-500 text-xs mt-1">✓ Password is valid</p>
          )}
        </div>

        {/* Confirm Password */}
        <div
          key={`confirmPassword-${shakeKey}`}
          className={`min-h-[70px] ${
            confirmPasswordError ? "animate-[shake_400ms_ease-in-out]" : ""
          }`}
        >
          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            iconLeft={faLock}
            size="md"
            borderColor={
              confirmPasswordError
                ? "border-red-500"
                : confirmPasswordSuccess
                ? "border-green-500"
                : "border-white/40"
            }
            focusBorderColor={
              confirmPasswordError
                ? "focus:border-red-500"
                : confirmPasswordSuccess
                ? "focus:border-green-500"
                : "focus:border-[#c3923c]"
            }
            labelColor={
              confirmPasswordError
                ? "text-red-500"
                : confirmPasswordSuccess
                ? "text-green-500"
                : "text-white/80"
            }
            focusLabelColor={
              confirmPasswordError
                ? "text-red-500"
                : confirmPasswordSuccess
                ? "text-green-500"
                : "text-[#c3923c]"
            }
            textColor="text-white"
            iconColor="text-white/80"
            className="bg-transparent"
          />
          {confirmPasswordError && (
            <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>
          )}
          {confirmPasswordSuccess && !confirmPasswordError && (
            <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <p className="text-white/80 text-xs font-medium mb-2">
            Password must have:
          </p>
          <ul className="space-y-1 text-xs text-white/60">
            <li className="flex items-center gap-2">
              <span
                className={
                  newPassword.length >= 8 ? "text-green-400" : "text-white/40"
                }
              >
                {newPassword.length >= 8 ? "✓" : "○"}
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
                    ? "text-green-400"
                    : "text-white/40"
                }
              >
                {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
                  ? "✓"
                  : "○"}
              </span>
              Uppercase and lowercase letters
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  /\d/.test(newPassword) ? "text-green-400" : "text-white/40"
                }
              >
                {/\d/.test(newPassword) ? "✓" : "○"}
              </span>
              At least 1 digit
            </li>
            <li className="flex items-center gap-2">
              <span
                className={
                  /[^a-zA-Z0-9]/.test(newPassword)
                    ? "text-green-400"
                    : "text-white/40"
                }
              >
                {/[^a-zA-Z0-9]/.test(newPassword) ? "✓" : "○"}
              </span>
              At least 1 special character
            </li>
          </ul>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <Button
            text="Back"
            color="bg-white/10"
            textColor="text-white"
            size="lg"
            rounded="md"
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="flex-1 font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
          />
          <Button
            text={loading ? "Resetting..." : "Reset Password"}
            color="bg-[#c3923c]"
            textColor="text-white"
            size="lg"
            rounded="md"
            type="submit"
            disabled={loading}
            loading={loading}
            className="flex-1 font-semibold hover:bg-[#b4893e] transition-colors"
          />
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
