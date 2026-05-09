import React, { useEffect, useState } from 'react';
import type { ReportPeriod, RevenueData } from '../../../../types/Report';
import DateRangePicker from '../../../../components/report/DateRangePicker';
import FilterBar from '../../../../components/report/FilterBar';
import RevenueSummary from '../../../../components/report/RevenueSummary';
import RevenueChart from '../../../../components/report/RevenueChart';
import {
    getRevenueByDateRange,
    getDailyCurrentMonth,
    getWeeklyCurrentMonth,
    getMonthlyInYear,
    getQuarterlyInYear,
    getYearlyRevenue,
} from '../../../../services/revenueReportService';
import {
    generateRevenueReportPdf,
    generateRevenueReportExcel,
} from '../../../../utils/revenueReportPdf';
import { FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';

type Props = {
    startDate: string;
    endDate: string;
    period: ReportPeriod;
    onStartDateChange: (d: string) => void;
    onEndDateChange: (d: string) => void;
    onPeriodChange: (p: ReportPeriod) => void;
    activeTab: 'revenue';
};

type ChartType = 'line' | 'bar' | 'area';

const RevenueTab: React.FC<Props> = ({
    startDate,
    endDate,
    period,
    onStartDateChange,
    onEndDateChange,
    onPeriodChange,
    activeTab,
}) => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [revenueLoading, setRevenueLoading] = useState<boolean>(false);
    const [revenueError, setRevenueError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<ChartType>('area');
    const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

    // Effective period for UI when Date Filter is on (force to daily view)
    const effectivePeriod: ReportPeriod = showDateFilter ? 'daily' : period;

    // Fetch revenue data khi period hoặc các params thay đổi
    useEffect(() => {
        const fetchRevenue = async () => {
            setRevenueLoading(true);
            setRevenueError(null);
            try {
                let data: RevenueData[];

                if (showDateFilter && startDate && endDate) {
                    const raw = await getRevenueByDateRange(startDate, endDate);

                    data = raw.map((item: any) => ({
                        ...item,
                        label: `${item.day}-${item.month}-${item.year}`,
                    }));
                } else {
                    // Gọi API tương ứng với period
                    switch (period) {
                        case 'daily':
                            data = await getDailyCurrentMonth();
                            break;
                        case 'weekly':
                            data = await getWeeklyCurrentMonth();
                            break;
                        case 'monthly':
                            data = await getMonthlyInYear(selectedYear);
                            break;
                        case 'quarterly':
                            data = await getQuarterlyInYear(selectedYear);
                            break;
                        case 'yearly':
                            data = await getYearlyRevenue();
                            break;
                        default:
                            data = await getDailyCurrentMonth();
                    }
                }

                const processedData = Array.isArray(data) ? data : [];
                console.log('Processed data for chart:', processedData);
                setRevenueData(processedData);
            } catch (e: any) {
                console.error('Error fetching revenue:', e);
                setRevenueError(e?.message || 'Failed to load revenue data');
                setRevenueData([]);
            } finally {
                setRevenueLoading(false);
            }
        };
        fetchRevenue();
    }, [startDate, endDate, period, showDateFilter, selectedYear]);

    // Get user from localStorage
    const getUserFullName = (): string => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.fullName || user.userName || 'System Admin';
            }
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }
        return 'System Admin';
    };

    const handleExportPdf = () => {
        if (revenueData.length === 0) {
            alert('No data to export');
            return;
        }

        generateRevenueReportPdf({
            data: revenueData,
            startDate,
            endDate,
            period: showDateFilter ? 'daily' : period,
            preparedBy: getUserFullName(),
        });
        setShowExportMenu(false);
    };

    const handleExportExcel = async () => {
        if (revenueData.length === 0) {
            alert('No data to export');
            return;
        }

        await generateRevenueReportExcel({
            data: revenueData,
            startDate,
            endDate,
            period: showDateFilter ? 'daily' : period,
            preparedBy: getUserFullName(),
        });
        setShowExportMenu(false);
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBE3D7]">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Khi bật Date Filter, ẩn/khóa thay đổi period để đảm bảo hiển thị daily */}
                        <FilterBar
                            period={period}
                            onPeriodChange={onPeriodChange}
                        />

                        {/* Year selector for monthly/quarterly */}
                        {(period === 'monthly' || period === 'quarterly') &&
                            !showDateFilter && (
                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(Number(e.target.value))
                                    }
                                    className="px-4 py-2 rounded-md border border-[#EBE3D7] bg-white text-gray-700 font-medium hover:bg-[#F5F0EB] transition"
                                >
                                    {Array.from(
                                        { length: 5 },
                                        (_, i) => new Date().getFullYear() - i,
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            )}

                        <button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                                showDateFilter
                                    ? 'bg-[#B8935F] text-white hover:bg-[#9A7A4D]'
                                    : 'bg-white text-gray-700 border border-[#EBE3D7] hover:bg-[#F5F0EB]'
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
                                onStartDateChange={onStartDateChange}
                                onEndDateChange={onEndDateChange}
                            />
                        )}
                    </div>

                    {/* Export Dropdown Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={
                                revenueData.length === 0 || revenueLoading
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                                revenueData.length === 0 || revenueLoading
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#CCBDA3] text-white hover:bg-[#b8ac94]'
                            }`}
                        >
                            <FaDownload className="h-4 w-4" />
                            Export Report
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#EBE3D7] z-10">
                                <button
                                    onClick={handleExportPdf}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F0EB] transition text-left"
                                >
                                    <FaFilePdf className="text-red-500" />
                                    <span>Export as PDF</span>
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F0EB] transition border-t border-[#EBE3D7] text-left"
                                >
                                    <FaFileExcel className="text-green-600" />
                                    <span>Export as Excel</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading & Error */}
            {revenueLoading && (
                <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                    <span>Loading revenue data...</span>
                </div>
            )}
            {revenueError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {revenueError}
                </div>
            )}

            {/* Empty State */}
            {!revenueLoading && !revenueError && revenueData.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 text-gray-500 px-6 py-12 rounded-lg text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <p className="text-lg font-medium">
                        No revenue data available
                    </p>
                    <p className="text-sm mt-1">
                        Please select a date range to view revenue data
                    </p>
                </div>
            )}

            {/* Revenue Summary & Chart */}
            {!revenueLoading && revenueData.length > 0 && (
                <>
                    <RevenueSummary data={revenueData} />

                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Revenue Trends
                                </h3>
                                {/* Khi bật Date Filter, tiêu đề hiển thị Daily view với khoảng ngày */}
                                <p className="text-sm text-gray-500 mt-1">
                                    {showDateFilter
                                        ? 'Daily'
                                        : effectivePeriod
                                              .charAt(0)
                                              .toUpperCase() +
                                          effectivePeriod.slice(1)}{' '}
                                    view
                                    {startDate && endDate
                                        ? ` • ${startDate} to ${endDate}`
                                        : ''}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                        chartType === 'line'
                                            ? 'bg-[#CCBDA3] text-white shadow'
                                            : 'border border-[#EBE3D7] hover:bg-[#F5F0EB]'
                                    }`}
                                >
                                    Line
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                        chartType === 'bar'
                                            ? 'bg-[#CCBDA3] text-white shadow'
                                            : 'border border-[#EBE3D7] hover:bg-[#F5F0EB]'
                                    }`}
                                >
                                    Bar
                                </button>
                                <button
                                    onClick={() => setChartType('area')}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                        chartType === 'area'
                                            ? 'bg-[#CCBDA3] text-white shadow'
                                            : 'border border-[#EBE3D7] hover:bg-[#F5F0EB]'
                                    }`}
                                >
                                    Area
                                </button>
                            </div>
                        </div>
                        <RevenueChart
                            data={revenueData}
                            chartType={chartType}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default RevenueTab;
