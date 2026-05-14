import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  faEnvelope,
  faCheckCircle,
  faShieldAlt,
  faKey,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoImage from "../../assets/images/logoWhite.png";
import Button from "../../components/common/Button";
import FloatingInput from "../../components/common/FloatingInput";
import CustomCaptcha from "../../components/common/CustomCaptcha";
import type { CustomCaptchaRef } from "../../components/common/CustomCaptcha";
import { validateEmailOrPhone, detectInputType } from "../../utils/validators";
import { sendOtpEmail } from "../../services/authService";
import { useToastContext } from "../../hooks/useToastContext";

type Step = "input" | "otp";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>("input");
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [identifierSuccess, setIdentifierSuccess] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [serverOtp, setServerOtp] = useState(""); // OTP thực từ backend
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const captchaRef = useRef<CustomCaptchaRef>(null);
  const navigate = useNavigate();
  const toast = useToastContext();

  // Real-time validation cho identifier
  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (value.trim()) {
      const error = validateEmailOrPhone(value);
      setIdentifierError(error);
      setIdentifierSuccess(!error);
    } else {
      setIdentifierError("");
      setIdentifierSuccess(false);
    }
  };

  // Bắt đầu countdown timer 60 giây
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Gửi OTP đến email/phone
  const doSendOtp = async (): Promise<boolean> => {
    setLoading(true);
    const result = await sendOtpEmail(identifier);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Failed to send OTP. Please try again.", { duration: 3000 });
      setIsCaptchaVerified(false);
      captchaRef.current?.refresh();
      return false;
    }

    // Lưu serverOtp để so sánh sau
    setServerOtp(result.otp || "");
    return true;
  };

  // Handle nút "Continue" ở step input
  const handleSendOTP = async () => {
    const idErr = validateEmailOrPhone(identifier);
    setIdentifierError(idErr);
    setIdentifierSuccess(!idErr);

    if (idErr) {
      setShakeKey((prev) => prev + 1);
      return;
    }

    if (!isCaptchaVerified) {
      setCaptchaError("Please enter the correct verification code");
      setShakeKey((prev) => prev + 1);
      return;
    }

    const ok = await doSendOtp();
    if (ok) {
      setStep("otp");
      startResendTimer();
      toast.success("Verification code sent! Please check your email.", { duration: 3000 });
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = pastedData.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);
    setOtpError("");

    // Focus vào ô cuối hoặc ô tiếp theo sau ký tự cuối cùng
    const focusIndex = Math.min(pastedData.length, 5);
    setTimeout(() => {
      document.getElementById(`otp-${focusIndex}`)?.focus();
    }, 0);
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP - so sánh với serverOtp
  const handleVerifyOtp = () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      setShakeKey((prev) => prev + 1);
      return;
    }

    // Kiểm tra OTP
    if (serverOtp && otpCode !== serverOtp) {
      setOtpError("Incorrect verification code. Please try again.");
      setShakeKey((prev) => prev + 1);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => document.getElementById("otp-0")?.focus(), 0);
      return;
    }

    // OTP đúng → navigate sang reset password
    navigate("/auth/reset-password", {
      state: {
        identifier,
        otpCode,
        verified: true,
      },
    });
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setOtp(["", "", "", "", "", ""]);
    setOtpError("");

    const ok = await doSendOtp();
    if (ok) {
      startResendTimer();
      toast.success("New verification code sent!", { duration: 2000 });
    }
  };

  // Step animations
  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logoImage} alt="Logo Vista" className="h-20 w-auto" />
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["input", "otp"].map((s, idx) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? "bg-[#c3923c] text-white scale-110 shadow-lg"
                    : ["input", "otp"].indexOf(step) > idx
                    ? "bg-green-500 text-white"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {["input", "otp"].indexOf(step) > idx ? (
                  <FontAwesomeIcon icon={faCheckCircle} />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 1 && (
                <div
                  className={`w-16 h-1 rounded transition-all ${
                    ["input", "otp"].indexOf(step) > idx
                      ? "bg-green-500"
                      : "bg-white/20"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Input Email + Captcha */}
          {step === "input" && (
            <motion.div
              key="input"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#c3923c]/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="text-3xl text-[#c3923c]"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-yellow-50 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-sm text-yellow-50/80">
                  Enter your email to receive a verification code
                </p>
              </div>

              {/* Email Input */}
              <div
                key={`identifier-${shakeKey}`}
                className={`min-h-[70px] ${
                  identifierError ? "animate-[shake_400ms_ease-in-out]" : ""
                }`}
              >
                <FloatingInput
                  label="Email or Phone"
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
                  textColor="text-white"
                  iconColor="text-white/80"
                  className="bg-transparent"
                />
                {identifierError && (
                  <p className="text-red-500 text-xs mt-1">{identifierError}</p>
                )}
                {identifierSuccess && !identifierError && (
                  <p className="text-green-500 text-xs mt-1">
                    ✓{" "}
                    {detectInputType(identifier) === "email"
                      ? "Email"
                      : "Phone"}{" "}
                    is valid
                  </p>
                )}
              </div>

              {/* Captcha */}
              <div
                key={`captcha-${shakeKey}`}
                className={`${captchaError ? "animate-[shake_400ms_ease-in-out]" : ""}`}
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

              {isCaptchaVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-[#00c853]/20 border border-[#00c853]/50 rounded-lg flex items-center gap-2 text-[#00c853] text-sm"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Verification successful!</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  text="Back to Login"
                  color="bg-white/10"
                  textColor="text-white"
                  size="lg"
                  rounded="md"
                  onClick={() => navigate("/auth/login")}
                  className="flex-1 font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
                />
                <Button
                  text={loading ? "Sending..." : "Send Code"}
                  color="bg-[#c3923c]"
                  textColor="text-white"
                  size="lg"
                  rounded="md"
                  onClick={handleSendOTP}
                  disabled={loading}
                  loading={loading}
                  className="flex-1 font-semibold hover:bg-[#b4893e] transition-colors"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#c3923c]/20 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="text-3xl text-[#c3923c]"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-yellow-50 mb-2">
                  Enter Verification Code
                </h1>
                <p className="text-sm text-yellow-50/80">
                  Verification code has been sent to{" "}
                  <span className="font-semibold text-[#c3923c]">
                    {identifier}
                  </span>
                </p>
              </div>

              {/* OTP Input */}
              <div
                key={`otp-${shakeKey}`}
                className={`flex justify-center gap-2 mb-2 ${
                  otpError ? "animate-[shake_400ms_ease-in-out]" : ""
                }`}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className={`w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 rounded-lg text-white focus:outline-none transition-all ${
                      otpError
                        ? "border-red-500 focus:border-red-500"
                        : digit
                        ? "border-[#c3923c] focus:border-[#c3923c]"
                        : "border-white/40 focus:border-[#c3923c]"
                    }`}
                  />
                ))}
              </div>

              {/* OTP Error */}
              {otpError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{otpError}</span>
                </motion.div>
              )}

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-white/60 text-sm">
                    Resend code in{" "}
                    <span className="font-bold text-[#c3923c]">
                      {resendTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#c3923c] hover:text-[#b4893e] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Didn't receive code? Resend"}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  text="Back"
                  color="bg-white/10"
                  textColor="text-white"
                  size="lg"
                  rounded="md"
                  onClick={() => {
                    setStep("input");
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                    setIsCaptchaVerified(false);
                    captchaRef.current?.refresh();
                  }}
                  className="flex-1 font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
                />
                <Button
                  text="Verify"
                  color="bg-[#c3923c]"
                  textColor="text-white"
                  size="lg"
                  rounded="md"
                  onClick={handleVerifyOtp}
                  disabled={otp.join("").length !== 6}
                  className="flex-1 font-semibold hover:bg-[#b4893e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ForgotPassword;
