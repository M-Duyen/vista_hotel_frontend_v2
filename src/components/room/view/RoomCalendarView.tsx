import React, { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import type { Room } from '../view/RoomTableView';
import BookingInfoPopup from '../modal/BookingInfoPopup';
import type { RoomBooking } from '../../../types/Booking';

interface RoomCalendarViewProps {
    rooms: Room[];
    bookings: RoomBooking[];
    onRoomClick?: (room: Room) => void;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    bookings: Array<{
        booking: RoomBooking;
        room: Room;
        isStart: boolean;
        isEnd: boolean;
        spanDays: number;
        position: number;
    }>;
}

/**
 * Calendar dạng tháng với các booking 
 */
const RoomCalendarView: React.FC<RoomCalendarViewProps> = ({
    rooms,
    bookings,
    // onRoomClick,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<{
        booking: RoomBooking;
        room: Room;
        position: { x: number; y: number };
    } | null>(null);
    const [hoveredBookingId, setHoveredBookingId] = useState<string | null>(
        null,
    );

    console.log("RoomCalendarView - Rooms:", rooms);
    console.log("RoomCalendarView - Bookings:", bookings);

    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Tính các ngày cần hiển thị theo tháng
    const calendarDays = useMemo(() => {
        const days: CalendarDay[] = [];

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startPadding = firstDay.getDay();

        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false, bookings: [] });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true, bookings: [] });
        }

        const totalCells = Math.ceil(days.length / 7) * 7;
        const endPadding = totalCells - days.length;
        for (let i = 1; i <= endPadding; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, bookings: [] });
        }

        return days;
    }, [currentDate]);

    // Xử lý bookings cho từng ngày
    const calendarWithBookings = useMemo(() => {
        const daysMap = new Map<string, CalendarDay>();

        calendarDays.forEach((day) => {
            const dateKey = day.date.toDateString();
            daysMap.set(dateKey, { ...day, bookings: [] });
        });

        console.log("Processing bookings - Total:", bookings.length);

        bookings.forEach((booking) => {
            console.log("Processing booking:", booking);
            // Match by roomNumber instead of id
            const room = rooms.find((r) => r.roomNumber === booking.roomNumber || r.id === booking.roomId);
            console.log("Found room:", room, "for roomNumber:", booking.roomNumber, "roomId:", booking.roomId);
            if (!room) return;

            const checkIn = new Date(booking.checkIn);
            checkIn.setHours(0, 0, 0, 0);
            const checkOut = new Date(booking.checkOut);
            checkOut.setHours(0, 0, 0, 0);

            for (let i = 0; i < calendarDays.length; i++) {
                const calendarDay = calendarDays[i];
                const currentDate = new Date(calendarDay.date);
                currentDate.setHours(0, 0, 0, 0);

                if (currentDate.getTime() === checkIn.getTime()) {
                    const dateKey = currentDate.toDateString();
                    const dayInMap = daysMap.get(dateKey);

                    const dayOfWeek = currentDate.getDay();
                    const daysUntilEndOfWeek = 6 - dayOfWeek + 1;

                    const totalBookingDays =
                        Math.ceil(
                            (checkOut.getTime() - checkIn.getTime()) /
                                (1000 * 60 * 60 * 24),
                        ) + 1;

                    if (dayInMap) {
                        const spanDays = Math.min(
                            daysUntilEndOfWeek,
                            totalBookingDays,
                        );

                        const existingBookings = dayInMap.bookings.filter(
                            (b) => b.isStart,
                        );
                        const position = existingBookings.length;

                        dayInMap.bookings.push({
                            booking,
                            room,
                            isStart: true,
                            isEnd: false,
                            spanDays,
                            position,
                        });
                    }

                    if (totalBookingDays > daysUntilEndOfWeek) {
                        let nextWeekStart = i + daysUntilEndOfWeek;
                        let remainingDays =
                            totalBookingDays - daysUntilEndOfWeek;

                        while (
                            remainingDays > 0 &&
                            nextWeekStart < calendarDays.length
                        ) {
                            const nextWeekDay = calendarDays[nextWeekStart];
                            const nextDateKey = nextWeekDay.date.toDateString();
                            const nextDayInMap = daysMap.get(nextDateKey);

                            if (nextDayInMap) {
                                const nextSpanDays = Math.min(7, remainingDays);

                                const existingNextBookings =
                                    nextDayInMap.bookings.filter(
                                        (b) => b.isStart,
                                    );
                                const nextPosition =
                                    existingNextBookings.length;

                                nextDayInMap.bookings.push({
                                    booking,
                                    room,
                                    isStart: true,
                                    isEnd: false,
                                    spanDays: nextSpanDays,
                                    position: nextPosition,
                                });

                                remainingDays -= nextSpanDays;
                                nextWeekStart += 7;
                            } else {
                                break;
                            }
                        }
                    }

                    break;
                }
            }
        });

        return Array.from(daysMap.values());
    }, [calendarDays, bookings, rooms]);

    const previousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const goToday = () => {
        setCurrentDate(new Date());
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            month: 'long',
            year: 'numeric',
        });
    };

    const statusColors = {
        pending: 'bg-amber-500',
        waiting: 'bg-yellow-500',
        confirmed: 'bg-blue-500',
        'checked-in': 'bg-emerald-500',
        'checked-out': 'bg-rose-500',
        cancelled: 'bg-gray-400',
    };

    const statusBorderColors = {
        pending: 'border-amber-600',
        waiting: 'border-yellow-600',
        confirmed: 'border-blue-600',
        'checked-in': 'border-emerald-600',
        'checked-out': 'border-rose-600',
        cancelled: 'border-gray-500',
    };

    // Click để hiển thị/ẩn popup
    const handleBookingClick = (
        booking: RoomBooking,
        room: Room,
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        event.stopPropagation(); // Ngăn event bubbling

        // Nếu đang hiển thị popup của booking này thì đóng
        if (selectedBooking?.booking.id === booking.id) {
            setSelectedBooking(null);
        } else {
            // Hiển thị popup mới
            const rect = event.currentTarget.getBoundingClientRect();
            setSelectedBooking({
                booking,
                room,
                position: {
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                },
            });
        }
    };

    // Hover để highlight tất cả các đoạn của cùng booking
    const handleBookingMouseEnter = (bookingId: string) => {
        setHoveredBookingId(bookingId);
    };

    const handleBookingMouseLeave = () => {
        setHoveredBookingId(null);
    };

    // Click vào backdrop để đóng popup
    const handleBackdropClick = () => {
        setSelectedBooking(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {formatMonth(currentDate)}
                        </h2>
                        <button
                            onClick={goToday}
                            className="px-4 py-2 text-sm bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <FaChevronLeft className="text-gray-600" />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <FaChevronRight className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-[#ebe3d7] rounded-lg overflow-hidden">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 bg-[#f5f0eb]">
                    {weekDays.map((day, idx) => (
                        <div
                            key={idx}
                            className="p-3 text-center font-semibold text-[#6b5e4c] border-r border-[#ebe3d7] last:border-r-0"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                    {calendarWithBookings.map((day, idx) => {
                        const maxBookings = Math.max(
                            day.bookings.filter((b) => b.isStart).length,
                            1,
                        );
                        const minHeight = 100 + maxBookings * 32;

                        const isToday =
                            day.date.toDateString() ===
                            new Date().toDateString();

                        return (
                            <div
                                key={idx}
                                className={`border-r border-b border-[#ebe3d7] p-2 last:border-r-0 ${
                                    isToday
                                        ? 'bg-[#fff3cd]'
                                        : !day.isCurrentMonth
                                        ? 'bg-gray-50'
                                        : 'bg-white'
                                }`}
                                style={{ minHeight: `${minHeight}px` }}
                            >
                                {/* Date Number */}
                                <div
                                    className={`text-sm font-semibold mb-1 ${
                                        day.isCurrentMonth
                                            ? 'text-gray-800'
                                            : 'text-gray-400'
                                    } ${isToday ? 'text-[#856404]' : ''}`}
                                >
                                    {day.date.getDate()}
                                </div>

                                {/* Bookings */}
                                <div
                                    className="relative"
                                    style={{
                                        minHeight: `${maxBookings * 32}px`,
                                    }}
                                >
                                    {day.bookings
                                        .filter((item) => item.isStart)
                                        .map((item, bookingIdx) => {
                                            const cellWidth = 100;
                                            const gapBetweenCells = 1;
                                            const totalWidth = `calc(${
                                                item.spanDays * cellWidth
                                            }% + ${
                                                (item.spanDays - 1) *
                                                gapBetweenCells
                                            }px)`;

                                            const isSelected =
                                                selectedBooking?.booking.id ===
                                                item.booking.id;
                                            const isHovered =
                                                hoveredBookingId ===
                                                item.booking.id;

                                            return (
                                                <div
                                                    key={bookingIdx}
                                                    onClick={(e) =>
                                                        handleBookingClick(
                                                            item.booking,
                                                            item.room,
                                                            e,
                                                        )
                                                    }
                                                    onMouseEnter={() =>
                                                        handleBookingMouseEnter(
                                                            item.booking.id,
                                                        )
                                                    }
                                                    onMouseLeave={
                                                        handleBookingMouseLeave
                                                    }
                                                    className={`${
                                                        statusColors[
                                                            item.booking.status
                                                        ]
                                                    } ${
                                                        statusBorderColors[
                                                            item.booking.status
                                                        ]
                                                    } text-white text-xs px-2 py-1.5 rounded-md cursor-pointer truncate absolute border-l-4 font-medium transition-all duration-150 ${
                                                        isHovered
                                                            ? 'opacity-90 shadow-lg scale-105 z-50'
                                                            : ''
                                                    } ${
                                                        isSelected
                                                            ? 'opacity-90 shadow-lg scale-105 ring-2 ring-white'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        width: totalWidth,
                                                        top: `${
                                                            item.position * 32
                                                        }px`,
                                                        left: 0,
                                                        zIndex: isHovered
                                                            ? 50
                                                            : isSelected
                                                            ? 30
                                                            : 10 +
                                                              item.position,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                                                        <span className="font-bold">
                                                            {
                                                                item.room
                                                                    .roomNumber
                                                            }
                                                        </span>
                                                        <span className="opacity-90">
                                                            •
                                                        </span>
                                                        <span className="truncate">
                                                            {
                                                                item.booking
                                                                    .guestName
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-amber-500 rounded border-l-4 border-amber-600" />
                    <span className="text-gray-700 font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-emerald-500 rounded border-l-4 border-emerald-600" />
                    <span className="text-gray-700 font-medium">
                        Checked In
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-rose-500 rounded border-l-4 border-rose-600" />
                    <span className="text-gray-700 font-medium">
                        Checked Out
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-gray-400 rounded border-l-4 border-gray-500" />
                    <span className="text-gray-700 font-medium">Cancelled</span>
                </div>
            </div>

            {/* Booking Info Popup với backdrop */}
            <AnimatePresence>
                {selectedBooking && (
                    <>
                        {/* Backdrop - click để đóng popup */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={handleBackdropClick}
                        />
                        <BookingInfoPopup
                            booking={selectedBooking.booking}
                            room={selectedBooking.room}
                            position={selectedBooking.position}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoomCalendarView;
