/* eslint-disable */
import { useState, type JSX } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModernCalendarProps {
    selected: Date;
    onSelect: (d: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    excludedDates?: Date[];
}

// ==========================
// Modern Calendar Component
// ==========================
const ModernCalendar = ({
    selected,
    onSelect,
    minDate,
    maxDate,
    excludedDates = [],
}: ModernCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date(selected));

    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const prevMonthLast = new Date(year, month, 0).getDate();

        return { daysInMonth, startingDay, prevMonthLast };
    };

    const { daysInMonth, startingDay, prevMonthLast } =
        getDaysInMonth(currentDate);

    const isSelected = (d: number) => {
        return (
            d === selected.getDate() &&
            currentDate.getMonth() === selected.getMonth() &&
            currentDate.getFullYear() === selected.getFullYear()
        );
    };

    const isToday = (d: number) => {
        const t = new Date();
        return (
            d === t.getDate() &&
            currentDate.getMonth() === t.getMonth() &&
            currentDate.getFullYear() === t.getFullYear()
        );
    };

    const isDisabled = (d: number) => {
        const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            d,
        );
        date.setHours(0, 0, 0, 0);

        // Check minDate
        if (minDate) {
            const min = new Date(minDate);
            min.setHours(0, 0, 0, 0);
            if (date < min) return true;
        }

        // Check maxDate
        if (maxDate) {
            const max = new Date(maxDate);
            max.setHours(0, 0, 0, 0);
            if (date > max) return true;
        }

        // Check excludedDates
        if (excludedDates.length > 0) {
            const isExcluded = excludedDates.some((excludedDate) => {
                const excluded = new Date(excludedDate);
                excluded.setHours(0, 0, 0, 0);
                return date.getTime() === excluded.getTime();
            });
            if (isExcluded) return true;
        }

        return false;
    };

    const handleDayClick = (day: number) => {
        if (isDisabled(day)) return;
        onSelect(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        );
    };

    const canGoPrevMonth = () => {
        if (!minDate) return true;
        const prevMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1,
        );
        const min = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        return prevMonth >= min;
    };

    const renderCalendarDays = () => {
        const days: JSX.Element[] = [];

        // Previous month days
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLast - i;
            days.push(
                <div
                    key={`prev-${day}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-gray-300 font-light"
                >
                    {day}
                </div>,
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const isCurrentDay = isToday(day);
            const isSelectedDay = isSelected(day);
            const disabled = isDisabled(day);

            days.push(
                <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={disabled}
                    className={`
                        w-8 h-8 rounded-lg text-xs font-light transition-all duration-200 
                        flex items-center justify-center
                        ${
                            disabled
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:shadow-md cursor-pointer'
                        }
                        ${
                            isSelectedDay
                                ? 'bg-black text-white shadow-lg scale-105 font-normal'
                                : isCurrentDay
                                ? 'bg-[#F5F0EB] text-black ring-1 ring-black/20'
                                : disabled
                                ? ''
                                : 'bg-white hover:bg-[#F5F0EB] text-gray-700'
                        }
                    `}
                >
                    {day}
                </button>,
            );
        }

        // Next month days (fill to 35 cells = 5 rows)
        const totalCells = 35;
        const nextMonthDays = totalCells - (startingDay + daysInMonth);

        for (let day = 1; day <= nextMonthDays; day++) {
            days.push(
                <div
                    key={`next-${day}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-gray-300 font-light"
                >
                    {day}
                </div>,
            );
        }

        return days;
    };

    return (
        <div className="bg-white backdrop-blur-sm rounded-2xl shadow-lg border-black/5 p-5 w-72">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/10">
                <button
                    onClick={() =>
                        setCurrentDate(
                            new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth() - 1,
                            ),
                        )
                    }
                    disabled={!canGoPrevMonth()}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-300 ${
                        canGoPrevMonth()
                            ? 'bg-[#F5F0EB] hover:bg-black hover:text-white text-black hover:shadow-lg hover:scale-110'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>

                <div className="text-center">
                    <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gray-400 font-light mb-0.5">
                        {currentDate.getFullYear()}
                    </p>
                    <h2 className="text-lg font-extralight text-black tracking-tight">
                        {months[currentDate.getMonth()]}
                    </h2>
                </div>

                <button
                    onClick={() =>
                        setCurrentDate(
                            new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth() + 1,
                            ),
                        )
                    }
                    className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-black hover:text-white text-black transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg hover:scale-110"
                >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((d) => (
                    <div
                        key={d}
                        className="h-7 flex items-center justify-center text-[0.5rem] tracking-[0.2em] font-light text-gray-800"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

            {/* Footer */}
            <div className="mt-2 pt-4 border-t border-black/10">
                <div className="text-[0.65rem] text-gray-400 font-light tracking-wide text-center">
                    {selected.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModernCalendar;
