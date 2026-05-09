import React from "react";
import { FaCalendar } from "react-icons/fa";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <FaCalendar className="text-[#CCBDA3]" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
        />
      </div>
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        min={startDate}
        className="px-3 py-2 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
      />
    </div>
  );
};

export default DateRangePicker;
