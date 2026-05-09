/* eslint-disable */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaSmile, FaMeh, FaFrown } from 'react-icons/fa';

interface SentimentData {
    positive: number;
    neutral: number;
    negative: number;
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
}

interface Props {
    data: SentimentData | null;
}

const SentimentAnalysis: React.FC<Props> = ({ data }) => {
    if (!data) return <p>Loading...</p>;

    const sentimentData = [
        {
            name: 'Positive',
            value: data.positive,
            percent: data.positivePercent,
            color: '#00C853',
            icon: <FaSmile />,
        },
        {
            name: 'Neutral',
            value: data.neutral,
            percent: data.neutralPercent,
            color: '#FF9800',
            icon: <FaMeh />,
        },
        {
            name: 'Negative',
            value: data.negative,
            percent: data.negativePercent,
            color: '#F44336',
            icon: <FaFrown />,
        },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm">{item.value} reviews</p>
                    <p className="text-sm text-gray-600">
                        {item.percent.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
            <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) =>
                            `${entry.name}: ${entry.percent.toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Summary boxes */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                {sentimentData.map((item, index) => (
                    <div
                        key={index}
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: `${item.color}20` }}
                    >
                        <div
                            className="text-3xl mb-2 flex justify-center"
                            style={{ color: item.color }}
                        >
                            {item.icon}
                        </div>

                        <p className="font-semibold text-lg">{item.value}</p>
                        <p className="text-sm text-gray-600">{item.name}</p>

                        <p className="text-xs text-gray-500">
                            {item.percent.toFixed(1)}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SentimentAnalysis;
