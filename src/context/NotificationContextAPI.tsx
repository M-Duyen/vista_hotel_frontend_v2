/* eslint-disable */
import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { notificationApiService } from '../services/notificationApiService';
import type { BackendNotification } from '../services/notificationApiService';
import {
    websocketService,
    type NotificationMessage,
} from '../services/websocketService';

// ============================
// Frontend Notification Interface
// ============================
interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
    category?: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    needsAction?: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (
        notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>,
    ) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
    userId?: string;
}

// ============================
// MAIN PROVIDER
// ============================
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    const userId =
        parsedUser?.customerId ||
        parsedUser?.employeeId ||
        parsedUser?.adminId ||
        parsedUser?.id ||
        null;

    let rawRole = parsedUser?.role || '';
    rawRole = rawRole.toUpperCase();

    let userType: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN' = 'CUSTOMER';

    if (rawRole.includes('ADMIN')) userType = 'ADMIN';
    else if (rawRole.includes('EMPLOYEE')) userType = 'EMPLOYEE';
    else userType = 'CUSTOMER';

    useEffect(() => {
        if (!userId) {
            console.warn('[WebSocket] No userId → skip WebSocket');
            return;
        }

        websocketService
            .connect(userId, userType)
            .then(() => {
                console.log('[WebSocket] Connected successfully');

                const unsubscribe = websocketService.onMessage(
                    (notification: NotificationMessage) => {
                        const frontendNotif: Notification = {
                            id: notification.id,
                            title: notification.title,
                            message: notification.message,
                            type:
                                notification.type === 'ALERT'
                                    ? 'error'
                                    : notification.type === 'REQUEST'
                                    ? 'warning'
                                    : 'info',
                            timestamp: notification.createdAt,
                            isRead: notification.isRead,
                            category: notification.category,
                            priority: notification.priority,
                            needsAction: false,
                        };

                        setNotifications((prev) => [frontendNotif, ...prev]);
                    },
                );

                return unsubscribe;
            })
            .catch((error) => {
                console.error('WebSocket connection failed:', error);
            });

        return () => {
            websocketService.disconnect();
        };
    }, [userId, userType]);

    const convertBackendToFrontend = (
        backendNotif: BackendNotification,
    ): Notification => {
        const getType = (category: string, type: string) => {
            if (type === 'ALERT') return 'error';
            if (category === 'PAYMENT_ISSUE') return 'warning';
            if (category === 'PROMOTION') return 'success';
            return 'info';
        };

        return {
            id: backendNotif.id,
            title: backendNotif.title,
            message: backendNotif.message,
            type: getType(backendNotif.category, backendNotif.type),
            timestamp: backendNotif.deliveredAt || backendNotif.createdAt,
            isRead: backendNotif.isRead,
            category: backendNotif.category,
            priority: backendNotif.priority,
            needsAction: backendNotif.needsAction,
        };
    };

    // ============================
    // Fetch notifications (API)
    // ============================
    const refreshNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setNotifications([]);
                return;
            }
            const response = await notificationApiService.getMyNotifications(
                0,
                50,
            );

            if (response.success && Array.isArray(response.data?.content)) {
                const mapped = response.data.content.map(
                    convertBackendToFrontend,
                );
                setNotifications(mapped);
                return;
            }

            // fallback
            const unread =
                await notificationApiService.getUnreadNotifications();
            if (unread.success && Array.isArray(unread.data)) {
                setNotifications(unread.data.map(convertBackendToFrontend));
                return;
            }

            setNotifications([]);
        } catch (error) {
            console.error('[Context] Error loading notifications:', error);
        }
    }, []);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    const addNotification = useCallback(
        (data: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
            const newNoti: Notification = {
                ...data,
                id: 'local_' + Date.now() + Math.random().toString(36).slice(2),
                timestamp: new Date().toISOString(),
                isRead: false,
            };

            setNotifications((prev) => [newNoti, ...prev]);

            notificationApiService.createNotification({
                type: data.type === 'warning' ? 'ALERT' : 'INFO',
                category: (data.category as any) || 'OTHER',
                title: data.title,
                message: data.message,
                toUserId: userId,
                isRead: false,
                isRealtime: true,
                status: 'PENDING',
                priority: data.priority || 'NORMAL',
            });
        },
        [userId],
    );

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );

        if (!id.startsWith('local_')) {
            await notificationApiService.markAsRead(id).catch(() => {});
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        await notificationApiService.markAllAsRead().catch(() => {});
    }, []);

    const removeNotification = useCallback(async (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        if (!id.startsWith('local_')) {
            await notificationApiService.deleteNotification(id).catch(() => {});
        }
    }, []);

    const clearAll = useCallback(() => setNotifications([]), []);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearAll,
                refreshNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// ============================
// Export hook
// ============================
export const useNotificationContext = (): NotificationContextType => {
    const ctx = React.useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotificationContext must be used inside provider');
    }
    return ctx;
};
