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

interface ServiceChartProps {
    data: ServiceData[];
}

const ServiceChart: React.FC<ServiceChartProps> = ({ data }) => {
    const formatCurrency = (value: number) => {
        return `${(value / 1000000).toFixed(1)}M`;
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">
                        {payload[0].payload.date}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p
                            key={index}
                            style={{ color: entry.color }}
                            className="text-sm"
                        >
                            {entry.name}: {entry.value.toLocaleString('vi-VN')}{' '}
                            VND
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="#FF6B6B"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#FF6B6B"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient
                        id="colorLaundry"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#4ECDC4"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#4ECDC4"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="colorSpa" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="#9B59B6"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#9B59B6"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient
                        id="colorTransport"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#3498DB"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#3498DB"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient id="colorTour" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="#E67E22"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#E67E22"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient
                        id="colorOthers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#95A5A6"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="#95A5A6"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis tickFormatter={formatCurrency} stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="foodBeverage"
                    stackId="1"
                    stroke="#FF6B6B"
                    fill="url(#colorFood)"
                    name="Food & Beverage"
                />
                <Area
                    type="monotone"
                    dataKey="laundry"
                    stackId="1"
                    stroke="#4ECDC4"
                    fill="url(#colorLaundry)"
                    name="Laundry"
                />
                <Area
                    type="monotone"
                    dataKey="spa"
                    stackId="1"
                    stroke="#9B59B6"
                    fill="url(#colorSpa)"
                    name="Spa"
                />
                <Area
                    type="monotone"
                    dataKey="transport"
                    stackId="1"
                    stroke="#3498DB"
                    fill="url(#colorTransport)"
                    name="Transport"
                />
                <Area
                    type="monotone"
                    dataKey="tour"
                    stackId="1"
                    stroke="#E67E22"
                    fill="url(#colorTour)"
                    name="Tour"
                />
                <Area
                    type="monotone"
                    dataKey="others"
                    stackId="1"
                    stroke="#95A5A6"
                    fill="url(#colorOthers)"
                    name="Others"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ServiceChart;
