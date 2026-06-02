import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date | null; // Ngày tối thiểu có thể chọn
  maxDate?: Date | null; // Ngày tối đa có thể chọn (nếu cần)
  excludedDates?: Date[]; // Các ngày đã được đặt (disable)
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  minDate = null,
  maxDate = null,
  excludedDates = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const sundayFirstDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();
    return (sundayFirstDay + 6) % 7;
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) {
      return;
    }

    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(newDate);
  };

  // Kiểm tra xem ngày có bị disabled không
  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Reset giờ về 00:00:00 để so sánh chính xác ngày
    date.setHours(0, 0, 0, 0);

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (date > max) return true;
    }

    // Kiểm tra nếu ngày nằm trong excludedDates
    if (excludedDates && excludedDates.length > 0) {
      const isExcluded = excludedDates.some((excludedDate) => {
        const excluded = new Date(excludedDate);
        excluded.setHours(0, 0, 0, 0);
        return date.getTime() === excluded.getTime();
      });
      if (isExcluded) return true;
    }

    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className="w-full">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex gap-2 flex-1">
          <select
            value={currentMonth.getMonth()}
            onChange={handleMonthChange}
            className="px-3 py-1.5 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8] bg-white"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={handleYearChange}
            className="px-3 py-1.5 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8] bg-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const disabled = day ? isDateDisabled(day) : true;
          return (
            <button
              key={index}
              onClick={() => day && handleDateClick(day)}
              disabled={!day || disabled}
              className={`aspect-square flex items-center justify-center text-sm font-medium rounded transition ${
                !day
                  ? "text-gray-300 cursor-default"
                  : disabled
                  ? "text-gray-300 cursor-not-allowed bg-gray-50"
                  : isDateSelected(day)
                  ? "bg-[#c9b8a8] text-white font-semibold"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
