import { useState, useCallback } from 'react';
import {
    type ToastProps,
    type ToastType,
    type ToastPosition,
} from '../components/Toast';

interface ShowToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    position?: ToastPosition;
    showCloseButton?: boolean;
    pauseOnHover?: boolean;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = useCallback((options: ShowToastOptions) => {
        const id = `toast-${Date.now()}-${Math.random()}`;

        const newToast: ToastProps = {
            id,
            message: options.message,
            type: options.type || 'info',
            duration: options.duration ?? 3000,
            position: options.position || 'top-right',
            showCloseButton: options.showCloseButton ?? true,
            pauseOnHover: options.pauseOnHover ?? true,
        };

        setToasts((prev) => [...prev, newToast]);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Shorthand methods
    const success = useCallback(
        (
            message: string,
            options?: Omit<ShowToastOptions, 'message' | 'type'>,
        ) => {
            return showToast({ message, type: 'success', ...options });
        },
        [showToast],
    );

    const error = useCallback(
        (
            message: string,
            options?: Omit<ShowToastOptions, 'message' | 'type'>,
        ) => {
            return showToast({ message, type: 'error', ...options });
        },
        [showToast],
    );

    const warning = useCallback(
        (
            message: string,
            options?: Omit<ShowToastOptions, 'message' | 'type'>,
        ) => {
            return showToast({ message, type: 'warning', ...options });
        },
        [showToast],
    );

    const info = useCallback(
        (
            message: string,
            options?: Omit<ShowToastOptions, 'message' | 'type'>,
        ) => {
            return showToast({ message, type: 'info', ...options });
        },
        [showToast],
    );

    const infor = useCallback(
        (
            message: string,
            options?: Omit<ShowToastOptions, 'message' | 'type'>,
        ) => {
            return showToast({ message, type: 'infor', ...options });
        },
        [showToast],
    );

    return {
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        infor,
    };
};
