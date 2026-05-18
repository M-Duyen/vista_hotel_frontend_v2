/* eslint-disable */
import { useState, useEffect } from 'react';
import { useToastContext } from '../../hooks/useToastContext';
import { motion } from 'framer-motion';
import {
    calculateLateCheckoutFee,
    createLateCheckoutRequest,
} from '../../services/lateCheckoutService';

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from '../common/Select';

type Props = {
    booking: any;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function LateCheckoutModal({ booking, onClose, onSuccess }: Props) {
    const toast = useToastContext();
    const [selectedTime, setSelectedTime] = useState('');
    const [fee, setFee] = useState<number | null>(null);
    const [loadingFee, setLoadingFee] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const roomPrice = booking.bookingDetails?.[0]?.roomPrice || 0;

    /** CHẶN SCROLL BODY KHI MỞ MODAL */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    /** Generate time list */
    const generateTimes = () => {
        const list = [];
        let hour = 12;
        let minute = 0;

        while (hour <= 23) {
            const h = String(hour).padStart(2, '0');
            const m = String(minute).padStart(2, '0');
            list.push(`${h}:${m}`);

            minute += 30;
            if (minute === 60) {
                minute = 0;
                hour++;
            }
        }

        return list;
    };

    const availableTimes = generateTimes();

    /** Tính phí realtime */
    useEffect(() => {
        if (!selectedTime) return;

        const fetchFee = async () => {
            setLoadingFee(true);

            const baseDate = booking.checkOutDate.split('T')[0];
            const requestDateTime = `${baseDate}T${selectedTime}`;

            try {
                const result = await calculateLateCheckoutFee(
                    booking.bookingID,
                    requestDateTime,
                    roomPrice,
                );
                setFee(result);
            } catch (err) {
                console.error('Error calculating fee:', err);
            }

            setLoadingFee(false);
        };

        fetchFee();
    }, [selectedTime]);

    /** Submit request */
    const handleSubmit = async () => {
        if (!selectedTime) {
            alert('Please choose a time!');
            return;
        }
        if (booking?.status !== 'CHECKED_IN') {
            toast.error('Chỉ có thể gửi yêu cầu checkout muộn khi booking đang ở trạng thái Check-in.');
            return;
        }
        if (booking?.lateCheckout) {
            toast.error('Booking này đã có yêu cầu checkout muộn, không thể gửi thêm.');
            return;
        }

        setSubmitting(true);

        const baseDate = booking.checkOutDate.split('T')[0];
        const requestDateTime = `${baseDate}T${selectedTime}`;

        try {
            await createLateCheckoutRequest({
                bookingId: booking.bookingID,
                requestTime: requestDateTime,
                roomPrice,
                customerId:
                    booking.customer?.id ||
                    booking.customer?.customerId ||
                    booking.customer?.customerID ||
                    booking.customerID ||
                    booking.customerId,
                customerName: booking.customer?.fullName || 'Customer',
                roomNumber:
                    booking.bookingDetails?.[0]?.room?.roomNumber || 'N/A',
                standardCheckoutTime: `${baseDate}T12:00`,
            });


            if (onSuccess) onSuccess();
            else onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to send request.');
        }

        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Late Check-out
                </h2>

                {/* SELECT TIME */}
                <div className="mb-5">
                    <label className="block text-sm font-medium mb-1">
                        Select Time
                    </label>

                    <Select onValueChange={(v) => setSelectedTime(v)}>
                        <SelectTrigger />
                        <SelectContent>
                            {availableTimes.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* DISPLAY FEE */}
                {selectedTime && (
                    <div className="p-4 bg-gray-50 border rounded-xl mb-5">
                        <p className="text-sm text-gray-600">
                            Late Checkout Fee:
                        </p>

                        {loadingFee ? (
                            <p className="text-black mt-2">Calculating...</p>
                        ) : (
                            <p className="text-2xl font-bold mt-1">
                                {fee?.toLocaleString()} VND
                            </p>
                        )}
                    </div>
                )}

                {/* RULES */}
                <div className="text-sm text-gray-600 mb-6">
                    <p className="font-semibold">Fee Rules:</p>
                    <ul className="list-disc ml-6 mt-1 space-y-1">
                        <li>12:00 – 13:00: free for Gold+, 10% for others</li>
                        <li>13:00 – 15:00: +30%</li>
                        <li>15:00 – 18:00: +50%</li>
                        <li>After 18:00: +100% (1 extra night)</li>
                    </ul>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3">
                    <button
                        className="flex-1 py-3 bg-gray-200 rounded-xl"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!selectedTime || submitting}
                        onClick={handleSubmit}
                        className={`flex-1 py-3 rounded-xl text-white font-semibold ${
                            selectedTime
                                ? 'bg-black hover:bg-black/90'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {submitting ? 'Submitting...' : 'Confirm'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
