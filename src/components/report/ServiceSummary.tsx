import React from 'react';
import type { ServiceData } from '../../types/Report';
import {
    formatVnd,
    getServiceColor,
    getServiceIcon,
    getServiceItems,
    getTotalServiceOrders,
    getTotalServiceRevenue,
} from './serviceReportUtils';

interface ServiceSummaryProps {
    data: ServiceData[];
}

const ServiceSummary: React.FC<ServiceSummaryProps> = ({ data }) => {
    const serviceItems = getServiceItems(data);
    const totalRevenue = getTotalServiceRevenue(serviceItems);
    const totalOrders = getTotalServiceOrders(serviceItems, data);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    if (serviceItems.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No data available
            </div>
        );
    }

    const summaryCards = [
        ...serviceItems.map((service, index) => {
            const color = getServiceColor(index);
            const percentage =
                totalRevenue > 0 ? (service.revenue / totalRevenue) * 100 : 0;
            return {
                icon: getServiceIcon(service.serviceName, service.serviceCategory),
                iconColor: color,
                bgColor: `${color}1A`,
                title: service.serviceName,
                value: formatVnd(service.revenue),
                subtitle: `${percentage.toFixed(1)}% of total`,
            };
        }),
        {
            icon: getServiceIcon('Avg Order Value'),
            iconColor: '#27AE60',
            bgColor: 'rgba(39, 174, 96, 0.1)',
            title: 'Avg Order Value',
            value: formatVnd(avgOrderValue),
            subtitle: `From ${totalOrders} orders`,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card, index) => (
                <div
                    key={`${card.title}-${index}`}
                    className="bg-white p-5 rounded-lg shadow-sm border border-[#EBE3D7]"
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: card.bgColor }}
                    >
                        <span
                            style={{ color: card.iconColor }}
                            className="text-xl"
                        >
                            {card.icon}
                        </span>
                    </div>
                    <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold mb-1">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
            ))}
        </div>
    );
};

export default ServiceSummary;
