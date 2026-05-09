import React, { useEffect, useState } from "react";
import type { ReportPeriod, LoyaltyData } from "../../../../types/Report";
import DateRangePicker from "../../../../components/report/DateRangePicker";
import FilterBar from "../../../../components/report/FilterBar";
import LoyaltySummary from "../../../../components/report/LoyaltySummary";
import LoyaltyChart from "../../../../components/report/LoyaltyChart";
import MembershipDistribution from "../../../../components/report/MembershipDistribution";
import { reportService } from "../../../../services/reportService";
import {
  exportLoyaltyToPDF,
  exportLoyaltyToExcel,
} from "../../../../utils/exportUtils";
import { FaDownload, FaFilePdf, FaFileExcel } from "react-icons/fa";

type Props = {
  startDate: string;
  endDate: string;
  period: ReportPeriod;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onPeriodChange: (p: ReportPeriod) => void;
  activeTab: "loyalty";
};

const LoyaltyTab: React.FC<Props> = ({
  startDate,
  endDate,
  period,
  onStartDateChange,
  onEndDateChange,
  onPeriodChange,
}) => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Fetch loyalty data
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reportService.getLoyaltyReport(
          startDate,
          endDate,
          period.toUpperCase()
        );
        setLoyaltyData(data);
      } catch (err) {
        console.error("Failed to fetch loyalty report:", err);
        setError("Failed to load loyalty data.");
        setLoyaltyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [startDate, endDate, period]);

  // Handle export
  const handleExport = (format: "pdf" | "excel") => {
    const dateRangeText = `${startDate} to ${endDate}`;

    if (format === "pdf") {
      exportLoyaltyToPDF(loyaltyData, dateRangeText);
    } else {
      exportLoyaltyToExcel(loyaltyData, dateRangeText);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBE3D7]">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterBar
              period={period}
              onPeriodChange={onPeriodChange}
              showDateFilter={showDateFilter}
              onToggleDateFilter={() => setShowDateFilter(!showDateFilter)}
            />
          </div>

          {showDateFilter && (
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
            />
          )}

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-all"
              disabled={loading || loyaltyData.length === 0}
            >
              <FaDownload />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <FaFilePdf className="text-red-500" />
                  <span>Export as PDF</span>
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t"
                >
                  <FaFileExcel className="text-green-500" />
                  <span>Export as Excel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-blue-700 font-medium">Loading loyalty data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-yellow-700 font-medium">{error}</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && loyaltyData.length > 0 && (
        <>
          {/* Summary Statistics */}
          <LoyaltySummary data={loyaltyData} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EBE3D7]">
              <h3 className="text-lg font-semibold mb-4">
                Membership Growth Trend
              </h3>
              <LoyaltyChart data={loyaltyData} />
            </div>
            <MembershipDistribution data={loyaltyData} />
          </div>
        </>
      )}

      {/* No Data State */}
      {!loading && loyaltyData.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            No loyalty data available for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyTab;
