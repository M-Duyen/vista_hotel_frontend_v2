import { useState, useEffect, useMemo } from 'react';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    label?: string;
    disabled?: boolean;
    minTime?: string;
    maxTime?: string;
}

export default function TimePicker({
    value,
    onChange,
    label = 'Chọn giờ',
    disabled = false,
    minTime = '00:00',
    maxTime = '23:59',
}: TimePickerProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');

    // Parse initial value
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setHours(h || '00');
            setMinutes(m || '00');
        }
    }, [value]);

    // Generate time options - recalculate when minTime or maxTime changes
    const timeOptions = useMemo(() => {
        const times = [];

        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                // 15-minute intervals
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                const timeString = `${hour}:${minute}`;

                // Check if time is within allowed range
                if (timeString >= minTime && timeString <= maxTime) {
                    times.push({
                        value: timeString,
                        label: `${hour}:${minute}`,
                        hour,
                        minute,
                    });
                }
            }
        }

        return times;
    }, [minTime, maxTime]);

    // Handle time selection
    const handleTimeSelect = (time: string) => {
        onChange(time);
        setShowDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showDropdown && !target.closest('.time-picker-container')) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // Format display time
    const formatDisplayTime = (time: string) => {
        if (!time) return 'Chọn giờ...';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${m} ${period}`;
    };

    return (
        <div className="time-picker-container relative">
            {label && (
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`
                    w-full p-4 border-2 rounded-xl text-left transition-all duration-200 flex items-center justify-between group
                    ${
                        disabled
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-black'
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <svg
                        className={`w-5 h-5 transition-colors ${
                            disabled
                                ? 'text-gray-400'
                                : 'text-gray-500 group-hover:text-black'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="font-medium text-gray-800">
                        {formatDisplayTime(value)}
                    </span>
                </div>
                <svg
                    className={`w-5 h-5 transition-all duration-200 ${
                        showDropdown ? 'rotate-180' : ''
                    } ${
                        disabled
                            ? 'text-gray-400'
                            : 'text-gray-400 group-hover:text-black'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 animate-scaleIn max-h-60 overflow-hidden">
                    {/* Quick Time Buttons */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="text-xs font-medium text-black mb-2">
                            Giờ phổ biến
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                '05:00',
                                '06:00',
                                '07:00',
                                '08:00',
                                '09:00',
                                '10:00',
                                '12:00',
                                '13:00',
                                '13:30',
                            ]
                                .filter(
                                    (time) =>
                                        time >= minTime && time <= maxTime,
                                )
                                .map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => handleTimeSelect(time)}
                                        className={`
                                            px-3 py-1 text-xs rounded-lg border transition-colors
                                            ${
                                                value === time
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                                            }
                                        `}
                                    >
                                        {formatDisplayTime(time)}
                                    </button>
                                ))}
                        </div>
                        {/* Show message if no quick times available */}
                        {[
                            '05:00',
                            '06:00',
                            '07:00',
                            '08:00',
                            '09:00',
                            '10:00',
                            '12:00',
                            '13:00',
                            '13:30',
                        ].filter((time) => time >= minTime && time <= maxTime)
                            .length === 0 && (
                            <div className="text-xs text-gray-500 italic mt-2">
                                Không có giờ phổ biến nào trong khoảng thời gian
                                cho phép
                            </div>
                        )}
                    </div>

                    {/* Time List */}
                    <div className="max-h-40 overflow-y-auto scrollbar-thin">
                        {timeOptions.length > 0 ? (
                            timeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        handleTimeSelect(option.value)
                                    }
                                    className={`
                                        w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between
                                        ${
                                            value === option.value
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }
                                    `}
                                >
                                    <span>
                                        {formatDisplayTime(option.value)}
                                    </span>
                                    <span className="text-xs opacity-60">
                                        {option.value}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                <div className="mb-2">⏰</div>
                                <div>
                                    Không có giờ khả dụng trong khoảng thời gian
                                    cho phép
                                </div>
                                <div className="text-xs mt-1">
                                    Cho phép: {formatDisplayTime(minTime)} -{' '}
                                    {formatDisplayTime(maxTime)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Input */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                            Nhập thủ công
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={hours}
                                onChange={(e) => {
                                    const h = e.target.value.padStart(2, '0');
                                    setHours(h);
                                }}
                                className="w-16 px-2 py-1 text-center text-sm border rounded focus:outline-none focus:border-blue-500"
                                placeholder="00"
                            />
                            <span className="text-gray-500">:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                step="15"
                                value={minutes}
                                onChange={(e) => {
                                    const m = e.target.value.padStart(2, '0');
                                    setMinutes(m);
                                }}
                                className="w-16 px-2 py-1 text-center text-sm border rounded focus:outline-none focus:border-blue-500"
                                placeholder="00"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    handleTimeSelect(`${hours}:${minutes}`)
                                }
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
