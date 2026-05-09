import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { RevenueData } from "../../types/Report";

interface RevenueChartProps {
  data: RevenueData[];
  chartType?: "line" | "bar" | "area";
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  chartType = "area",
}) => {
  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString("vi-VN")} VND
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis tickFormatter={formatCurrency} stroke="#666" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="roomRevenue"
            stroke="#CCBDA3"
            strokeWidth={2}
            name="Room Revenue"
            dot={{ fill: "#CCBDA3", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="serviceRevenue"
            stroke="#2196F3"
            strokeWidth={2}
            name="Service Revenue"
            dot={{ fill: "#2196F3", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="totalRevenue"
            stroke="#00C853"
            strokeWidth={3}
            name="Total Revenue"
            dot={{ fill: "#00C853", r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis tickFormatter={formatCurrency} stroke="#666" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="roomRevenue" fill="#CCBDA3" name="Room Revenue" />
          <Bar dataKey="serviceRevenue" fill="#2196F3" name="Service Revenue" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRoom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#CCBDA3" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#CCBDA3" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorService" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis tickFormatter={formatCurrency} stroke="#666" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="roomRevenue"
          stroke="#CCBDA3"
          fillOpacity={1}
          fill="url(#colorRoom)"
          name="Room Revenue"
        />
        <Area
          type="monotone"
          dataKey="serviceRevenue"
          stroke="#2196F3"
          fillOpacity={1}
          fill="url(#colorService)"
          name="Service Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
