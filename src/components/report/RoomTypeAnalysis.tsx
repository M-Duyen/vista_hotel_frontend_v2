import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RoomTypeAnalysis: React.FC = () => {
  const roomTypeData = [
    { roomType: "Standard", occupancyRate: 85.5, totalRooms: 50, occupied: 43 },
    { roomType: "Deluxe", occupancyRate: 78.3, totalRooms: 30, occupied: 23 },
    { roomType: "Suite", occupancyRate: 65.2, totalRooms: 15, occupied: 10 },
    { roomType: "Premium", occupancyRate: 92.0, totalRooms: 10, occupied: 9 },
  ];

  const COLORS = ["#CCBDA3", "#2196F3", "#00C853", "#FF9800"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{data.roomType}</p>
          <p className="text-sm">Occupancy: {data.occupancyRate}%</p>
          <p className="text-sm text-gray-600">
            Occupied: {data.occupied} / {data.totalRooms} rooms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
      <h3 className="text-lg font-semibold mb-4">Occupancy by Room Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={roomTypeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
          <XAxis dataKey="roomType" stroke="#666" />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="occupancyRate" name="Occupancy Rate (%)">
            {roomTypeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RoomTypeAnalysis;
