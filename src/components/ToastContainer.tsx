import React from 'react';
import Toast, { type ToastProps, type ToastPosition } from './Toast';

interface ToastContainerProps {
    toasts: ToastProps[];
    position?: ToastPosition;
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
    toasts,
    position = 'top-right',
    onRemove,
}) => {
    const getPositionClasses = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 right-4';
        }
    };

    return (
        <div
            className={`fixed ${getPositionClasses()} z-[9999] flex flex-col gap-3 pointer-events-none`}
        >
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onClose={onRemove} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
