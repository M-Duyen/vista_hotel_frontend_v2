import React, { useState, useEffect } from 'react';
import { Eye, Search, Calendar, User, CreditCard } from 'lucide-react';
import { getAll } from '../../services/bookingService';
import type { Booking } from '../../types/Booking';
import BookingDetailModal from '../../components/booking/BookingDetailModal';

type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED';
type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'REFUNDED'
    | 'PARTIAL'
    | 'COMPLETED'
    | 'PERCENTAGE_30'
    | 'PERCENTAGE_50'
    | 'FAILED'
    | 'CANCELLED';

// Helper functions for date ranges
const getDefaultStartDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
};

const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
};

const ReservationList: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>(
        'ALL',
    );
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [bookings, searchTerm, statusFilter, startDate, endDate]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getAll();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const setDateRangeToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setShowCustomDate(false);
    };

    const setDateRangeYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
        setShowCustomDate(false);
    };

    const setDateRangeThisWeek = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(
            now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
        );
        setStartDate(startOfWeek.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setShowCustomDate(false);
    };

    const setDateRangeLastWeek = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfLastWeek = new Date(now);
        startOfLastWeek.setDate(
            now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7,
        );
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
        setStartDate(startOfLastWeek.toISOString().split('T')[0]);
        setEndDate(endOfLastWeek.toISOString().split('T')[0]);
        setShowCustomDate(false);
    };

    const setDateRangeThisMonth = () => {
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setShowCustomDate(false);
    };

    const toggleCustomDate = () => {
        setShowCustomDate(!showCustomDate);
    };

    const filterBookings = () => {
        let filtered = bookings;

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((b) => b.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (b) =>
                    b.bookingID
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    b.customer?.fullName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    b.customer?.email
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    b.bookingDetails?.[0]?.room?.roomNumber
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Filter by date range - based on BOOKING DATE (when booking was created)
        if (startDate) {
            filtered = filtered.filter((b) => {
                const bookingDate = new Date(b.bookingDate)
                    .toISOString()
                    .split('T')[0];
                return bookingDate >= startDate;
            });
        }
        if (endDate) {
            filtered = filtered.filter((b) => {
                const bookingDate = new Date(b.bookingDate)
                    .toISOString()
                    .split('T')[0];
                return bookingDate <= endDate;
            });
        }

        setFilteredBookings(filtered);
        setCurrentPage(1);
    };

    const getStatusColor = (status: BookingStatus) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
            CHECKED_IN: 'bg-purple-100 text-purple-800 border-purple-200',
            CHECKED_OUT: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPaymentStatusColor = (status: PaymentStatus) => {
        const colors = {
            PENDING: 'text-yellow-600',
            PAID: 'text-green-600',
            COMPLETED: 'text-green-600',
            REFUNDED: 'text-blue-600',
            PARTIAL: 'text-orange-600',
            PERCENTAGE_30: 'text-orange-600',
            PERCENTAGE_50: 'text-orange-600',
            FAILED: 'text-red-600',
            CANCELLED: 'text-red-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredBookings.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCBDA3]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Reservations
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage all hotel reservations
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-[#EBE3D7]">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative" style={{ width: '580px' }}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by booking ID, customer name, email, or room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as BookingStatus | 'ALL',
                            )
                        }
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CHECKED_IN">Checked In</option>
                        <option value="CHECKED_OUT">Checked Out</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    {/* Quick Date Filters */}
                    <button
                        onClick={setDateRangeToday}
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={setDateRangeYesterday}
                        className="px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        Yesterday
                    </button>
                    <button
                        onClick={setDateRangeThisWeek}
                        className="px-3 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        This Week
                    </button>
                    <button
                        onClick={setDateRangeLastWeek}
                        className="px-3 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                        Last Week
                    </button>
                    <button
                        onClick={setDateRangeThisMonth}
                        className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                        This Month
                    </button>
                    <button
                        onClick={toggleCustomDate}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            showCustomDate
                                ? 'bg-[#CCBDA3] text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Custom Range
                    </button>

                    {/* Date Range Filter - Only show when Custom Range is toggled */}
                    {showCustomDate && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    From:
                                </span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    To:
                                </span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} -{' '}
                {Math.min(indexOfLastItem, filteredBookings.length)} of{' '}
                {filteredBookings.length} reservations
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm border border-[#EBE3D7] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Booking ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Room
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check-in
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check-out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
                                        No reservations found
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((booking) => (
                                    <tr
                                        key={booking.bookingID}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{booking.bookingID}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.customer
                                                            ?.fullName || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {booking.customer
                                                            ?.email || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.bookingDetails?.[0]?.room
                                                ?.roomNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                {formatDate(
                                                    booking.checkInDate,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                {formatDate(
                                                    booking.checkOutDate,
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatCurrency(
                                                booking.totalCost ||
                                                    booking.totalAmount ||
                                                    0,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                                    booking.status,
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className={`flex items-center text-sm font-medium ${getPaymentStatusColor(
                                                    booking.paymentStatus,
                                                )}`}
                                            >
                                                <CreditCard className="w-4 h-4 mr-1" />
                                                {booking.paymentStatus}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center px-3 py-1.5 bg-[#CCBDA3] text-white rounded-lg hover:bg-[#b8a88a] transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 border border-[#EBE3D7] rounded-lg">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(totalPages, prev + 1),
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Detail Modal */}
            <BookingDetailModal
                booking={selectedBooking}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBooking(null);
                }}
            />
        </div>
    );
};

export default ReservationList;
