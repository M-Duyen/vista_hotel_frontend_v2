/* eslint-disable */
import React, { useState, useMemo, useEffect } from "react";
import {
  FaChartLine,
  FaBed,
  FaStar,
  FaUsers,
  FaCalendarCheck,
  FaConciergeBell,
  FaDoorOpen,
  FaDollarSign,
} from "react-icons/fa";
import type {
  OccupancyData,
  LoyaltyData,
  ReviewData,
  BookingData,
  ReportPeriod,
  ServiceData,
  RevenueData,
  RoomOccupancyData,
} from "../../../types/Report";
import OccupancyChart from "../../../components/report/OccupancyChart";
import RoomTypeAnalysis from "../../../components/report/RoomTypeAnalysis";
import LoyaltyChart from "../../../components/report/LoyaltyChart";
import MembershipDistribution from "../../../components/report/MembershipDistribution";
import ReviewChart from "../../../components/report/ReviewChart";
import RatingBreakdown from "../../../components/report/RatingBreakdown";
import SentimentAnalysis from "../../../components/report/SentimentAnalysis";
import BookingTrends from "../../../components/report/BookingTrends";
import BookingChart from "../../../components/report/BookingChart";
import DateRangePicker from "../../../components/report/DateRangePicker";
import FilterBar from "../../../components/report/FilterBar";
import ExportButton from "../../../components/report/ExportButton";
import OccupancyStats from "../../../components/report/OccupancyStats";
import ServiceSummary from "../../../components/report/ServiceSummary";
import ServiceChart from "../../../components/report/ServiceChart";
import ServiceDistribution from "../../../components/report/ServiceDistribution";
import PopularServices from "../../../components/report/PopularServices";
import { reportService } from "../../../services/reportService";
import { getRevenueData } from "../../../services/revenueReportService";
import { formatVnd } from "../../../components/report/serviceReportUtils";
import LoyaltySummary from "../../../components/report/LoyaltySummary";
import {
  exportLoyaltyToPDF,
  exportLoyaltyToExcel,
} from "../../../utils/exportUtils";
import RevenueTab from "./components/RevenueTab";
import LoyaltyTab from "./components/LoyaltyTab";
import BookingsTab from "./components/BookingsTab";

import {
  getCategoryRatings,
  getRatingTrend,
  getSentimentStats,
} from "../../../services/reviewService";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
type ReportTab =
  | "revenue"
  | "occupancy"
  | "loyalty"
  | "reviews"
  | "bookings"
  | "services";

