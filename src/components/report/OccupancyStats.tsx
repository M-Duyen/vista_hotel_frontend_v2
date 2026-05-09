import React from "react";
import { FaBed, FaPercentage, FaTrophy, FaChartBar } from "react-icons/fa";
import type { OccupancyData } from "../../../types/Report";

interface OccupancyStatsProps {
  data: OccupancyData[];
}

const OccupancyStats: React.FC<OccupancyStatsProps> = ({ data }) => {
  const calculateStats = () => {
    if (data.length === 0) return null;

    const avgOccupancy =
      data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length;
    const maxOccupancy = Math.max(...data.map((item) => item.occupancyRate));
    const minOccupancy = Math.min(...data.map((item) => item.occupancyRate));
    const totalRooms = data[0]?.totalRooms || 0;
    const avgOccupiedRooms =
      data.reduce((sum, item) => sum + item.occupiedRooms, 0) / data.length;

    return {
      avgOccupancy,
      maxOccupancy,
      minOccupancy,
      totalRooms,
      avgOccupiedRooms,
    };
  };

  const stats = calculateStats();

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">No data available</div>
    );
  }

  const statCards = [
    {
      icon: <FaPercentage />,
      iconColor: "#CCBDA3",
      bgColor: "rgba(204, 189, 163, 0.1)",
      title: "Average Occupancy",
      value: `${stats.avgOccupancy.toFixed(1)}%`,
      subtitle: `${stats.avgOccupiedRooms.toFixed(0)} rooms on average`,
    },
    {
      icon: <FaTrophy />,
      iconColor: "#00C853",
      bgColor: "rgba(0, 200, 83, 0.1)",
      title: "Peak Occupancy",
      value: `${stats.maxOccupancy.toFixed(1)}%`,
      subtitle: "Highest rate achieved",
    },
    {
      icon: <FaBed />,
      iconColor: "#2196F3",
      bgColor: "rgba(33, 150, 243, 0.1)",
      title: "Total Rooms",
      value: stats.totalRooms.toString(),
      subtitle: "Available inventory",
    },
    {
      icon: <FaChartBar />,
      iconColor: "#FF9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
      title: "Lowest Occupancy",
      value: `${stats.minOccupancy.toFixed(1)}%`,
      subtitle: "Minimum rate recorded",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-lg shadow-sm border border-[#EBE3D7]"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: card.bgColor }}
          >
            <span style={{ color: card.iconColor }} className="text-xl">
              {card.icon}
            </span>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold mb-1">{card.value}</p>
          <p className="text-xs text-gray-500">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default OccupancyStats;
