/* eslint-disable */
import React from 'react';
import { FaEye, FaComment } from 'react-icons/fa';
import type { Booking } from '../../types/Booking';

const formatCheckInTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTrustScore = (loyaltyPoints: any) => {
    if (!loyaltyPoints) return { value: 50, level: 'medium' };
    if (loyaltyPoints >= 10000) return { value: 85, level: 'high' };
    if (loyaltyPoints >= 5000) return { value: 65, level: 'medium' };
    return { value: 40, level: 'low' };
};

const getPaymentStatus = (status: any) => {
    switch (status) {
        case 'COMPLETED':
            return { type: 'complete', label: 'Paid in Full' };
        case 'PARTIAL':
            return { type: 'partial', label: 'Partial (30%)' };
        case 'PENDING':
            return { type: 'checkout', label: 'Pay at Checkout' };
        default:
            return { type: 'checkout', label: 'Not Paid' };
    }
};

const isTomorrowBooking = (booking: Booking) => {
    if (!booking.checkInDate) return false;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkInDate = new Date(booking.checkInDate);
    return (
        checkInDate.getDate() === tomorrow.getDate() &&
        checkInDate.getMonth() === tomorrow.getMonth() &&
        checkInDate.getFullYear() === tomorrow.getFullYear()
    );
};

type TomorrowTabProps = {
    onViewDetails?: (booking: Booking) => void;
    bookings?: Booking[];
};

const TomorrowTab = ({
    onViewDetails = () => {},
    bookings = [],
}: TomorrowTabProps) => {
    // Remove filtering - already filtered in CheckInManager
    const tomorrowBookings = bookings.map((booking) => ({
        id: booking.bookingID,
        guest: {
            name: booking.customer?.fullName || 'Guest',
            email: booking.customer?.email || 'No email',
            image: 'https://randomuser.me/api/portraits/men/22.jpg',
        },
        room: `${booking.bookingDetails?.[0]?.room?.roomNumber || 'N/A'} - ${
            booking.bookingDetails?.[0]?.room?.roomType?.typeName || 'Standard'
        }`,
        checkInTime: formatCheckInTime(booking.checkInDate),
        trustScore: getTrustScore(booking.customer?.loyaltyPoints),
        paymentStatus: getPaymentStatus(booking.paymentStatus),
    }));

    const displayBookings = tomorrowBookings.length > 0 ? tomorrowBookings : [];

    if (tomorrowBookings.length === 0) {
        return (
            <div className="p-10 text-center">
                <p className="text-gray-500">
                    No check-ins scheduled for this date.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="bg-[#EBE3D7]/30 text-left">
                        <th className="py-4 px-4 font-semibold">Booking ID</th>
                        <th className="py-4 px-4 font-semibold">Guest Name</th>
                        <th className="py-4 px-4 font-semibold">Room</th>
                        <th className="py-4 px-4 font-semibold">
                            Check-in Time
                        </th>
                        <th className="py-4 px-4 font-semibold">Status</th>
                        <th className="py-4 px-4 font-semibold">Trust Score</th>
                        <th className="py-4 px-4 font-semibold">
                            Payment Status
                        </th>
                        <th className="py-4 px-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayBookings.map((booking) => (
                        <tr
                            key={booking.id}
                            className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
                        >
                            <td className="py-4 px-4">{booking.id}</td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={booking.guest.image}
                                        alt={booking.guest.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {booking.guest.name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {booking.guest.email}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">{booking.room}</td>
                            <td className="py-4 px-4">{booking.checkInTime}</td>
                            <td className="py-4 px-4">
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                                    Upcoming
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="relative">
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full bg-${
                                            booking.trustScore.level === 'high'
                                                ? 'green'
                                                : booking.trustScore.level ===
                                                  'medium'
                                                ? 'yellow'
                                                : 'red'
                                        }-100`}
                                    >
                                        <span className="text-sm font-semibold">
                                            {booking.trustScore.value}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <span
                                    className={`px-3 py-1 text-xs font-medium rounded-full bg-${
                                        booking.paymentStatus.type ===
                                        'complete'
                                            ? 'green'
                                            : booking.paymentStatus.type ===
                                              'partial'
                                            ? 'yellow'
                                            : 'purple'
                                    }-100 text-${
                                        booking.paymentStatus.type ===
                                        'complete'
                                            ? 'green'
                                            : booking.paymentStatus.type ===
                                              'partial'
                                            ? 'yellow'
                                            : 'purple'
                                    }-600`}
                                >
                                    {booking.paymentStatus.label}
                                </span>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onViewDetails(booking)}
                                        className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                                        title="View Details"
                                    >
                                        <FaEye size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                                        title="Send Message"
                                    >
                                        <FaComment size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TomorrowTab;
