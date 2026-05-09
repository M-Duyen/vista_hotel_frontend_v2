import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CustomCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const today = isToday(day);
      const selected = isSelected(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            p-2 rounded-lg text-sm font-medium transition-all
            hover:bg-[#CCBDA3] hover:text-white
            ${
              selected
                ? "bg-[#CCBDA3] text-white shadow-md"
                : today
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-gray-700"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleQuickSelect = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    onDateSelect(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FaChevronLeft className="text-gray-600" size={14} />
        </button>

        <h3 className="text-base font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FaChevronRight className="text-gray-600" size={14} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-4">{renderDays()}</div>

      {/* Quick select buttons */}
      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">Quick Select:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickSelect(0)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#CCBDA3] hover:text-white rounded-lg transition font-medium"
          >
            Today
          </button>
          <button
            onClick={() => handleQuickSelect(1)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#CCBDA3] hover:text-white rounded-lg transition font-medium"
          >
            Tomorrow
          </button>
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#CCBDA3] hover:text-white rounded-lg transition font-medium"
          >
            Next Week
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#CCBDA3] hover:text-white rounded-lg transition font-medium"
          >
            Next Month
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-full mt-3 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
      >
        Close
      </button>
    </div>
  );
};

export default CustomCalendar;
