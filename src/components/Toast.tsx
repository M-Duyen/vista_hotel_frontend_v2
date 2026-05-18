import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FaBell,
    FaTimes,
} from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

export interface ToastProps {
    id: string;
    message: string;
    title?: string;
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
    onClose?: (id: string) => void;
    showCloseButton?: boolean;
    pauseOnHover?: boolean;
}

const BROWN = {
    border: 'border-[#b9ad96]',
    bar: 'bg-[#b9ad96]',
    dot: 'bg-[#b9ad96]',
    icon: <FaBell className="text-[#b9ad96]" size={15} />,
};

const TOAST_CONFIGS = {
    info:    BROWN,
    success: BROWN,
    warning: BROWN,
    error:   BROWN,
};

const Toast: React.FC<ToastProps> = ({
    id,
    message,
    title,
    type = 'info',
    duration = 5000,
    onClose,
    showCloseButton = true,
    pauseOnHover = true,
}) => {
    const [progress, setProgress] = useState(100);
    const [paused, setPaused] = useState(false);

    const handleClose = useCallback(() => {
        onClose?.(id);
    }, [id, onClose]);

    useEffect(() => {
        if (duration <= 0) return;

        let startTime = Date.now();
        let remaining = duration;
        let rafId: number;
        let timerId: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (!paused) {
                const elapsed = Date.now() - startTime;
                const pct = Math.max(0, 100 - (elapsed / remaining) * 100);
                setProgress(pct);
                if (pct > 0) {
                    rafId = requestAnimationFrame(tick);
                }
            } else {
                rafId = requestAnimationFrame(tick);
            }
        };

        rafId = requestAnimationFrame(tick);
        timerId = setTimeout(handleClose, duration);

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timerId);
        };
    }, [duration, paused, handleClose]);

    const c = TOAST_CONFIGS[type] || TOAST_CONFIGS.info;
    const toastTitle = title || (type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : type === 'warning' ? 'Cảnh báo' : 'Thông báo');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`relative w-[340px] rounded-2xl shadow-2xl border bg-white overflow-hidden ${c.border}`}
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}
            onMouseEnter={() => pauseOnHover && setPaused(true)}
            onMouseLeave={() => pauseOnHover && setPaused(false)}
            role="alert"
        >
            {/* Top accent */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.dot} opacity-80`} />

            {/* Content */}
            <div className="flex items-start gap-3 px-4 pt-5 pb-4">
                <div className="mt-0.5 flex-shrink-0">{c.icon}</div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                        {toastTitle}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {message}
                    </p>
                </div>

                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label="Đóng"
                    >
                        <FaTimes size={12} />
                    </button>
                )}
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <div className="h-[3px] bg-gray-100 mx-4 mb-3 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${c.bar} rounded-full transition-none`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
};

export default Toast;
