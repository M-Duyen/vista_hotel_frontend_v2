/* eslint-disable */
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

interface Props {
    data: {
        location: number;
        service: number;
        roomQuality: number;
        value: number;
    } | null;
}

const RatingBreakdown: React.FC<Props> = ({ data }) => {
    if (!data) return <p>Loading...</p>;

    const chartData = [
        { name: 'Location', score: data.location },
        { name: 'Service', score: data.service },
        { name: 'Room Quality', score: data.roomQuality },
        { name: 'Value', score: data.value },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm">
                        Rating: {payload[0].value.toFixed(1)}/5.0
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
            <h3 className="text-lg font-semibold mb-4">
                Rating Breakdown by Category
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                    <XAxis type="number" domain={[0, 5]} stroke="#666" />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar dataKey="score" fill="#CCBDA3" radius={[0, 8, 8, 0]} />
                </BarChart>
            </ResponsiveContainer>

            {/* List breakdown */}
            <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                            <span>{item.name}</span>
                            <span className="font-semibold">
                                {item.score.toFixed(1)}/5.0
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#CCBDA3] h-2 rounded-full"
                                style={{ width: `${(item.score / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingBreakdown;
