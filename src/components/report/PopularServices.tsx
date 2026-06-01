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
import { formatVnd, getServiceItems } from './serviceReportUtils';

interface PopularServicesProps {
    data: ServiceData[];
}

const PopularServices: React.FC<PopularServicesProps> = ({ data }) => {
    const servicesData = getServiceItems(data).map((service) => ({
        service: service.serviceName,
        orders: service.orders,
        revenue: service.revenue,
    }));

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ payload: { service: string; orders: number; revenue: number } }>;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold mb-1">
                        {payload[0].payload.service}
                    </p>
                    <p className="text-sm">Orders: {payload[0].payload.orders}</p>
                    <p className="text-sm text-gray-600">
                        Revenue: {formatVnd(payload[0].payload.revenue)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
            <h3 className="text-lg font-semibold mb-4">
                Services by Revenue
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={servicesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                    <XAxis
                        type="number"
                        stroke="#666"
                        tickFormatter={(value) => formatVnd(Number(value)).replace(' VND', '')}
                    />
                    <YAxis
                        dataKey="service"
                        type="category"
                        width={140}
                        stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey="revenue"
                        fill="#CCBDA3"
                        radius={[0, 8, 8, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PopularServices;