const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [period, setPeriod] = useState<ReportPeriod>("monthly");

  // Get current date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentDay = String(today.getDate()).padStart(2, "0");
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [isLoadingServiceData, setIsLoadingServiceData] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [occupancyData, setOccupancyData] = useState<RoomOccupancyData[]>([]);
  const [isLoadingOccupancy, setIsLoadingOccupancy] = useState(false);

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueLoading, setRevenueLoading] = useState<boolean>(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  const [reviewTrend, setReviewTrend] = useState([]);
  const [categoryRatings, setCategoryRatings] = useState(null);
  const [sentimentStats, setSentimentStats] = useState(null);

  // Auto update date range when period changes
  useEffect(() => {
    if (!showDateFilter) {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (period) {
        case "daily":
          start = today;
          end = today;
          break;
        case "weekly":
          start.setDate(today.getDate() - 6);
          end = today;
          break;
        case "monthly":
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = today;
          break;
        case "quarterly":
          const quarter = Math.floor(today.getMonth() / 3);
          start = new Date(today.getFullYear(), quarter * 3, 1);
          end = today;
          break;
        case "yearly":
          start = new Date(today.getFullYear(), 0, 1);
          end = today;
          break;
      }

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  }, [period, showDateFilter]);

  // Fetch service report data from API
  useEffect(() => {
    if (activeTab === "services") {
      fetchServiceReport();
    }
  }, [activeTab, startDate, endDate, period]);
  // Fetch service report data from API
  useEffect(() => {
    if (activeTab === "occupancy") {
      fetchOccupancyReport();
    }
  }, [activeTab, startDate, endDate, period]);

  const fetchServiceReport = async () => {
    try {
      setIsLoadingServiceData(true);
      const data = await reportService.getServiceReport(
        startDate,
        endDate,
        period
      );
      setServiceData(data);
    } catch (error) {
      console.error("Error fetching service report:", error);
    } finally {
      setIsLoadingServiceData(false);
    }
  };

  const fetchOccupancyReport = async () => {
    try {
      setIsLoadingOccupancy(true);
      const data = await reportService.getRoomOccupancyReport(
        startDate,
        endDate,
        period.toUpperCase()
      );
      setOccupancyData(data);
    } catch (error) {
      console.error("Error fetching occupancy report:", error);
    } finally {
      setIsLoadingOccupancy(false);
    }
  };

  useEffect(() => {
    const fetchRevenue = async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const data = await getRevenueData();
        setRevenueData(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setRevenueError(e?.message || "Failed to load revenue data");
        setRevenueData([]);
      } finally {
        setRevenueLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  // Mock data - Reviews
  useEffect(() => {
    // Load line chart
    getRatingTrend().then((res) => {
      // Backend returns: [{month: "2024-06", avgRating: 4.65}]
      setReviewTrend(res || []);
    });

    // Load bar chart
    getCategoryRatings().then((res) => {
      setCategoryRatings(res);
    });

    // Load pie chart
    getSentimentStats().then((res) => {
      setSentimentStats(res);
    });
  }, []);

  const tabs = [
    {
      id: "revenue" as ReportTab,
      label: "Revenue Report",
      icon: <FaChartLine />,
      color: "#CCBDA3",
    },
    {
      id: "occupancy" as ReportTab,
      label: "Occupancy Report",
      icon: <FaBed />,
      color: "#2196F3",
    },
    {
      id: "loyalty" as ReportTab,
      label: "Loyalty Report",
      icon: <FaUsers />,
      color: "#FFD700",
    },
    {
      id: "reviews" as ReportTab,
      label: "Review Report",
      icon: <FaStar />,
      color: "#FF9800",
    },
    {
      id: "bookings" as ReportTab,
      label: "Booking Report",
      icon: <FaCalendarCheck />,
      color: "#00C853",
    },
    {
      id: "services" as ReportTab,
      label: "Service Report",
      icon: <FaConciergeBell />,
      color: "#9B59B6",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "revenue":
        return (
          <RevenueTab
            startDate={startDate}
            endDate={endDate}
            period={period}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPeriodChange={setPeriod}
            activeTab={activeTab}
          />
        );

      case "occupancy":
        return (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBE3D7]">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <FilterBar
                  period={period}
                  onPeriodChange={setPeriod}
                  showDateFilter={showDateFilter}
                  setShowDateFilter={setShowDateFilter}
                />
                {showDateFilter && (
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                )}
                <ExportButton activeTab={activeTab} />
              </div>
            </div>

            {isLoadingOccupancy ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-[#CCBDA3] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : occupancyData.length === 0 ? (
              <div className="bg-white p-12 rounded-lg shadow-sm border border-[#EBE3D7] text-center">
                <p className="text-gray-500 text-lg">
                  Không có dữ liệu trong khoảng thời gian này
                </p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
                  <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">
                        Average Occupancy
                      </h3>
                      <div className="p-2 bg-[#CCBDA3]/10 rounded-lg">
                        <FaChartLine className="w-5 h-5 text-[#CCBDA3]" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {(
                        occupancyData.reduce(
                          (sum, item) => sum + item.occupancyRate,
                          0
                        ) / occupancyData.length
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Average for period
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">
                        Total Booked Rooms
                      </h3>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <FaBed className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {occupancyData.reduce(
                        (sum, item) => sum + item.bookedRooms,
                        0
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Out of {occupancyData[0]?.totalRooms || 0} rooms
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">
                        Average Rate
                      </h3>
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FaDoorOpen className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatVnd(
                        occupancyData.reduce(
                          (sum, item) => sum + item.averageRate,
                          0
                        ) / occupancyData.length
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Per room per night
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </h3>
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <FaDollarSign className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatVnd(
                        occupancyData.reduce(
                          (sum, item) => sum + item.totalRevenue,
                          0
                        )
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Revenue from rooms
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Room Occupancy Chart
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBE3D7" />
                      <XAxis dataKey="period" stroke="#6B7280" />
                      <YAxis yAxisId="left" stroke="#6B7280" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6B7280"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFF",
                          border: "1px solid #EBE3D7",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="totalRooms"
                        fill="#D4C5B0"
                        name="Total Rooms"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="bookedRooms"
                        fill="#CCBDA3"
                        name="Booked Rooms"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="occupancyRate"
                        stroke="#B8935F"
                        strokeWidth={3}
                        name="Occupancy (%)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-[#EBE3D7]">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Room Occupancy Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-[#F5F0EB] border-b border-[#EBE3D7]">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-semibold">
                            Period
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center font-semibold"
                          >
                            Total Rooms
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center font-semibold"
                          >
                            Booked Rooms
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center font-semibold"
                          >
                            Occupancy (%)
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right font-semibold"
                          >
                            Avg Rate
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right font-semibold"
                          >
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupancyData.map((item, index) => (
                          <tr
                            key={index}
                            className="bg-white border-b border-[#EBE3D7] hover:bg-[#F5F0EB] transition"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                              {item.period}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.totalRooms}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.bookedRooms}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`font-semibold px-2 py-1 rounded ${
                                  item.occupancyRate >= 80
                                    ? "bg-green-50 text-green-600"
                                    : item.occupancyRate >= 60
                                    ? "bg-blue-50 text-blue-600"
                                    : item.occupancyRate >= 40
                                    ? "bg-yellow-50 text-yellow-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {item.occupancyRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-700">
                              {formatVnd(item.averageRate)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-[#B8935F]">
                              {formatVnd(item.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">≥ 80%: Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">60-79%: Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-600">40-59%: Average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">&lt; 40%: Low</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case "loyalty":
        return (
          <LoyaltyTab
            startDate={startDate}
            endDate={endDate}
            period={period}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPeriodChange={setPeriod}
            activeTab={activeTab}
          />
        );
      case "reviews":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
              <h3 className="text-lg font-semibold mb-4">
                Average Rating Over Time
              </h3>
              {reviewTrend && reviewTrend.length > 0 ? (
                <ReviewChart data={reviewTrend} />
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-400">
                  No rating data available
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RatingBreakdown data={categoryRatings} />
              <SentimentAnalysis data={sentimentStats} />
            </div>
          </div>
        );

      case "bookings":
        return (
          <BookingsTab
            startDate={startDate}
            endDate={endDate}
            period={period}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPeriodChange={setPeriod}
            activeTab={activeTab}
          />
        );

      case "services":
        return (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBE3D7] mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterBar
                    period={period}
                    onPeriodChange={setPeriod}
                    showDateFilter={false}
                    onToggleDateFilter={undefined}
                  />

                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                      showDateFilter
                        ? "bg-[#B8935F] text-white hover:bg-[#9A7A4D]"
                        : "bg-white text-gray-700 border border-[#EBE3D7] hover:bg-[#F5F0EB]"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Date Filter
                  </button>

                  {showDateFilter && (
                    <DateRangePicker
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                    />
                  )}
                </div>

                <ExportButton
                  reportType={activeTab}
                  dateRange={{ startDate, endDate }}
                  data={activeTab === "services" ? serviceData : undefined}
                />
              </div>
            </div>

            {/* Service Content */}
            <div className="space-y-6">
              {isLoadingServiceData ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCBDA3]"></div>
                </div>
              ) : serviceData.length > 0 ? (
                <>
                  <ServiceSummary data={serviceData} />

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
                    <h3 className="text-lg font-semibold mb-4">
                      Service Revenue Trends
                    </h3>
                    <ServiceChart data={serviceData} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ServiceDistribution data={serviceData} />
                    <PopularServices data={serviceData} />
                  </div>
                </>
              ) : (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-[#EBE3D7] text-center">
                  <p className="text-gray-500">
                    No service data available for the selected period
                  </p>
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0EB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-playfair font-bold mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into hotel performance
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-[#EBE3D7] mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#CCBDA3] text-[#CCBDA3]"
                    : "border-transparent text-gray-600 hover:text-[#CCBDA3]"
                }`}
              >
                <span
                  style={{
                    color: activeTab === tab.id ? tab.color : "inherit",
                  }}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ReportPage;
