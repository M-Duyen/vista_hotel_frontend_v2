/* eslint-disable */
import React, { createContext, type ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { type ToastPosition } from '../components/Toast';

interface ToastOptions {
    duration?: number;
    position?: ToastPosition;
    showCloseButton?: boolean;
    pauseOnHover?: boolean;
}

interface ToastContextType {
    showToast: (options: {
        message: string;
        type?: 'success' | 'error' | 'warning' | 'info' | 'infor';
        duration?: number;
        position?: ToastPosition;
        showCloseButton?: boolean;
        pauseOnHover?: boolean;
    }) => string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    infor: (message: string, options?: ToastOptions) => string;
    clearAllToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
    undefined,
);

interface ToastProviderProps {
    children: ReactNode;
    defaultPosition?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
    children,
    defaultPosition = 'top-right',
}) => {
    const {
        toasts,
        showToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        infor,
    } = useToast();

    return (
        <ToastContext.Provider
            value={{
                showToast,
                success,
                error,
                warning,
                info,
                infor,
                clearAllToasts,
            }}
        >
            {children}
            <ToastContainer
                toasts={toasts}
                position={defaultPosition}
                onRemove={removeToast}
            />
        </ToastContext.Provider>
    );
};
