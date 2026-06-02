import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotificationsAPI';

interface NotificationBellProps {
    variant?: 'dark' | 'light';
}

export default function NotificationBell({
    variant = 'dark',
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
        useNotifications();

    // Sort notifications: newest first (by timestamp)
    const sortedNotifications = [...notifications].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA; // Newest first
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (id: string) => {
        try {
            await markAsRead(id);
        } catch (error) {
            console.warn('Could not mark notification as read:', error);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) {
            return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        }

        const diffHours = Math.floor(diffMins / 60);
        if (diffMins < 1440) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const bellColorClass =
        variant === 'light'
            ? 'relative p-2 text-white hover:text-[#b9ad96] transition-colors'
            : 'relative p-2 text-gray-600 hover:text-[#b9ad96] transition-colors';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${bellColorClass} cursor-pointer`}
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-[#b9ad96]/20 z-50 overflow-hidden"
                    >
                        {/* Header - Premium Design */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#b9ad96]/10 to-white border-b border-[#b9ad96]/20">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-serif text-lg text-gray-900">
                                        Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <p className="text-xs text-[#b9ad96] font-medium">
                                            {unreadCount} new{' '}
                                            {unreadCount === 1
                                                ? 'notification'
                                                : 'notifications'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="px-3 py-1.5 text-xs text-white bg-[#b9ad96] hover:bg-[#a89981] rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <FaCheck size={10} />
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List - Hidden scrollbar */}
                        <div className="notification-list max-h-[500px] overflow-y-auto">
                            {sortedNotifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-20 h-20 bg-[#b9ad96]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaBell
                                            size={32}
                                            className="text-[#b9ad96]/40"
                                        />
                                    </div>
                                    <p className="text-gray-400 font-serif">
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#b9ad96]/10">
                                    {sortedNotifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`group px-6 py-4 cursor-pointer transition-all relative ${
                                                notification.isRead
                                                    ? 'bg-white hover:bg-gray-50'
                                                    : 'bg-[#b9ad96]/5 hover:bg-[#b9ad96]/10'
                                            }`}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification.id,
                                                )
                                            }
                                        >
                                            {!notification.isRead && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b9ad96]"></div>
                                            )}

                                            <div className="flex items-start gap-4">
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        className={`font-serif font-medium text-sm mb-1 ${
                                                            notification.isRead
                                                                ? 'text-gray-600'
                                                                : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-[#b9ad96] font-medium">
                                                            {formatTime(
                                                                notification.timestamp,
                                                            )}
                                                        </span>
                                                        {!notification.isRead && (
                                                            <span className="w-1.5 h-1.5 bg-[#b9ad96] rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {sortedNotifications.length > 0 && (
                            <div className="px-6 py-4 bg-gradient-to-r from-white to-[#b9ad96]/5 border-t border-[#b9ad96]/20 flex justify-between items-center">
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1.5 transition-colors"
                                >
                                    <FaTrash size={10} />
                                    Clear All
                                </button>
                                <span className="text-xs text-gray-400 font-medium">
                                    {sortedNotifications.length}{' '}
                                    {sortedNotifications.length === 1
                                        ? 'notification'
                                        : 'notifications'}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
