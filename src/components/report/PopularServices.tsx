import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { ServiceData } from '../../types/Report';

interface PopularServicesProps {
    data: ServiceData[];
}

const PopularServices: React.FC<PopularServicesProps> = ({ data }) => {
    // Calculate service statistics from real data
    const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalFoodBeverage = data.reduce(
        (sum, item) => sum + item.foodBeverage,
        0,
    );
    const totalLaundry = data.reduce((sum, item) => sum + item.laundry, 0);
    const totalSpa = data.reduce((sum, item) => sum + item.spa, 0);
    const totalTransport = data.reduce((sum, item) => sum + item.transport, 0);
    const totalTour = data.reduce((sum, item) => sum + item.tour, 0);
    const totalOthers = data.reduce((sum, item) => sum + item.others, 0);

    const totalRevenue =
        totalFoodBeverage +
        totalLaundry +
        totalSpa +
        totalTransport +
        totalTour +
        totalOthers;

    // Create services data with proportional order distribution based on revenue
    const servicesData = [
        {
            service: 'Food & Beverage',
            orders:
                totalRevenue > 0
                    ? Math.round(
                          totalOrders * (totalFoodBeverage / totalRevenue),
                      )
                    : 0,
            revenue: totalFoodBeverage,
        },
        {
            service: 'Laundry',
            orders:
                totalRevenue > 0
                    ? Math.round(totalOrders * (totalLaundry / totalRevenue))
                    : 0,
            revenue: totalLaundry,
        },
        {
            service: 'Spa',
            orders:
                totalRevenue > 0
                    ? Math.round(totalOrders * (totalSpa / totalRevenue))
                    : 0,
            revenue: totalSpa,
        },
        {
            service: 'Transport',
            orders:
                totalRevenue > 0
                    ? Math.round(totalOrders * (totalTransport / totalRevenue))
                    : 0,
            revenue: totalTransport,
        },
        {
            service: 'Tour',
            orders:
                totalRevenue > 0
                    ? Math.round(totalOrders * (totalTour / totalRevenue))
                    : 0,
            revenue: totalTour,
        },
        {
            service: 'Others',
            orders:
                totalRevenue > 0
                    ? Math.round(totalOrders * (totalOthers / totalRevenue))
                    : 0,
            revenue: totalOthers,
        },
    ]
        .filter((item) => item.revenue > 0) // Only show services with revenue
        .sort((a, b) => b.revenue - a.revenue); // Sort by revenue

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold mb-1">
                        {payload[0].payload.service}
                    </p>
                    <p className="text-sm">Orders: {payload[0].value}</p>
                    <p className="text-sm text-gray-600">
                        Revenue:{' '}
                        {payload[0].payload.revenue.toLocaleString('vi-VN')} VND
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
            <h3 className="text-lg font-semibold mb-4">
                Most Popular Services
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis
                        dataKey="service"
                        type="category"
                        width={120}
                        stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="orders"
                        fill="#CCBDA3"
                        radius={[0, 8, 8, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PopularServices;
