import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface ButtonProps {
    text?: string; // Nội dung hiển thị
    color?: string; // mMàu nền (ví dụ: "#1E40AF" hoặc "bg-blue-600")
    textColor?: string; // Màu chữ
    borderColor?: string; // Màu viền
    size?: 'sm' | 'md' | 'lg'; // Kích thước
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'; // Bo góc
    outline?: boolean; // Kiểu viền
    fullWidth?: boolean; // Full width
    shadow?: boolean; // Có đổ bóng hay không
    disabled?: boolean; // Vô hiệu hóa
    loading?: boolean; // Đang xử lý
    icon?: IconDefinition; // FontAwesome icon
    iconPosition?: 'left' | 'right'; // Vị trí icon
    onClick?: () => void;
    className?: string; // Custom thêm class
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    text = 'Button',
    color = 'bg-blue-600',
    textColor = 'text-white',
    borderColor = 'border-transparent',
    size = 'md',
    rounded = 'md',
    outline = false,
    fullWidth = false,
    shadow = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    onClick,
    type = 'button',
    className = '',
}) => {
    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
    };

    const radiusClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const isDisabled = disabled || loading;

    const inlineColorStyle =
        color.startsWith('#') || color.startsWith('rgb')
            ? { backgroundColor: color, color: textColor.replace('text-', '') }
            : {};

    const btnClass = `
    inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer
    ${outline ? `border ${borderColor}` : `${color} ${textColor}`}
    ${radiusClasses[rounded]} 
    ${sizeClasses[size]} 
    ${fullWidth ? 'w-full' : ''}
    ${shadow ? 'shadow-md hover:shadow-lg' : ''}
    ${isDisabled ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}
    ${className}
  `;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={btnClass}
            style={inlineColorStyle}
        >
            {/* Icon trái  */}
            {icon && iconPosition === 'left' && (
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
            )}

            {/* Text hoặc Loading  */}
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx={12}
                            cy={12}
                            r={10}
                            stroke="currentColor"
                            strokeWidth={4}
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                    </svg>
                    Đang xử lý...
                </span>
            ) : (
                text
            )}
            {/* Icon phải  */}
            {icon && iconPosition === 'right' && (
                <FontAwesomeIcon icon={icon} className="h-5 w-5" />
            )}
        </button>
    );
};

export default Button;
