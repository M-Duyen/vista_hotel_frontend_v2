import React from 'react';
import { FaUsers, FaMedal, FaCoins, FaGift } from 'react-icons/fa';
import type { LoyaltyData } from '../../types/Report';

interface LoyaltySummaryProps {
    data: LoyaltyData[];
}

const LoyaltySummary: React.FC<LoyaltySummaryProps> = ({ data }) => {
    const latestData = data.length > 0 ? data[data.length - 1] : null;

    const totalMembers = latestData
        ? latestData.bronze +
          latestData.silver +
          latestData.gold +
          latestData.platinum
        : 0;

    const totalPoints = latestData ? latestData.totalPoints : 0;
    const totalRedemptions = data.reduce(
        (sum, month) => sum + month.redemptions,
        0,
    );

    // Calculate growth from previous month
    const previousData = data.length > 1 ? data[data.length - 2] : null;
    const previousTotal = previousData
        ? previousData.bronze +
          previousData.silver +
          previousData.gold +
          previousData.platinum
        : totalMembers;

    const memberGrowth =
        previousTotal > 0
            ? ((totalMembers - previousTotal) / previousTotal) * 100
            : 0;

    const stats = [
        {
            title: 'Total Members',
            value: totalMembers.toLocaleString(),
            icon: FaUsers,
            color: 'bg-blue-500',
            growth: memberGrowth.toFixed(1) + '%',
            growthPositive: memberGrowth >= 0,
        },
        {
            title: 'Platinum Members',
            value: latestData ? latestData.platinum.toLocaleString() : '0',
            icon: FaMedal,
            color: 'bg-gray-400',
            subtitle: 'Premium Tier',
        },
        {
            title: 'Total Loyalty Points',
            value: totalPoints.toLocaleString(),
            icon: FaCoins,
            color: 'bg-yellow-500',
            subtitle: 'Active Points',
        },
        // {
        //   title: "Total Redemptions",
        //   value: totalRedemptions.toLocaleString(),
        //   icon: FaGift,
        //   color: "bg-green-500",
        //   subtitle: "All Time",
        // },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white p-3 rounded-lg shadow-sm border border-[#EBE3D7] hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-lg`}>
                            <stat.icon className="text-white text-xl" />
                        </div>
                        {stat.growth && (
                            <span
                                className={`text-sm font-semibold ${
                                    stat.growthPositive
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {stat.growthPositive ? '+' : ''}
                                {stat.growth}
                            </span>
                        )}
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                        {stat.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                    </p>
                    {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                            {stat.subtitle}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default LoyaltySummary;
