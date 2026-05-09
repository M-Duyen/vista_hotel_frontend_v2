import React from "react";
import {
  FaCalendarCheck,
  FaTimesCircle,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";
import type { BookingData } from "../../types/Report";

interface BookingTrendsProps {
  data: BookingData[];
}

const BookingTrends: React.FC<BookingTrendsProps> = ({ data }) => {
  // Calculate totals
  const totalBookings = data.reduce((sum, item) => sum + item.totalBookings, 0);
  const totalCompleted = data.reduce(
    (sum, item) => sum + item.completedBookings,
    0
  );
  const totalCancelled = data.reduce(
    (sum, item) => sum + item.cancelledBookings,
    0
  );
  const avgCancellationRate =
    data.reduce((sum, item) => sum + item.cancellationRate, 0) / data.length;
  const avgBookingValue =
    data.reduce((sum, item) => sum + item.averageBookingValue, 0) / data.length;
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings.toLocaleString(),
      icon: <FaCalendarCheck />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Completed Bookings",
      value: totalCompleted.toLocaleString(),
      icon: <FaCheckCircle />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Cancelled Bookings",
      value: totalCancelled.toLocaleString(),
      icon: <FaTimesCircle />,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Avg Cancellation Rate",
      value: `${avgCancellationRate.toFixed(1)}%`,
      icon: <FaChartLine />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div
                className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Average Booking Value */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Average Booking Value
            </p>
            <p className="text-2xl font-bold text-[#CCBDA3]">
              {formatCurrency(avgBookingValue)}
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              Total Revenue:{" "}
              <span className="font-semibold">
                {formatCurrency(totalRevenue)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTrends;
