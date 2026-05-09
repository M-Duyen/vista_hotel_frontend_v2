import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { OccupancyData } from "../../../types/Report";

interface OccupancyChartProps {
  data: OccupancyData[];
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.date}</p>
          <p className="text-sm text-[#CCBDA3]">
            Occupancy Rate: {payload[0].value.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Occupied: {payload[0].payload.occupiedRooms} /{" "}
            {payload[0].payload.totalRooms} rooms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#CCBDA3" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#CCBDA3" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          stroke="#666"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="occupancyRate"
          stroke="#CCBDA3"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorOccupancy)"
          name="Occupancy Rate (%)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default OccupancyChart;
