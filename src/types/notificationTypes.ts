import { createContext } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    userId?: string;
    actionUrl?: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (
        notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
    ) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);
