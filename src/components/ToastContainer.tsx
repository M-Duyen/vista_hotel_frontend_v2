import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { type ToastProps, type ToastPosition } from './Toast';


interface ToastContainerProps {
    toasts: ToastProps[];
    position?: ToastPosition;
    onRemove: (id: string) => void;
}

const getPositionClasses = (position: ToastPosition) => {
    switch (position) {
        case 'top-left':
            return 'top-20 left-4';
        case 'top-center':
            return 'top-20 left-1/2 -translate-x-1/2';
        case 'top-right':
            return 'top-20 right-4';
        case 'bottom-left':
            return 'bottom-6 left-4';
        case 'bottom-center':
            return 'bottom-6 left-1/2 -translate-x-1/2';
        case 'bottom-right':
            return 'bottom-6 right-4';
        default:
            return 'top-20 right-4';
    }
};

const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    position = 'top-right',
    onRemove,
}) => {
    return (
        <div
            className={`fixed ${getPositionClasses(position)} z-[99999] flex flex-col gap-3`}
            style={{ pointerEvents: 'none' }}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <Toast {...toast} onClose={onRemove} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
