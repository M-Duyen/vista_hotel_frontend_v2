import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface InputProps {
    label?: string; // Nhãn hiển thị phía trên
    placeholder?: string; // Placeholder
    value?: string; // Giá trị nhập
    onChange?: (value: string) => void;
    type?: string; // Text, email, password...
    size?: 'sm' | 'md' | 'lg'; // Kích thước
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'; // Bo góc
    shadow?: boolean; // Đổ bóng
    color?: string; // Màu border
    bgColor?: string; // Màu nền
    textColor?: string; // Màu chữ
    iconLeft?: IconDefinition; // Icon bên trái
    iconRight?: IconDefinition; // Icon bên phải
    disabled?: boolean; // Vô hiệu hóa
    error?: string; // Thông báo lỗi
    className?: string; // Custom thêm class
}

const Input: React.FC<InputProps> = ({
    label,
    placeholder = '',
    value = '',
    onChange,
    type = 'text',
    size = 'md',
    rounded = 'md',
    shadow = false,
    color = 'border-gray-300',
    bgColor = 'bg-white',
    textColor = 'text-gray-800',
    iconLeft,
    iconRight,
    disabled = false,
    error,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-5 py-3',
    };

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const isError = !!error;

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div
                className={`flex items-center relative ${
                    shadow ? 'shadow-sm' : ''
                }`}
            >
                {/* Icon trái  */}
                {iconLeft && (
                    <FontAwesomeIcon
                        icon={iconLeft}
                        className="absolute left-3 text-gray-400"
                    />
                )}

                {/* Input field  */}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={disabled}
                    className={`
            w-full ${sizeClasses[size]} ${roundedClasses[rounded]} 
            ${bgColor} ${textColor} ${color}
            border outline-none transition-all duration-200
            ${iconLeft ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''}
            ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
            ${
                isError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                    : 'focus:ring-2 focus:ring-primary'
            }
          `}
                />

                {/* Icon phải  */}
                {iconRight && (
                    <FontAwesomeIcon
                        icon={iconRight}
                        className="absolute right-3 text-gray-400"
                    />
                )}

                {/* Thông báo lỗi  */}
                {isError && (
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
            </div>
        </div>
    );
};

export default Input;
