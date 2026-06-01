import { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Calendar,
    Users,
    MapPin,
    Clock,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import Header from '../../components/Header';
import {
    getBookingById,
    getMyBookingsByCustomerId,
} from '../../services/bookingService';
import type { Booking } from '../../types/Booking';
import { useToastContext } from '../../hooks/useToastContext';

// Types from types folder
type BookingStatus =
    | 'PENDING'
    | 'WAITING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED';
type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'COMPLETED'
    | 'PERCENTAGE_30'
    | 'PERCENTAGE_50'
    | 'REFUNDED'
    | 'PARTIAL';
type MemberShipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export default function MyBookingsPage() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const toast = useToastContext();

    // Get current user from localStorage or context
    const getCurrentUser = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    };
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch user's bookings from API
    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                setLoading(true);
                setError('');

                const currentUser = getCurrentUser();
                console.log('Current user:', currentUser);

                if (!currentUser || !currentUser.id) {
                    setError('Vui lòng đăng nhập để xem booking của bạn');
                    setLoading(false);
                    return;
                }

                const userBookings = await getMyBookingsByCustomerId(
                    currentUser.id,
                );
                console.log('User bookings:', userBookings);

                // Validate and clean booking data to prevent runtime errors
                const validatedBookings = userBookings.filter((booking) => {
                    if (!booking || !booking.bookingID) {
                        console.warn('Invalid booking data:', booking);
                        return false;
                    }
                    return true;
                });

                setBookings(validatedBookings);
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError(
                    'Không thể tải danh sách booking. Vui lòng thử lại sau.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, []);

    const statusConfig: Record<
        BookingStatus,
        { label: string; color: string; icon: string }
    > = {
        PENDING: {
            label: 'Pending',
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: '',
        },
        WAITING: {
            label: 'Waiting',
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: '',
        },
        CONFIRMED: {
            label: 'Confirmed',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            icon: '',
        },
        CHECKED_IN: {
            label: 'Checked In',
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            icon: '',
        },
        CHECKED_OUT: {
            label: 'Checked Out',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: '',
        },
        CANCELLED: {
            label: 'Cancelled',
            color: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: '',
        },
    };

    const paymentStatusConfig: Record<
        PaymentStatus,
        { label: string; color: string; icon: JSX.Element }
    > = {
        PENDING: {
            label: 'Pending Payment',
            color: 'text-amber-600',
            icon: <AlertCircle size={16} />,
        },
        PAID: {
            label: 'Payment Completed',
            color: 'text-emerald-600',
            icon: <CheckCircle size={16} />,
        },
        COMPLETED: {
            label: 'Payment Completed',
            color: 'text-emerald-600',
            icon: <CheckCircle size={16} />,
        },
        PERCENTAGE_30: {
            label: 'Paid 30%',
            color: 'text-emerald-600',
            icon: <CheckCircle size={16} />,
        },
        PERCENTAGE_50: {
            label: 'Paid 50%',
            color: 'text-emerald-600',
            icon: <CheckCircle size={16} />,
        },
        REFUNDED: {
            label: 'Refunded',
            color: 'text-blue-600',
            icon: <CheckCircle size={16} />,
        },
        PARTIAL: {
            label: 'Partial Payment',
            color: 'text-orange-600',
            icon: <AlertCircle size={16} />,
        },
    };

    const membershipBadge: Record<MemberShipLevel, string> = {
        BRONZE: 'bg-orange-100 text-orange-700 border-orange-300',
        SILVER: 'bg-gray-100 text-gray-700 border-gray-300',
        GOLD: 'bg-yellow-50 text-yellow-700 border-yellow-300',
        PLATINUM: 'bg-purple-50 text-purple-700 border-purple-300',
    };

    // Helper functions for safe config access
    const getStatusConfig = (status: string) => {
        const config = statusConfig[status as BookingStatus];
        return (
            config || {
                label: status || 'Unknown',
                color: 'bg-gray-100 text-gray-600 border-gray-200',
                icon: '',
            }
        );
    };

    const getPaymentStatusConfig = (paymentStatus: string) => {
        const config = paymentStatusConfig[paymentStatus as PaymentStatus];
        return (
            config || {
                label: paymentStatus || 'Unknown',
                color: 'text-gray-600',
                icon: <AlertCircle size={16} />,
            }
        );
    };

    const getMembershipBadge = (memberShipLevel: string) => {
        const badge = membershipBadge[memberShipLevel as MemberShipLevel];
        return badge || 'bg-gray-100 text-gray-600 border-gray-300';
    };

    // Handle navigation to booking detail page
    const handleViewDetails = (bookingId: string) => {
        navigate(`/customer/mybooking/${bookingId}`);
    };

    const handleReportIncident = (booking: Booking) => {
        // Navigate to incident report page with booking details
        const roomNumber = booking.bookingDetails?.[0]?.room?.roomNumber || '';
        const roomId = booking.bookingDetails?.[0]?.room?.roomID || '';

        navigate('/customer/room/incident', {
            state: {
                bookingId: booking.bookingID,
                roomNumber: roomNumber,
                roomId: roomId,
                booking: booking,
            },
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesFilter =
            activeFilter === 'all' ||
            booking.status === activeFilter.toUpperCase();
        const matchesSearch =
            booking.bookingID
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (booking.bookingDetails[0]?.room?.roomType?.typeName || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleNavigate = (bookingId: string) => {
        navigate(`/customer/reviews/${bookingId}`);
    };

    const hasBookingReview = (booking: Booking) =>
        booking.bookingDetails?.some((bookingDetail) =>
            Boolean(bookingDetail.review),
        ) ?? false;

    const handlePayment = async (bookingId: string) => {
        try {
            const booking = await getBookingById(bookingId);

            if (!booking) {
                toast.error(
                    'Cannot loading booking information. Please try again.',
                );
                return;
            }

            // Navigate to payment page with booking data in state
            navigate(`/customer/payment`, {
                state: { booking },
            });
        } catch (error) {
            console.error('Error loading booking for payment:', error);
            toast.error(
                'Cannot loading booking information. Please try again.',
            );
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
            {/* HEADER */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
                <Header />
            </div>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 py-8 mt-18">
                {/* PAGE TITLE */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-black mb-2">
                        My Bookings
                    </h1>
                    <p className="text-black/60">
                        Manage and view all your hotel reservations
                    </p>
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B] mx-auto mb-4"></div>
                        <p className="text-black/60">
                            Đang tải danh sách booking...
                        </p>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-center">
                        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Có lỗi xảy ra
                        </h3>
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* NO DATA STATE */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Chưa có booking nào
                        </h3>
                        <p className="text-gray-500">
                            Bạn chưa có đặt phòng nào. Hãy đặt phòng đầu tiên
                            của bạn!
                        </p>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <>
                        {/* SEARCH & FILTERS */}
                        <div className="mb-8 space-y-4">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by booking ID or room type..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:border-black transition-all bg-white"
                                    style={{ borderColor: '#F5F0EB' }}
                                />
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {[
                                    {
                                        value: 'all',
                                        label: 'All Bookings',
                                        icon: '',
                                    },
                                    {
                                        value: 'pending',
                                        label: 'Pending',
                                        icon: '',
                                    },
                                    {
                                        value: 'confirmed',
                                        label: 'Confirmed',
                                        icon: '',
                                    },
                                    {
                                        value: 'checked_in',
                                        label: 'Checked In',
                                        icon: '',
                                    },
                                    {
                                        value: 'checked_out',
                                        label: 'Checked Out',
                                        icon: '',
                                    },
                                    {
                                        value: 'cancelled',
                                        label: 'Cancelled',
                                        icon: '',
                                    },
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() =>
                                            setActiveFilter(filter.value)
                                        }
                                        className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 ${
                                            activeFilter === filter.value
                                                ? 'bg-[#b9ad96] border border-[#b9ad96] text-white shadow-lg'
                                                : 'bg-white text-black border hover:bg-[#F5F0EB]'
                                        }`}
                                        style={
                                            activeFilter !== filter.value
                                                ? { borderColor: '#F5F0EB' }
                                                : {}
                                        }
                                    >
                                        <span className="mr-2">
                                            {filter.icon}
                                        </span>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BOOKINGS GRID */}
                        <div className="grid gap-6">
                            {filteredBookings.length === 0 ? (
                                <div
                                    className="bg-white rounded-3xl border-2 p-12 text-center"
                                    style={{ borderColor: '#F5F0EB' }}
                                >
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-bold text-black mb-2">
                                        No Bookings Found
                                    </h3>
                                    <p className="text-black/60">
                                        Try adjusting your search or filters
                                    </p>
                                </div>
                            ) : (
                                filteredBookings.map((booking) => {
                                    // Validate booking data to prevent runtime errors
                                    if (!booking || !booking.bookingID) {
                                        console.warn(
                                            '⚠️ Skipping invalid booking:',
                                            booking,
                                        );
                                        return null;
                                    }

                                    const roomDetail =
                                        booking.bookingDetails?.[0];
                                    const room = roomDetail?.room;
                                    const alreadyReviewed =
                                        hasBookingReview(booking);

                                    return (
                                        <div
                                            key={booking.bookingID}
                                            className="bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                            style={{ borderColor: '#F5F0EB' }}
                                        >
                                            <div className="grid md:grid-cols-12 gap-0">
                                                {/* IMAGE */}
                                                <div className="md:col-span-4 relative h-64 md:h-auto">
                                                    <img
                                                        src={
                                                            room?.images?.[0] ||
                                                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
                                                        }
                                                        alt={
                                                            room?.roomType
                                                                ?.typeName ||
                                                            'Room'
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                        <span
                                                            className={`px-8 py-2 rounded-full text-sm font-semibold border-2 backdrop-blur-md ${
                                                                getStatusConfig(
                                                                    booking.status,
                                                                ).color
                                                            }`}
                                                        >
                                                            {
                                                                getStatusConfig(
                                                                    booking.status,
                                                                ).icon
                                                            }{' '}
                                                            {
                                                                getStatusConfig(
                                                                    booking.status,
                                                                ).label
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CONTENT */}
                                                <div className="md:col-span-8 p-8">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-2xl font-bold text-black">
                                                                    {room
                                                                        ?.roomType
                                                                        ?.typeName ||
                                                                        'Room'}
                                                                </h3>
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMembershipBadge(
                                                                        booking
                                                                            .customer
                                                                            ?.memberShipLevel ||
                                                                            '',
                                                                    )}`}
                                                                >
                                                                    {booking
                                                                        .customer
                                                                        ?.memberShipLevel ||
                                                                        ''}
                                                                </span>
                                                            </div>
                                                            <p className="text-black/60 font-medium mb-1">
                                                                Room{' '}
                                                                {
                                                                    room?.roomNumber
                                                                }{' '}
                                                                · Floor{' '}
                                                                {room?.floor}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-black/60">
                                                                <MapPin
                                                                    size={16}
                                                                />
                                                                <span className="text-sm">
                                                                    Vista Luxury
                                                                    Hotel
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-black/60 mb-1">
                                                                Total Amount
                                                            </p>
                                                            <p className="text-3xl font-bold text-black">
                                                                {booking.totalAmount.toLocaleString()}{' '}
                                                                <span className="text-lg">
                                                                    VNĐ
                                                                </span>
                                                            </p>
                                                            <div
                                                                className={`flex items-center gap-1 justify-end mt-2 text-sm font-medium ${
                                                                    getPaymentStatusConfig(
                                                                        booking.paymentStatus,
                                                                    ).color
                                                                }`}
                                                            >
                                                                {
                                                                    getPaymentStatusConfig(
                                                                        booking.paymentStatus,
                                                                    ).icon
                                                                }
                                                                <span>
                                                                    {
                                                                        getPaymentStatusConfig(
                                                                            booking.paymentStatus,
                                                                        ).label
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* BOOKING DETAILS */}
                                                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                                                        <div
                                                            className="p-4 rounded-2xl"
                                                            style={{
                                                                backgroundColor:
                                                                    '#F5F0EB',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 text-black/60 mb-2">
                                                                <Calendar
                                                                    size={18}
                                                                />
                                                                <span className="text-sm font-semibold">
                                                                    Check-in
                                                                </span>
                                                            </div>
                                                            <p className="text-lg font-bold text-black">
                                                                {formatDate(
                                                                    booking.checkInDate,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="p-4 rounded-2xl"
                                                            style={{
                                                                backgroundColor:
                                                                    '#F5F0EB',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 text-black/60 mb-2">
                                                                <Calendar
                                                                    size={18}
                                                                />
                                                                <span className="text-sm font-semibold">
                                                                    Check-out
                                                                </span>
                                                            </div>
                                                            <p className="text-lg font-bold text-black">
                                                                {formatDate(
                                                                    booking.checkOutDate,
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div
                                                            className="p-4 rounded-2xl"
                                                            style={{
                                                                backgroundColor:
                                                                    '#F5F0EB',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 text-black/60 mb-2">
                                                                <Users
                                                                    size={18}
                                                                />
                                                                <span className="text-sm font-semibold">
                                                                    Guests &
                                                                    Nights
                                                                </span>
                                                            </div>
                                                            <p className="text-lg font-bold text-black">
                                                                {
                                                                    booking.numberOfGuests
                                                                }{' '}
                                                                Guests ·{' '}
                                                                {
                                                                    booking.duration
                                                                }{' '}
                                                                Nights
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* AMENITIES */}
                                                    {room?.roomType?.amenties &&
                                                        room.roomType.amenties
                                                            .length > 0 && (
                                                            <div className="mb-6">
                                                                <p className="text-sm font-semibold text-black/70 mb-2">
                                                                    Amenities
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {room.roomType.amenties.map(
                                                                        (
                                                                            amenity,
                                                                            idx,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="px-3 py-1 bg-white border-2 rounded-full text-xs font-medium text-black"
                                                                                style={{
                                                                                    borderColor:
                                                                                        '#F5F0EB',
                                                                                }}
                                                                            >
                                                                                {
                                                                                    amenity
                                                                                }
                                                                            </span>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* SPECIAL REQUESTS & EXTRA SERVICES */}
                                                    {(booking.specialRequests ||
                                                        booking.earlyCheckin) && (
                                                        <div className="mb-6 p-4 rounded-2xl bg-blue-50 border-2 border-blue-100">
                                                            <p className="text-sm font-semibold text-blue-900 mb-2">
                                                                Additional
                                                                Information
                                                            </p>
                                                            {booking.specialRequests && (
                                                                <p className="text-sm text-blue-700 mb-2">
                                                                    • Special
                                                                    Request:{' '}
                                                                    {
                                                                        booking.specialRequests
                                                                    }
                                                                </p>
                                                            )}
                                                            {booking.earlyCheckin && (
                                                                <p className="text-sm text-blue-700">
                                                                    • Early
                                                                    Check-in:{' '}
                                                                    {
                                                                        booking
                                                                            .earlyCheckin
                                                                            .approvalStatus
                                                                    }
                                                                    {booking
                                                                        .earlyCheckin
                                                                        .additionalFee >
                                                                        0 &&
                                                                        ` (+${booking.earlyCheckin.additionalFee.toLocaleString()} VNĐ)`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* BOOKING META */}
                                                    <div
                                                        className="flex items-center justify-between pt-4 border-t-2"
                                                        style={{
                                                            borderColor:
                                                                '#F5F0EB',
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 text-black/60">
                                                            <Clock size={16} />
                                                            <span className="text-sm">
                                                                Booked on{' '}
                                                                {formatDate(
                                                                    booking.bookingDate,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm font-mono text-black/60">
                                                            <span>
                                                                ID:{' '}
                                                                {
                                                                    booking.bookingID
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* ACTIONS */}
                                                    <div className="flex gap-3 mt-6">
                                                        {/* Report Incident button - only show for CHECKED_IN status */}
                                                        {booking.status ===
                                                            'CHECKED_IN' && (
                                                            <button
                                                                onClick={() =>
                                                                    handleReportIncident(
                                                                        booking,
                                                                    )
                                                                }
                                                                className="cursor-pointer flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                                                            >
                                                                <AlertTriangle
                                                                    size={18}
                                                                />
                                                                Report Incident
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    booking.bookingID,
                                                                )
                                                            }
                                                            className=" cursor-pointer flex-1 bg-black hover:bg-black/90 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                                                        >
                                                            View Details
                                                            <ChevronRight
                                                                size={18}
                                                            />
                                                        </button>

                                                        {/* REVIEWS */}
                                                        {booking.status ===
                                                            'CHECKED_OUT' && (
                                                            <button
                                                                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                                                    alreadyReviewed
                                                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                                        : 'bg-amber-400 hover:bg-amber-400/90 text-white hover:shadow-lg'
                                                                }`}
                                                                disabled={
                                                                    alreadyReviewed
                                                                }
                                                                onClick={() =>
                                                                    handleNavigate(
                                                                        booking.bookingID,
                                                                    )
                                                                }
                                                            >
                                                                {alreadyReviewed
                                                                    ? 'Reviewed'
                                                                    : 'Reviews'}
                                                            </button>
                                                        )}

                                                        {/* PAYMENT */}
                                                        {booking.paymentStatus ===
                                                            'PENDING' &&
                                                            booking.status ===
                                                                'WAITING' && (
                                                                <button
                                                                    className="flex-1 bg-white hover:bg-white/90 text-[#c3923c] py-3 px-6 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 border-2 border-[#c3923c]"
                                                                    onClick={() =>
                                                                        handlePayment(
                                                                            booking.bookingID,
                                                                        )
                                                                    }
                                                                >
                                                                    Make Payment
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
