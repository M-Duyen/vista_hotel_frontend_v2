import React, { useId, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface FloatingInputProps {
  label: string;
  id?: string;
  type?: string;
  value?: string; // nếu truyền => controlled
  defaultValue?: string; // nếu không truyền value => uncontrolled
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  borderColor?: string;
  focusBorderColor?: string;
  labelColor?: string;
  focusLabelColor?: string;
  textColor?: string;
  iconColor?: string;
  eyeIconColor?: string;
  iconLeft?: IconDefinition;
  disabled?: boolean;
  className?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  id,
  type = "text",
  value, // ← không default = "" nữa
  defaultValue = "",
  onChange,
  size = "md",
  borderColor = "border-gray-300",
  focusBorderColor = "focus:border-blue-600",
  labelColor = "text-gray-500",
  focusLabelColor = "text-blue-600",
  textColor = "text-gray-100",
  iconColor = "text-gray-600",
  eyeIconColor = "text-gray-100",
  iconLeft,
  disabled = false,
  className = "",
}) => {
  const autoId = useId();
  const inputId = id ?? `fi-${autoId}`;

  // Uncontrolled internal state
  const [innerValue, setInnerValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : innerValue;

  const [focused, setFocused] = useState(false);
  const active = focused || currentValue.length > 0;

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  const sizePad = size === "sm" ? "py-1.5" : size === "lg" ? "py-3" : "py-2";
  const leftPadding = iconLeft ? "pl-7" : "";
  const rightPadding = isPasswordField ? "pr-10" : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setInnerValue(v);
    onChange?.(v);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        id={inputId}
        type={inputType}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`peer w-full bg-transparent border-0 border-b ${borderColor} ${focusBorderColor}
                    outline-none transition-colors duration-200 ${sizePad} ${leftPadding} ${rightPadding}
                    ${textColor} placeholder-gray-100
                    ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-labelledby={`${inputId}-label`}
        autoComplete="off"
        spellCheck={false}
      />

      {iconLeft && (
        <FontAwesomeIcon
          icon={iconLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 ${iconColor}`}
        />
      )}

      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 ${eyeIconColor} hover:text-gray-900 transition-colors cursor-pointer p-1`}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      )}

      <label
        id={`${inputId}-label`}
        htmlFor={inputId}
        className={`absolute ${iconLeft ? "left-7" : "left-0"} cursor-text
                    transform transition-all duration-200
                    ${
                      active
                        ? "-top-3 text-xs " + focusLabelColor
                        : "top-1/2 -translate-y-1/2 " + labelColor
                    }`}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
