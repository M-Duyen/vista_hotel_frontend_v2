import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";
import type { PasswordChangeRequest } from "../../types/UserProfile";
import { useToastContext } from "../../hooks/useToastContext";
import {
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validators";

interface PasswordChangeSectionProps {
  onChangePassword: (data: PasswordChangeRequest) => Promise<void>;
}

const PasswordChangeSection: React.FC<PasswordChangeSectionProps> = ({
  onChangePassword,
}) => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<PasswordChangeRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Realtime validation for current password
  const validateCurrentPassword = (value: string) => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is required",
      }));
    } else {
      setErrors((prev) => {
        const { currentPassword, ...rest } = prev;
        return rest;
      });
    }
  };

  // Realtime validation for new password
  const validateNewPassword = (value: string) => {
    const error = validatePassword(value);
    if (error) {
      setErrors((prev) => ({ ...prev, newPassword: error }));
    } else {
      setErrors((prev) => {
        const { newPassword, ...rest } = prev;
        return rest;
      });
    }
    // Also re-validate confirm password if it has a value
    if (formData.confirmPassword) {
      const confirmError = validateConfirmPassword(
        value,
        formData.confirmPassword
      );
      if (confirmError) {
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      } else {
        setErrors((prev) => {
          const { confirmPassword, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  // Realtime validation for confirm password
  const validateConfirmPasswordField = (value: string) => {
    const error = validateConfirmPassword(formData.newPassword, value);
    if (error) {
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    } else {
      setErrors((prev) => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    const newPasswordError = validatePassword(formData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }

    const confirmPasswordError = validateConfirmPassword(
      formData.newPassword,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await onChangePassword(formData);
      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to change password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-cream p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <FaLock className="text-[#ccbda3] text-2xl" />
        <h2 className="text-2xl font-bold text-[#ccbda3]">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, currentPassword: value });
                validateCurrentPassword(value);
              }}
              onBlur={(e) => validateCurrentPassword(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  current: !showPasswords.current,
                })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, newPassword: value });
                validateNewPassword(value);
              }}
              onBlur={(e) => validateNewPassword(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, new: !showPasswords.new })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, confirmPassword: value });
                validateConfirmPasswordField(value);
              }}
              onBlur={(e) => validateConfirmPasswordField(e.target.value)}
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({
                  ...showPasswords,
                  confirm: !showPasswords.confirm,
                })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#ccbda3] text-white rounded-lg hover:bg-[#b3a68f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-semibold cursor-pointer"
        >
          <FaSave />
          {loading ? "Processing..." : "Change Password"}
        </button>
      </form>
    </motion.div>
  );
};

export default PasswordChangeSection;
