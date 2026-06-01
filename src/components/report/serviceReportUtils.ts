import type { ReactNode } from 'react';
import { createElement } from 'react';
import {
    FaCar,
    FaConciergeBell,
    FaMapMarkedAlt,
    FaShoppingCart,
    FaSpa,
    FaTshirt,
    FaUtensils,
} from 'react-icons/fa';
import type { ServiceData, ServiceRevenueItem } from '../../types/Report';

export const formatVnd = (value?: number | null) =>
    `${Math.round(Number(value || 0)).toLocaleString('vi-VN')} VND`;

const colors = [
    '#B8935F',
    '#4ECDC4',
    '#9B59B6',
    '#3498DB',
    '#E67E22',
    '#27AE60',
    '#8E44AD',
    '#2C3E50',
];

export const getServiceColor = (index: number) => colors[index % colors.length];

export const getServiceIcon = (serviceName: string, serviceCategory?: string): ReactNode => {
    const text = `${serviceName} ${serviceCategory || ''}`.toLowerCase();
    if (text.includes('food') || text.includes('beverage') || text.includes('restaurant')) return createElement(FaUtensils);
    if (text.includes('laundry')) return createElement(FaTshirt);
    if (text.includes('spa')) return createElement(FaSpa);
    if (text.includes('transport') || text.includes('car') || text.includes('airport')) return createElement(FaCar);
    if (text.includes('tour') || text.includes('travel')) return createElement(FaMapMarkedAlt);
    if (text.includes('order') || text.includes('avg')) return createElement(FaShoppingCart);
    return createElement(FaConciergeBell);
};

export const getServiceItems = (data: ServiceData[]): ServiceRevenueItem[] => {
    const totals = new Map<string, ServiceRevenueItem>();

    data.forEach((row) => {
        if (Array.isArray(row.services) && row.services.length > 0) {
            row.services.forEach((service) => {
                const key = service.serviceId || service.serviceName;
                const existing = totals.get(key) || {
                    serviceId: service.serviceId,
                    serviceName: service.serviceName || service.serviceId || 'Unknown service',
                    serviceCategory: service.serviceCategory,
                    orders: 0,
                    revenue: 0,
                };
                existing.orders += Number(service.orders || 0);
                existing.revenue += Number(service.revenue || 0);
                totals.set(key, existing);
            });
        }
    });

    if (totals.size === 0) {
        const legacyItems = [
            { serviceName: 'Food & Beverage', revenue: data.reduce((sum, item) => sum + Number(item.foodBeverage || 0), 0) },
            { serviceName: 'Laundry', revenue: data.reduce((sum, item) => sum + Number(item.laundry || 0), 0) },
            { serviceName: 'Spa', revenue: data.reduce((sum, item) => sum + Number(item.spa || 0), 0) },
            { serviceName: 'Transport', revenue: data.reduce((sum, item) => sum + Number(item.transport || 0), 0) },
            { serviceName: 'Tour', revenue: data.reduce((sum, item) => sum + Number(item.tour || 0), 0) },
            { serviceName: 'Others', revenue: data.reduce((sum, item) => sum + Number(item.others || 0), 0) },
        ];
        const totalRevenue = legacyItems.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = data.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0);
        legacyItems.forEach((item) => {
            totals.set(item.serviceName, {
                serviceName: item.serviceName,
                orders: totalRevenue > 0 ? Math.round(totalOrders * (item.revenue / totalRevenue)) : 0,
                revenue: item.revenue,
            });
        });
    }

    return Array.from(totals.values())
        .filter((item) => item.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);
};

export const getTotalServiceRevenue = (items: ServiceRevenueItem[]) =>
    items.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

export const getTotalServiceOrders = (items: ServiceRevenueItem[], fallbackData: ServiceData[]) => {
    const itemOrders = items.reduce((sum, item) => sum + Number(item.orders || 0), 0);
    return itemOrders || fallbackData.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0);
};
