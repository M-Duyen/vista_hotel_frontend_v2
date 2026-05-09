/* eslint-disable */
import { useState, useEffect } from 'react';
import { useToastContext } from '../../hooks/useToastContext';
import { createEarlyCheckinRequest } from '../../services/earlyCheckinService';
import ModernCalendar from '../common/ModernCalendar';
import TimePicker from '../common/Time';

type Props = {
    onClose: () => void;
    booking: any;
};

export default function EarlyCheckinModal({ onClose, booking }: Props) {
    const toast = useToastContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [additionalFee, setAdditionalFee] = useState(0);

    const roomPrice =
        booking?.bookingDetails?.[0]?.roomPrice ||
        booking?.totalAmount / booking?.duration;

    /** Lock scroll body */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    /** Close calendar when clicking outside */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showCalendar && !target.closest('.calendar-container')) {
                setShowCalendar(false);
            }
        };

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    /** Auto calculate fee */
    const calcFee = (t: string) => {
        if (!t) return 0;

        const [h, m] = t.split(':').map(Number);
        const hour = h + m / 60;

        if (hour >= 5 && hour < 9) return roomPrice * 0.5;
        if (hour >= 9 && hour < 13.5) return roomPrice * 0.3;

        return 0;
    };

    useEffect(() => {
        setAdditionalFee(calcFee(time));
    }, [time]);

    /** Calculate minimum time based on selected date */
    const getMinimumTime = () => {
        const now = new Date();

        // Use local date strings to avoid timezone issues
        const selectedDateStr = `${selectedDate.getFullYear()}-${(
            selectedDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}-${selectedDate
            .getDate()
            .toString()
            .padStart(2, '0')}`;
        const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        // If selected date is today, minimum time is current time
        if (selectedDateStr === todayStr) {
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Check if current time is already past 13:30 (maxTime)
            if (
                currentHour > 13 ||
                (currentHour === 13 && currentMinute >= 30)
            ) {
                return '23:59'; // Return a time that's definitely past maxTime
            }

            // Round up to next 15-minute interval
            const roundedMinute = Math.ceil(currentMinute / 15) * 15;

            if (roundedMinute >= 60) {
                const result = `${(currentHour + 1)
                    .toString()
                    .padStart(2, '0')}:00`;

                return result;
            } else {
                const result = `${currentHour
                    .toString()
                    .padStart(2, '0')}:${roundedMinute
                    .toString()
                    .padStart(2, '0')}`;

                return result;
            }
        }

        // If selected date is in the future, minimum time is 05:00

        return '05:00';
    };

    /** Clear time when date changes to prevent past time selection */
    useEffect(() => {
        const minTime = getMinimumTime();
        if (time && time < minTime) {
            setTime(''); // Clear time if it's now in the past
        }
    }, [selectedDate]);

    /** Validate */
    const validate = () => {
        setErrorMsg('');

        if (!time) {
            setErrorMsg('Vui lòng chọn giờ check-in sớm.');
            return false;
        }

        const now = new Date();

        // Use local date strings to avoid timezone issues
        const selectedDateStr = `${selectedDate.getFullYear()}-${(
            selectedDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}-${selectedDate
            .getDate()
            .toString()
            .padStart(2, '0')}`;

        const requested = new Date(`${selectedDateStr}T${time}`);
        const mainCheckin = new Date(booking.checkInDate);

        if (requested < now) {
            const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${now
                .getDate()
                .toString()
                .padStart(2, '0')}`;

            if (selectedDateStr === todayStr) {
                setErrorMsg(
                    `Giờ ${time} đã qua. Vui lòng chọn giờ sau ${now.getHours()}:${now
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')}.`,
                );
            } else {
                setErrorMsg('Không thể chọn thời gian trong quá khứ.');
            }
            return false;
        }

        if (requested >= mainCheckin) {
            setErrorMsg('Check-in sớm phải trước giờ check-in chính thức.');
            return false;
        }

        if (booking.bookingDetails[0]?.room?.status === 'BOOKED') {
            setErrorMsg(
                'Phòng đã có khách ở đêm trước. Không thể check-in sớm.',
            );
            return false;
        }

        if (additionalFee === 0) {
            setErrorMsg(
                'Giờ bạn chọn không nằm trong khung cho phép (05:00–13:30).',
            );
            return false;
        }

        return true;
    };

    /** Submit */
    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const finalDate = selectedDate.toISOString().split('T')[0];
            const payload = {
                customerId: booking.customer.id,
                bookingId: booking.bookingID,
                requestTime: `${finalDate}T${time}`,
                roomPrice,
            };

            const res = await createEarlyCheckinRequest(payload);

            if (res.success || res.requestID) {
                toast.success('Yêu cầu check-in sớm đã được gửi!');
                onClose();
                setTimeout(() => window.location.reload(), 300);
            } else {
                toast.error(res.message || 'Không thể gửi yêu cầu.');
            }
        } catch (e: any) {
            console.error('Early checkin error:', e);

            if (e.code === 'ERR_NETWORK') toast.error('Mất kết nối mạng.');
            else if (e.response?.status === 500) toast.error('Lỗi server.');
            else toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
            {/* Click to close overlay */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4 text-black">
                    Yêu cầu Check-in Sớm
                </h2>

                {/* Date Picker with Dropdown */}
                <div className="relative calendar-container">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Chọn ngày
                    </label>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-left hover:bg-gray-100 hover:border-black transition-all duration-200 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="font-medium text-gray-800">
                                {selectedDate.toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <svg
                            className={`w-5 h-5 text-gray-400 group-hover:text-black transition-all duration-200 ${
                                showCalendar ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    {/* Calendar Dropdown */}
                    {showCalendar && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-scaleIn">
                            <ModernCalendar
                                selected={selectedDate}
                                onSelect={(d: Date) => {
                                    setSelectedDate(d);
                                    setShowCalendar(false);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Time Picker */}
                <div className="mt-4">
                    <TimePicker
                        value={time}
                        onChange={(newTime) => setTime(newTime)}
                        label="Chọn giờ check-in sớm"
                        minTime={getMinimumTime()}
                        maxTime="13:30"
                    />
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
                        {errorMsg}
                    </div>
                )}

                {/* Fee */}
                <div className="bg-[#F5F0EB] p-4 rounded-xl mb-4">
                    <p className="text-black/60 text-sm">Phí check-in sớm</p>
                    <p className="text-xl font-bold text-black">
                        {additionalFee.toLocaleString()} VNĐ
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded-lg border"
                        onClick={onClose}
                    >
                        Hủy
                    </button>

                    <button
                        className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/90"
                        onClick={handleSubmit}
                    >
                        Gửi yêu cầu
                    </button>
                </div>
            </div>
        </div>
    );
}
