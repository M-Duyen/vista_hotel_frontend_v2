import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Minus } from "lucide-react";
import { getByRoom } from "../../services/bookingService";
import type { Booking } from "../../types/Booking";
import Dropdown from "../Dropdown";
import { MdDangerous, MdDone } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoWarningOutline } from "react-icons/io5";

interface HourlyBookingSelectorProps {
  checkInDate: Date | null;
  onCheckInDateSelect: (date: Date) => void;
  checkInTime: string;
  onCheckInTimeChange: (time: string) => void;
  duration: number;
  onDurationChange: (hours: number) => void;
  minHours?: number;
  maxHours?: number;
  selectedRooms?: string[]; // Thêm prop để nhận danh sách phòng đã chọn
}

interface BookingTimeRange {
  checkIn: Date;
  checkOut: Date;
}

export default function HourlyBookingSelector({
  checkInDate,
  onCheckInDateSelect,
  checkInTime,
  onCheckInTimeChange,
  duration,
  onDurationChange,
  minHours = 2,
  maxHours = 9,
  selectedRooms = [],
}: HourlyBookingSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedTimeRanges, setBookedTimeRanges] = useState<BookingTimeRange[]>(
    []
  ); // Lưu các khoảng thời gian đã đặt
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState<string[]>(
    []
  ); // Giờ không khả dụng cho ngày đã chọn

  // Fetch bookings cho tất cả phòng đã chọn
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedRooms || selectedRooms.length === 0) {
        setBookedTimeRanges([]);
        return;
      }

      try {
        const allTimeRanges: BookingTimeRange[] = [];

        for (const roomNumber of selectedRooms) {
          const bookings: Booking[] = await getByRoom(roomNumber);

          // Chỉ lấy các booking PENDING hoặc CHECKED_IN (bỏ qua CANCELLED, CHECKED_OUT)
          const activeBookings = bookings.filter(
            (b) => b.status === "PENDING" || b.status === "CHECKED_IN"
          );

          activeBookings.forEach((booking) => {
            allTimeRanges.push({
              checkIn: new Date(booking.checkInDate),
              checkOut: new Date(booking.checkOutDate),
            });
          });
        }

        setBookedTimeRanges(allTimeRanges);
        console.log("Booked time ranges for hourly booking:", allTimeRanges);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    };

    fetchBookings();
  }, [selectedRooms]);

  // Cập nhật unavailable time slots khi chọn ngày
  useEffect(() => {
    if (!checkInDate || bookedTimeRanges.length === 0) {
      setUnavailableTimeSlots([]);
      return;
    }

    const unavailable = new Set<string>();
    const selectedDate = new Date(checkInDate);
    selectedDate.setHours(0, 0, 0, 0);

    bookedTimeRanges.forEach(({ checkIn, checkOut }) => {
      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);

      const checkOutDate = new Date(checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      // Chỉ xử lý nếu booking nằm trong ngày đã chọn
      if (
        selectedDate.getTime() >= checkInDate.getTime() &&
        selectedDate.getTime() <= checkOutDate.getTime()
      ) {
        // Tạo time slots 30 phút từ 6:00 đến 23:30
        let currentTime = new Date(checkIn);
        const endTime = new Date(checkOut);

        // Block tất cả time slots từ check-in đến check-out
        while (currentTime < endTime) {
          // Chỉ block nếu là cùng ngày được chọn
          const slotDate = new Date(currentTime);
          slotDate.setHours(0, 0, 0, 0);

          if (slotDate.getTime() === selectedDate.getTime()) {
            const hour = currentTime.getHours().toString().padStart(2, "0");
            const minute = currentTime.getMinutes().toString().padStart(2, "0");
            unavailable.add(`${hour}:${minute}`);
          }

          // Tăng thêm 30 phút
          currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
        }
      }
    });

    setUnavailableTimeSlots(Array.from(unavailable));
    console.log("Unavailable time slots:", Array.from(unavailable));
  }, [checkInDate, bookedTimeRanges]);

  // Generate time slots (every 30 minutes from 6:00 to 23:30)
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 23) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onCheckInDateSelect(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Kiểm tra xem một ngày có booking hay không
  const hasBookingOnDate = (date: Date): boolean => {
    const startOfDate = new Date(date);
    startOfDate.setHours(0, 0, 0, 0);

    const endOfDate = new Date(date);
    endOfDate.setHours(23, 59, 59, 999);

    return bookedTimeRanges.some(({ checkIn, checkOut }) => {
      return checkIn < endOfDate && checkOut > startOfDate;
    });
  };

  const isTimeSlotAvailableForDate = (date: Date, timeSlot: string): boolean => {
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const proposedCheckIn = new Date(date);
    proposedCheckIn.setHours(hours, minutes, 0, 0);

    const proposedCheckOut = new Date(
      proposedCheckIn.getTime() + duration * 60 * 60 * 1000
    );

    return !bookedTimeRanges.some(({ checkIn, checkOut }) => {
      const existingCheckIn = new Date(checkIn);
      const existingCheckOut = new Date(checkOut);
      return proposedCheckIn < existingCheckOut && proposedCheckOut > existingCheckIn;
    });
  };

  const isDateFullyBooked = (date: Date): boolean => {
    if (!hasBookingOnDate(date)) {
      return false;
    }

    return timeSlots.every((slot) => !isTimeSlotAvailableForDate(date, slot));
  };

  // Calculate check-out time
  const calculateCheckOutTime = () => {
    if (!checkInDate || !checkInTime) return "N/A";

    const [hours, minutes] = checkInTime.split(":").map(Number);
    const checkInDateTime = new Date(checkInDate);
    checkInDateTime.setHours(hours, minutes, 0, 0);

    const checkOutDateTime = new Date(
      checkInDateTime.getTime() + duration * 60 * 60 * 1000
    );

    const outHours = checkOutDateTime.getHours().toString().padStart(2, "0");
    const outMinutes = checkOutDateTime
      .getMinutes()
      .toString()
      .padStart(2, "0");

    return `${checkOutDateTime.toLocaleDateString(
      "en-GB"
    )} ${outHours}:${outMinutes}`;
  };

  const handleDurationChange = (change: number) => {
    const newDuration = duration + change;
    if (newDuration >= minHours && newDuration <= maxHours) {
      onDurationChange(newDuration);
    }
  };

  // Kiểm tra xem một time slot có khả dụng với duration hiện tại không
  const isTimeSlotAvailableWithDuration = (timeSlot: string): boolean => {
    if (!checkInDate || !timeSlot) return true;

    const [hours, minutes] = timeSlot.split(":").map(Number);
    const proposedCheckIn = new Date(checkInDate);
    proposedCheckIn.setHours(hours, minutes, 0, 0);

    const proposedCheckOut = new Date(
      proposedCheckIn.getTime() + duration * 60 * 60 * 1000
    );

    console.log("Checking availability for:", {
      proposedCheckIn: proposedCheckIn.toISOString(),
      proposedCheckOut: proposedCheckOut.toISOString(),
      duration: duration,
    });

    // Kiểm tra xem khoảng thời gian này có conflict với bất kỳ booking nào không
    const hasConflict = bookedTimeRanges.some(({ checkIn, checkOut }) => {
      const existingCheckIn = new Date(checkIn);
      const existingCheckOut = new Date(checkOut);

      console.log("Comparing with existing booking:", {
        existingCheckIn: existingCheckIn.toISOString(),
        existingCheckOut: existingCheckOut.toISOString(),
      });

      // Conflict nếu có bất kỳ overlap nào giữa 2 khoảng thời gian
      // [A_start, A_end] và [B_start, B_end] overlap nếu:
      // A_start < B_end AND A_end > B_start
      const overlap =
        proposedCheckIn < existingCheckOut &&
        proposedCheckOut > existingCheckIn;

      if (overlap) {
        console.log("CONFLICT DETECTED!");
      }

      return overlap;
    });

    console.log("Has conflict:", hasConflict);
    return !hasConflict;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Select Date
        </label>
        <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar size={20} className="text-gray-600" />
          <input
            type="text"
            value={checkInDate ? checkInDate.toLocaleDateString("en-GB") : ""}
            readOnly
            className="flex-1 bg-transparent text-gray-900 font-medium focus:outline-none"
            placeholder="Select a date"
          />
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              ←
            </button>
            <h3 className="font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );
              date.setHours(0, 0, 0, 0);

              const isSelected =
                checkInDate && date.getTime() === checkInDate.getTime();
              const isPast = date < today;
              const hasBooking = hasBookingOnDate(date);
              const isFullyBooked = isDateFullyBooked(date);

              return (
                <button
                  key={day}
                  onClick={() => !isPast && !isFullyBooked && handleDateClick(day)}
                  disabled={isPast || isFullyBooked}
                  className={`p-2 text-sm rounded-lg transition relative ${
                    isSelected
                      ? "bg-[#c9b8a8] text-white font-bold cursor-pointer"
                      : isPast || isFullyBooked
                      ? "text-gray-300 cursor-not-allowed"
                      : hasBooking
                      ? "bg-yellow-100 text-gray-900 hover:bg-yellow-200 cursor-pointer"
                      : "hover:bg-gray-100 text-gray-900 cursor-pointer"
                  }`}
                >
                  {day}
                  {hasBooking && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time and Duration Selection */}
      <div className="space-y-6">
        {/* Time Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-[#c9b8a8]" />
            <label className="text-sm font-bold text-gray-900">
              Check-in Time
            </label>
          </div>

          <Dropdown
            options={[
              {
                value: "",
                label: !checkInDate ? "Select date first" : "Select time",
                icon: <Clock size={18} className="text-[#c9b8a8]" />,
              },
              ...timeSlots.map((slot) => {
                const isUnavailable = !isTimeSlotAvailableWithDuration(slot);
                return {
                  value: slot,
                  label: `${slot} ${
                    isUnavailable ? `(Không khả dụng với ${duration}h)` : ""
                  }`,
                  icon: isUnavailable ? (
                    <MdDangerous className="text-red-500" />
                  ) : (
                    <MdDone className="text-green-500" />
                  ),
                };
              }),
            ]}
            value={checkInTime}
            onChange={(value) => onCheckInTimeChange(value)}
            placeholder="Select time"
            className="w-full"
          />

          {checkInDate &&
            checkInTime &&
            !isTimeSlotAvailableWithDuration(checkInTime) && (
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                  <MdDangerous className="text-red-500" />
                  Giờ này không khả dụng với duration {duration}h. Vui lòng chọn
                  giờ khác hoặc giảm duration.
                </p>
              </div>
            )}
          {unavailableTimeSlots.length > 0 && checkInDate && (
            <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
              <p className="text-xs text-orange-700 font-medium flex items-center gap-2">
                <IoWarningOutline className="text-orange-400" />
                Một số khoảng thời gian đã có booking trong ngày này
              </p>
            </div>
          )}
        </div>

        {/* Duration Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-4">
            Duration (Hours)
          </label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleDurationChange(-1)}
              disabled={duration <= minHours}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                duration <= minHours
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#c9b8a8] text-white hover:bg-[#b8a896] cursor-pointer"
              }`}
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#c9b8a8]">
                {duration}
              </span>
              <span className="text-sm text-gray-600">hours</span>
            </div>

            <button
              onClick={() => handleDurationChange(1)}
              disabled={duration >= maxHours}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                duration >= maxHours
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#c9b8a8] text-white hover:bg-[#b8a896] cursor-pointer"
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Min: {minHours}h | Max: {maxHours}h
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#f5f1ed] rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-medium text-gray-900">
                {checkInDate && checkInTime
                  ? `${checkInDate.toLocaleDateString("en-GB")} ${checkInTime}`
                  : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">
                {duration} hours
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-medium text-gray-900">
                {calculateCheckOutTime()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
