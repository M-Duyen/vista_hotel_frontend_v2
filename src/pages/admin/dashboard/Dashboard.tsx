import React, { useState, useEffect } from "react";
import {
  FaBed,
  FaUsers,
  FaCalendarCheck,
  FaDollarSign,
  FaChartLine,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaHotel,
  FaClock,
  FaUserTie,
} from "react-icons/fa";
import {
  MdRoomService,
  MdCheckCircle,
  MdPending,
  MdCancel,
} from "react-icons/md";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { getDashboardStats } from "../../../services/reportService";

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  occupancyRate: number;
  occupancyChange: number;
  totalGuests: number;
  guestsChange: number;
  availableRooms: number;
  bookedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  avgRating: number;
  totalReviews: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface RoomTypeData {
  name: string;
  count: number;
  color: string;
}

interface BookingStatusData {
  status: string;
  count: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    totalBookings: 0,
    bookingsChange: 0,
    occupancyRate: 0,
    occupancyChange: 0,
    totalGuests: 0,
    guestsChange: 0,
    availableRooms: 0,
    bookedRooms: 0,
    maintenanceRooms: 0,
    cleaningRooms: 0,
    avgRating: 0,
    totalReviews: 0,
    pendingCheckIns: 0,
    pendingCheckOuts: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<RoomTypeData[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState<
    BookingStatusData[]
  >([]);
  const [dailyOccupancy, setDailyOccupancy] = useState<any[]>([]);
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();

      setStats(data);
      setRevenueData(data.revenueData || []);
      setDailyOccupancy(data.dailyOccupancy || []);

      const roomColors = ["#CCBDA3", "#B8A87F", "#9B8B6B", "#7D6E54"];
      setRoomTypeData(
        (data.roomTypeData || []).map((item, index) => ({
          ...item,
          color: roomColors[index % roomColors.length],
        }))
      );

      // Transform booking status data with colors
      const statusColors: Record<string, string> = {
        CHECKED_OUT: "#2196F3",
        CHECKED_IN: "#4CAF50",
        PENDING: "#FFC107",
        CANCELLED: "#F44336",
      };
      setBookingStatusData(
        (data.bookingStatusData || []).map((item) => ({
          status: item.status,
          count: item.count,
          color: statusColors[item.status] || "#999",
        }))
      );

      setPopularServices(data.popularServices || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({
    icon,
    title,
    value,
    change,
    suffix = "",
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    change?: number;
    suffix?: string;
    color: string;
  }) => {
    const isPositive = change ? change > 0 : true;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7] hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <span style={{ color }} className="text-xl">
                  {icon}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {typeof value === "number" && suffix === "VND"
                ? `${value.toLocaleString("vi-VN")} ${suffix}`
                : `${value}${suffix}`}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <FaArrowUp className="text-green-500 text-sm" />
                ) : (
                  <FaArrowDown className="text-red-500 text-sm" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const RoomStatusCard = () => {
    const total =
      stats.availableRooms +
      stats.bookedRooms +
      stats.maintenanceRooms +
      stats.cleaningRooms;

    const statusData = [
      {
        label: "Available",
        count: stats.availableRooms,
        color: "#4CAF50",
        percentage: (stats.availableRooms / total) * 100,
      },
      {
        label: "Booked",
        count: stats.bookedRooms,
        color: "#2196F3",
        percentage: (stats.bookedRooms / total) * 100,
      },
      {
        label: "Cleaning",
        count: stats.cleaningRooms,
        color: "#FFC107",
        percentage: (stats.cleaningRooms / total) * 100,
      },
      {
        label: "Maintenance",
        count: stats.maintenanceRooms,
        color: "#F44336",
        percentage: (stats.maintenanceRooms / total) * 100,
      },
    ];

    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaHotel className="text-[#CCBDA3]" />
          Room Status Overview
        </h3>
        <div className="space-y-4">
          {statusData.map((status, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {status.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {status.count} rooms
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${status.percentage}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-[#EBE3D7]">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{total}</p>
            <p className="text-sm text-gray-600">Total Rooms</p>
          </div>
        </div>
      </div>
    );
  };
  const QuickActionsCard = () => {
    const actions = [
      {
        icon: <MdCheckCircle />,
        label: "Check-ins Today",
        count: stats.pendingCheckIns,
        color: "#4CAF50",
        link: "/admin/checkin",
      },
      {
        icon: <MdPending />,
        label: "Check-outs Today",
        count: stats.pendingCheckOuts,
        color: "#FF9800",
        link: "/admin/checkout",
      },
      {
        icon: <MdCancel />,
        label: "Maintenance",
        count: stats.maintenanceRooms,
        color: "#F44336",
        link: "/admin/room-management",
      },
      {
        icon: <FaClock />,
        label: "Cleaning Queue",
        count: stats.cleaningRooms,
        color: "#2196F3",
        link: "/admin/room-management",
      },
    ];

    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaUserTie className="text-[#CCBDA3]" />
          Today's Tasks
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-[#EBE3D7] cursor-pointer hover:shadow-md transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <span style={{ color: action.color }} className="text-xl">
                  {action.icon}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{action.count}</p>
              <p className="text-xs text-gray-600 mt-1">{action.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#EBE3D7] rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">
            {payload[0].payload.month || payload[0].payload.day}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {typeof entry.value === "number" && entry.name.includes("Revenue")
                ? `${entry.value.toLocaleString("vi-VN")} VND`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening at Hotel Vista today.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaDollarSign />}
          title="Total Revenue"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          suffix="VND"
          color="#4CAF50"
        />
        <StatCard
          icon={<FaCalendarCheck />}
          title="Total Bookings"
          value={stats.totalBookings}
          change={stats.bookingsChange}
          color="#2196F3"
        />
        <StatCard
          icon={<FaBed />}
          title="Occupancy Rate"
          value={stats.occupancyRate}
          change={stats.occupancyChange}
          suffix="%"
          color="#FF9800"
        />
        <StatCard
          icon={<FaUsers />}
          title="Total Guests"
          value={stats.totalGuests}
          change={stats.guestsChange}
          color="#9C27B0"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <RoomStatusCard />
        <QuickActionsCard />

        {/* Rating Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaStar className="text-[#CCBDA3]" />
            Customer Satisfaction
          </h3>
          <div className="text-center py-4">
            <div className="text-6xl font-bold text-[#CCBDA3] mb-2">
              {stats.avgRating}
            </div>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={
                    star <= Math.floor(stats.avgRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Based on {stats.totalReviews} reviews
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EBE3D7] grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">92%</p>
              <p className="text-xs text-gray-600">Positive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">8%</p>
              <p className="text-xs text-gray-600">Negative</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-[#CCBDA3]" />
            Revenue Trend (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CCBDA3" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#CCBDA3" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#CCBDA3"
                fill="url(#colorRevenue)"
                name="Revenue (VND)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Occupancy */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBed className="text-[#CCBDA3]" />
            Daily Occupancy Rate
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyOccupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#2196F3"
                strokeWidth={3}
                dot={{ fill: "#2196F3", r: 5 }}
                activeDot={{ r: 8 }}
                name="Occupancy (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Type Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4">Room Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomTypeData as any[]}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent = 0 }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={70}
                fill="#8884d8"
                dataKey="count"
              >
                {roomTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) =>
                  `${value} (${entry.payload.count} rooms)`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bookingStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
              <XAxis
                dataKey="status"
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Services */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#EBE3D7]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MdRoomService className="text-[#CCBDA3]" />
            Popular Services
          </h3>
          <div className="space-y-4">
            {popularServices.map((service, index) => (
              <div
                key={index}
                className="border-b border-[#EBE3D7] pb-3 last:border-0"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    {service.name}
                  </span>
                  <span className="text-sm font-bold text-[#CCBDA3]">
                    {service.orders} orders
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#CCBDA3] h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (service.orders /
                            Math.max(...popularServices.map((s) => s.orders))) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {(service.revenue / 1000000).toFixed(1)}M VND
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
