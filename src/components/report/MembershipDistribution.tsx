import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { LoyaltyData } from "../../types/Report";

interface MembershipDistributionProps {
  data: LoyaltyData[];
}

const MembershipDistribution: React.FC<MembershipDistributionProps> = ({
  data,
}) => {
  // Use the latest month's data for distribution
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  const distributionData = latestData
    ? [
        { name: "Bronze", value: latestData.bronze, color: "#CD7F32" },
        { name: "Silver", value: latestData.silver, color: "#C0C0C0" },
        { name: "Gold", value: latestData.gold, color: "#FFD700" },
        { name: "Platinum", value: latestData.platinum, color: "#E5E4E2" },
      ]
    : [
        { name: "Bronze", value: 0, color: "#CD7F32" },
        { name: "Silver", value: 0, color: "#C0C0C0" },
        { name: "Gold", value: 0, color: "#FFD700" },
        { name: "Platinum", value: 0, color: "#E5E4E2" },
      ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = distributionData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value} members</p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
      <h3 className="text-lg font-semibold mb-4">Membership Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
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
      <div className="mt-4 grid grid-cols-2 gap-4">
        {distributionData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm">
              {item.name}: <strong>{item.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipDistribution;
