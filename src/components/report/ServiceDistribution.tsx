import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import type { ServiceData } from '../../types/Report';
import {
    formatVnd,
    getServiceColor,
    getServiceItems,
    getTotalServiceRevenue,
} from './serviceReportUtils';

interface ServiceDistributionProps {
    data: ServiceData[];
}

const ServiceDistribution: React.FC<ServiceDistributionProps> = ({ data }) => {
    const distributionData = getServiceItems(data).map((item, index) => ({
        name: item.serviceName,
        value: item.revenue,
        color: getServiceColor(index),
    }));

    const total = getTotalServiceRevenue(getServiceItems(data));

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: Array<{ name: string; value: number }>;
    }) => {
        if (active && payload && payload.length) {
            const percentage =
                total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : '0.0';
            return (
                <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm">{formatVnd(payload[0].value)}</p>
                    <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
            <h3 className="text-lg font-semibold mb-4">
                Service Revenue Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {distributionData.map((item) => (
                    <div key={item.name} className="text-center">
                        <div
                            className="w-4 h-4 rounded mx-auto mb-2"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="text-sm font-semibold">
                            {formatVnd(item.value)}
                        </p>
                        <p className="text-xs text-gray-600">{item.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceDistribution;
