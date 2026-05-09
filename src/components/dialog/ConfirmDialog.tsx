import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes,
    FaExclamationTriangle,
    FaCheckCircle,
    FaInfoCircle,
    FaExclamationCircle,
} from 'react-icons/fa';

export type ConfirmDialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: ConfirmDialogType;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

/**
 * Reusable Confirm Dialog Component
 * Supports different types: danger, warning, info, success
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
}) => {
    const getTypeConfig = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <FaExclamationTriangle />,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    buttonBg: 'bg-red-600 hover:bg-red-700',
                    borderColor: 'border-red-200',
                };
            case 'warning':
                return {
                    icon: <FaExclamationCircle />,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-600',
                    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
                    borderColor: 'border-yellow-200',
                };
            case 'info':
                return {
                    icon: <FaInfoCircle />,
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                    buttonBg: 'bg-blue-600 hover:bg-blue-700',
                    borderColor: 'border-blue-200',
                };
            case 'success':
                return {
                    icon: <FaCheckCircle />,
                    iconBg: 'bg-green-100',
                    iconColor: 'text-green-600',
                    buttonBg: 'bg-green-600 hover:bg-green-700',
                    borderColor: 'border-green-200',
                };
            default:
                return {
                    icon: <FaExclamationTriangle />,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-600',
                    buttonBg: 'bg-red-600 hover:bg-red-700',
                    borderColor: 'border-red-200',
                };
        }
    };

    const config = getTypeConfig();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[200]"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                            {/* Header */}
                            <div
                                className={`flex items-start justify-between p-6 border-b ${config.borderColor}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-full ${config.iconBg} ${config.iconColor} flex items-center justify-center text-xl flex-shrink-0`}
                                    >
                                        {config.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {message}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50">
                                {cancelText && (
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`px-6 py-2 text-white rounded-lg transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonBg}`}
                                >
                                    {isLoading ? 'Processing...' : confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
