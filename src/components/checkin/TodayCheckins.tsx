/* eslint-disable */
import React from 'react';
import { FaCheck, FaEye } from 'react-icons/fa';
import type { Booking } from '../../types/Booking';
import { checkIn } from '../../services/bookingService';

const formatCheckInTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTrustScore = (loyaltyPoints: number | undefined) => {
    const points = loyaltyPoints ?? 0;

    if (points >= 81 && points <= 100) {
        return { value: points, level: 'high' };
    }
    if (points >= 41 && points <= 80) {
        return { value: points, level: 'medium' };
    }
    return { value: points, level: 'low' };
};

const getStatus = (status: string): string => {
    if (status === 'CHECKED_IN') return 'completed';
    if (status === 'CHECKED_OUT') return 'completed';
    return 'pending';
};

const getPaymentStatus = (status: string) => {
    switch (status) {
        case 'PAID':
            return { type: 'paid', label: 'Paid in Full' };
        case 'PERCENTAGE_50':
            return { type: 'percentage_50', label: '50% Paid' };
        case 'PERCENTAGE_30':
            return { type: 'percentage_30', label: '30% Paid' };
        case 'COMPLETED':
            return { type: 'completed', label: 'Completed' };
        case 'PENDING':
            return { type: 'pending', label: 'Pending' };
        case 'FAILED':
            return { type: 'failed', label: 'Failed' };
        case 'REFUNDED':
            return { type: 'refunded', label: 'Refunded' };
        case 'CANCELLED':
            return { type: 'cancelled', label: 'Cancelled' };
        default:
            return { type: 'pending', label: 'Pending' };
    }
};

const handleCheckIn = async (bookingId: string, booking: Booking) => {
    if (
        !window.confirm(
            `Are you sure you want to check in guest: ${booking.customer?.fullName}?`,
        )
    ) {
        return;
    }

    try {
        await checkIn(bookingId);
        alert(`Check-in successful for ${booking.customer?.fullName}!`);
    } catch (error: any) {
        console.error('Check-in error:', error);

        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to check in. Please try again.';
        alert(`Check-in failed: ${errorMessage}`);
    }
};

const isToday = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    const checkInDate = new Date(dateString);
    const today = new Date();

    return (
        checkInDate.getDate() === today.getDate() &&
        checkInDate.getMonth() === today.getMonth() &&
        checkInDate.getFullYear() === today.getFullYear()
    );
};

interface TodayTabProps {
    onViewDetails: (booking: Booking) => void;
    bookings?: Booking[];
    onRefresh?: () => void;
}

function TodayTab({ onViewDetails, bookings = [] }: TodayTabProps) {
    // Remove filtering - already filtered in CheckInManager
    const filteredBookings = bookings;

    const renderStatusBadge = (status: string) => {
        const statusClasses: { [key: string]: string } = {
            pending: 'bg-amber-50 text-amber-700',
            completed: 'bg-green-50 text-green-700',
            upcoming: 'bg-blue-50 text-blue-700',
        };

        return (
            <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block min-w-20 text-center ${statusClasses[status]}`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const renderTrustScore = (score: { value: number; level: string }) => {
        const scoreClasses: { [key: string]: string } = {
            high: 'bg-green-50 text-green-700 border-green-200',
            medium: 'bg-amber-50 text-amber-700 border-amber-200',
            low: 'bg-red-50 text-red-700 border-red-200',
        };

        return (
            <div
                className={`flex flex-col items-center p-1 rounded border ${
                    scoreClasses[score.level]
                }`}
            >
                <span className="font-bold">{score.value}</span>
            </div>
        );
    };

    const renderPaymentBadge = (payment: { type: string; label: string }) => {
        const paymentClasses: { [key: string]: string } = {
            paid: 'bg-green-50 text-green-700 border border-green-200',
            completed: 'bg-green-50 text-green-700 border border-green-200',
            percentage_50: 'bg-blue-50 text-blue-700 border border-blue-200',
            percentage_30: 'bg-amber-50 text-amber-700 border border-amber-200',
            pending: 'bg-gray-50 text-gray-700 border border-gray-200',
            failed: 'bg-red-50 text-red-700 border border-red-200',
            refunded: 'bg-purple-50 text-purple-700 border border-purple-200',
            cancelled: 'bg-slate-50 text-slate-700 border border-slate-200',
        };

        return (
            <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block min-w-24 text-center ${
                    paymentClasses[payment.type] || paymentClasses.pending
                }`}
            >
                {payment.label}
            </span>
        );
    };

    if (filteredBookings.length === 0) {
        return (
            <div className="p-10 text-center">
                <p className="text-gray-500">
                    No check-ins found for this date.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
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
                    {filteredBookings.map((booking) => {
                        const trustScore = getTrustScore(
                            booking.customer?.reputationPoint,
                        );
                        const status = getStatus(booking.status);
                        const paymentStatus = getPaymentStatus(
                            booking.paymentStatus,
                        );
                        const roomNumber =
                            booking.bookingDetails?.[0]?.room?.roomNumber ||
                            'N/A';
                        const roomType =
                            booking.bookingDetails?.[0]?.room?.roomType
                                ?.typeName || 'Standard';
                        const checkInTime = formatCheckInTime(
                            booking.checkInDate,
                        );

                        return (
                            <tr
                                key={booking.bookingID}
                                className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
                            >
                                <td className="py-4 px-4">
                                    {booking.bookingID}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        {booking.customer?.avatarUrl ? (
                                            <img
                                                src={booking.customer.avatarUrl}
                                                alt={
                                                    booking.customer.fullName ||
                                                    'Guest'
                                                }
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#CCBDA3] flex items-center justify-center text-white text-sm">
                                                {(
                                                    booking.customer
                                                        ?.fullName || 'G'
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {booking.customer?.fullName ||
                                                    'Guest'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {booking.customer?.email ||
                                                    'No email'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">{`${roomNumber} - ${roomType}`}</td>
                                <td className="py-4 px-4">{checkInTime}</td>
                                <td className="py-4 px-4">
                                    {renderStatusBadge(status)}
                                </td>
                                <td className="py-4 px-4">
                                    {renderTrustScore(trustScore)}
                                </td>
                                <td className="py-4 px-4">
                                    {renderPaymentBadge(paymentStatus)}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex gap-1">
                                        {booking.status === 'PENDING' && (
                                            <button
                                                title="Check In"
                                                onClick={() =>
                                                    onViewDetails(booking)
                                                }
                                                className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition flex items-center justify-center"
                                            >
                                                <FaCheck size={14} />
                                            </button>
                                        )}
                                        <button
                                            title="View Details"
                                            className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                                            onClick={() =>
                                                onViewDetails(booking)
                                            }
                                        >
                                            <FaEye size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TodayTab;
