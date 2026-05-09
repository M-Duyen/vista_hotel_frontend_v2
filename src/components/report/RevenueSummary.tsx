import React from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";
import type { RevenueData } from "../../types/Report";

interface RevenueSummaryProps {
  data: RevenueData[];
}

const RevenueSummary: React.FC<RevenueSummaryProps> = ({ data }) => {
  const calculateSummary = () => {
    if (data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalRoomRevenue = data.reduce(
      (sum, item) => sum + item.roomRevenue,
      0
    );
    const totalServiceRevenue = data.reduce(
      (sum, item) => sum + item.serviceRevenue,
      0
    );
    const totalBookings = data.reduce(
      (sum, item) => sum + item.bookingCount,
      0
    );
    const avgRevenuePerBooking = totalRevenue / totalBookings;

    // Calculate growth rate (compare last period with previous period)
    const halfLength = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfLength);
    const secondHalf = data.slice(halfLength);

    const firstHalfRevenue = firstHalf.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );
    const secondHalfRevenue = secondHalf.reduce(
      (sum, item) => sum + item.totalRevenue,
      0
    );
    const growthRate =
      firstHalfRevenue > 0
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalRoomRevenue,
      totalServiceRevenue,
      totalBookings,
      avgRevenuePerBooking,
      growthRate,
    };
  };

  const summary = calculateSummary();

  if (!summary) {
    return (
      <div className="text-center text-gray-500 py-8">No data available</div>
    );
  }

  const summaryCards = [
    {
      icon: <FaMoneyBillWave />,
      iconColor: "#00C853",
      bgColor: "rgba(0, 200, 83, 0.1)",
      title: "Total Revenue",
      value: `${summary.totalRevenue.toLocaleString("vi-VN")} VND`,
      subtitle: `Room: ${summary.totalRoomRevenue.toLocaleString("vi-VN")} VND`,
    },
    {
      icon: <FaChartLine />,
      iconColor: summary.growthRate >= 0 ? "#00C853" : "#F44336",
      bgColor:
        summary.growthRate >= 0
          ? "rgba(0, 200, 83, 0.1)"
          : "rgba(244, 67, 54, 0.1)",
      title: "Growth Rate",
      value: `${summary.growthRate >= 0 ? "+" : ""}${summary.growthRate.toFixed(
        1
      )}%`,
      subtitle: "vs previous period",
      trend: summary.growthRate >= 0 ? <FaArrowUp /> : <FaArrowDown />,
    },
    {
      icon: <FaMoneyBillWave />,
      iconColor: "#2196F3",
      bgColor: "rgba(33, 150, 243, 0.1)",
      title: "Service Revenue",
      value: `${summary.totalServiceRevenue.toLocaleString("vi-VN")} VND`,
      subtitle: `${(
        (summary.totalServiceRevenue / summary.totalRevenue) *
        100
      ).toFixed(1)}% of total`,
    },
    {
      icon: <FaChartLine />,
      iconColor: "#FF9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
      title: "Avg Revenue/Booking",
      value: `${summary.avgRevenuePerBooking.toLocaleString("vi-VN")} VND`,
      subtitle: `From ${summary.totalBookings} bookings`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-lg shadow-sm border border-[#EBE3D7]"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: card.bgColor }}
            >
              <span style={{ color: card.iconColor }} className="text-xl">
                {card.icon}
              </span>
            </div>
            {card.trend && (
              <span style={{ color: card.iconColor }} className="text-lg">
                {card.trend}
              </span>
            )}
          </div>
          <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold mb-1">{card.value}</p>
          <p className="text-xs text-gray-500">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default RevenueSummary;
