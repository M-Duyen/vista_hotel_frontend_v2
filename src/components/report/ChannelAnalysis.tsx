import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { FaGlobe, FaPhone, FaWalking } from "react-icons/fa";

const ChannelAnalysis: React.FC = () => {
  const channelData = [
    { name: "Website", value: 1250, color: "#CCBDA3", icon: <FaGlobe /> },
    { name: "Phone", value: 480, color: "#2196F3", icon: <FaPhone /> },
    { name: "Walk-in", value: 220, color: "#00C853", icon: <FaWalking /> },
  ];

  const total = channelData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value} bookings</p>
          <p className="text-sm text-gray-600">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
      <h3 className="text-lg font-semibold mb-4">Bookings by Channel</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={channelData}
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
            {channelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {channelData.map((item, index) => (
          <div
            key={index}
            className="text-center p-4 rounded-lg border border-[#EBE3D7]"
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
              {((item.value / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelAnalysis;
