import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BookingData } from "../../types/Report";

interface BookingChartProps {
  data: BookingData[];
}

const BookingChart: React.FC<BookingChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-[#EBE3D7]">
          <p className="font-semibold mb-2">{payload[0].payload.period}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === "Cancellation Rate" ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="period" stroke="#6B7280" />
        <YAxis yAxisId="left" stroke="#6B7280" />
        <YAxis yAxisId="right" orientation="right" stroke="#EF4444" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="completedBookings"
          name="Completed Bookings"
          fill="#10B981"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="cancelledBookings"
          name="Cancelled Bookings"
          fill="#EF4444"
          radius={[8, 8, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cancellationRate"
          name="Cancellation Rate"
          stroke="#F59E0B"
          strokeWidth={3}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BookingChart;
