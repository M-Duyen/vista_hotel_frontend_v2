import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { ServiceData } from '../../types/Report';
import {
    formatVnd,
    getServiceColor,
    getServiceItems,
} from './serviceReportUtils';

interface ServiceChartProps {
    data: ServiceData[];
}

type ServiceTooltipPayload = {
    name: string;
    value: number;
    color: string;
    payload: { date: string };
};

const ServiceChart: React.FC<ServiceChartProps> = ({ data }) => {
    const serviceItems = getServiceItems(data).slice(0, 8);
    const serviceNames = serviceItems.map((item) => item.serviceName);

    const chartData = data.map((row) => {
        const rowData: Record<string, string | number> = { date: row.date };

        if (Array.isArray(row.services) && row.services.length > 0) {
            row.services.forEach((service) => {
                rowData[service.serviceName] = Number(service.revenue || 0);
            });
        } else {
            rowData['Food & Beverage'] = Number(row.foodBeverage || 0);
            rowData.Laundry = Number(row.laundry || 0);
            rowData.Spa = Number(row.spa || 0);
            rowData.Transport = Number(row.transport || 0);
            rowData.Tour = Number(row.tour || 0);
            rowData.Others = Number(row.others || 0);
        }

        return rowData;
    });

    const CustomTooltip = ({
        active,
        payload,
    }: {
        active?: boolean;
        payload?: ServiceTooltipPayload[];
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">
                        {payload[0].payload.date}
                    </p>
                    {payload
                        .filter((entry) => Number(entry.value || 0) > 0)
                        .map((entry, index) => (
                            <p
                                key={index}
                                style={{ color: entry.color }}
                                className="text-sm"
                            >
                                {entry.name}: {formatVnd(entry.value)}
                            </p>
                        ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis
                    tickFormatter={(value) => formatVnd(Number(value)).replace(' VND', '')}
                    stroke="#666"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {serviceNames.map((serviceName, index) => {
                    const color = getServiceColor(index);
                    const gradientId = `serviceColor${index}`;
                    return (
                        <React.Fragment key={serviceName}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey={serviceName}
                                stackId="1"
                                stroke={color}
                                fill={`url(#${gradientId})`}
                                name={serviceName}
                            />
                        </React.Fragment>
                    );
                })}
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ServiceChart;
