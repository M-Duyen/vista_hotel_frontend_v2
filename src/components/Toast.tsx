import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faExclamationCircle,
    faInfoCircle,
    faTimesCircle,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';

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
    type?: ToastType;
    duration?: number; // milliseconds
    position?: ToastPosition;
    onClose?: (id: string) => void;
    showCloseButton?: boolean;
    pauseOnHover?: boolean;
}

const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type = 'info',
    duration = 3000,
    onClose,
    showCloseButton = true,
    pauseOnHover = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number>(Date.now());
    const remainingTimeRef = useRef<number>(duration);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        // Trigger slide-in animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const handleClose = React.useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose?.(id);
        }, 400); // Match animation duration
    }, [id, onClose]);

    useEffect(() => {
        if (duration <= 0) return;

        const scheduleClose = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                handleClose();
            }, remainingTimeRef.current);
        };

        if (!isPaused) {
            startTimeRef.current = Date.now();
            scheduleClose();

            // Animate progress bar with CSS
            if (progressRef.current) {
                progressRef.current.style.transition = `width ${remainingTimeRef.current}ms linear`;
                progressRef.current.style.width = '0%';
            }
        } else {
            // Pause
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Calculate remaining time
            const elapsed = Date.now() - startTimeRef.current;
            remainingTimeRef.current = Math.max(
                0,
                remainingTimeRef.current - elapsed,
            );

            // Pause progress bar
            if (progressRef.current) {
                const computedStyle = window.getComputedStyle(
                    progressRef.current,
                );
                const currentWidth = computedStyle.width;
                progressRef.current.style.transition = 'none';
                progressRef.current.style.width = currentWidth;
            }
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [isPaused, duration, handleClose]);

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: faCheckCircle,
                    iconColor: 'text-green-500',
                    iconBg: 'bg-green-50',
                    borderColor: 'border-green-200',
                    progressColor: 'bg-green-500',
                    accentColor: 'bg-green-500',
                };
            case 'error':
                return {
                    icon: faTimesCircle,
                    iconColor: 'text-red-500',
                    iconBg: 'bg-red-50',
                    borderColor: 'border-red-200',
                    progressColor: 'bg-red-500',
                    accentColor: 'bg-red-500',
                };
            case 'warning':
                return {
                    icon: faExclamationCircle,
                    iconColor: 'text-amber-500',
                    iconBg: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    progressColor: 'bg-amber-500',
                    accentColor: 'bg-amber-500',
                };
            case 'info':
            default:
                return {
                    icon: faInfoCircle,
                    iconColor: 'text-blue-500',
                    iconBg: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    progressColor: 'bg-blue-500',
                    accentColor: 'bg-blue-500',
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div
            className={`
        relative flex items-start gap-3 min-w-[320px] max-w-[450px] p-4
        rounded-xl shadow-lg
        bg-white
        border-l-4 ${config.borderColor}
        ${isExiting ? 'toast-exit' : isVisible ? 'toast-enter' : 'opacity-0'}
        hover:shadow-xl
        transition-all duration-200
      `}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
            role="alert"
        >
            {/* Icon with background */}
            <div
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${config.iconBg}`}
            >
                <FontAwesomeIcon
                    icon={config.icon}
                    className={`text-xl ${config.iconColor}`}
                />
            </div>

            {/* Message */}
            <div className="flex-1 text-gray-800 text-sm font-medium leading-relaxed pt-1.5 pr-2">
                {message}
            </div>

            {/* Close Button */}
            {showCloseButton && (
                <button
                    onClick={handleClose}
                    className="
            flex-shrink-0 w-7 h-7 flex items-center justify-center
            rounded-lg text-gray-400
            hover:bg-gray-100 hover:text-gray-600
            active:bg-gray-200
            transition-all duration-200 mt-0.5
          "
                    aria-label="Close notification"
                >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                </button>
            )}

            {/* Progress Bar */}
            {duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
                    <div
                        ref={progressRef}
                        className={`h-full ${config.progressColor}`}
                        style={{ width: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default Toast;
