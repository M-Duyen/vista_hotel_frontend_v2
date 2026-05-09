import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LoyaltyData } from "../../../types/Report";

interface PointsRedemptionProps {
  data: LoyaltyData[];
}

const PointsRedemption: React.FC<PointsRedemptionProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-[#CCBDA3]">
            Points Earned: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-[#2196F3]">
            Points Redeemed: {payload[1].value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Redemption Rate:{" "}
            {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
      <h3 className="text-lg font-semibold mb-4">Points Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalPoints"
            stroke="#CCBDA3"
            strokeWidth={2}
            name="Points Earned"
            dot={{ fill: "#CCBDA3", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="redemptions"
            stroke="#2196F3"
            strokeWidth={2}
            name="Points Redeemed"
            dot={{ fill: "#2196F3", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PointsRedemption;
