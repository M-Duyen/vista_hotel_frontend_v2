/*eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Filter, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import IncidentReportForm from '../../components/customer/IncidentReportForm';
import IncidentCard from '../../components/customer/IncidentCard';
import IncidentDetailModal from '../../components/customer/IncidentDetailModal';
import RoomChangeForm from '../../components/room/RoomChangeForm';
import type { RoomChangeRequest } from '../../components/room/RoomChangeForm';
import Header from '../../components/Header';
import type {
    IncidentFormData,
    IncidentReport as IncidentReportType,
    IncidentStatus,
} from '../../types/Incident';
import incidentService from '../../services/incidentService';
import bookingService from '../../services/bookingService';
import roomChangeRequestService, {
    type RoomChangeRequestResponse,
} from '../../services/roomChangeRequestService';
import type { Booking } from '../../types/Booking';
import { useToast } from '../../hooks/useToast';

interface UserData {
    id?: string;
    customerId?: string;
    customerID?: string;
    email?: string;
    fullName?: string;
}

const IncidentReport: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<UserData | null>(null);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string>('');
    const selectedBookingIdRef = useRef<string>(''); // Keep track of current selection
    const [incidents, setIncidents] = useState<IncidentReportType[]>([]);

    // Helper to update both state and ref
    const updateSelectedBookingId = useCallback((bookingId: string) => {
        setSelectedBookingId(bookingId);
        selectedBookingIdRef.current = bookingId;
    }, []);

    const { success, error } = useToast();

    const loadUserBookings = useCallback(
        async (customerId: string) => {
            try {
                console.log('🔄 Loading bookings for customer:', customerId);
                const allBookings = await bookingService.getAll();

                console.log(
                    '📊 All bookings from API:',
                    allBookings.length,
                    'total',
                );
                console.log('👤 Looking for customer ID:', customerId);

                // Get user info for matching
                const userStr = localStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;
                const userEmail = userData?.email || user?.email;
                const userFullName = userData?.fullName || user?.fullName;

                console.log('📧 User email:', userEmail);
                console.log('👤 User name:', userFullName);

                // Filter bookings for this customer that are active (CHECKED_IN, CONFIRMED, or PENDING)
                const userActiveBookings = allBookings.filter(
                    (booking: Booking) => {
                        const bookingCustomerId = booking.customer?.id;
                        const bookingEmail = booking.customer?.email;
                        const bookingFullName = booking.customer?.fullName;

                        // Match by Customer ID
                        const matchById =
                            bookingCustomerId &&
                            String(bookingCustomerId) === String(customerId);

                        // Match by Email (nếu có)
                        const matchByEmail =
                            userEmail &&
                            bookingEmail &&
                            bookingEmail.toLowerCase() ===
                                userEmail.toLowerCase();

                        // Match by Full Name (tên khách hàng)
                        const matchByName =
                            userFullName &&
                            bookingFullName &&
                            bookingFullName.toLowerCase().trim() ===
                                userFullName.toLowerCase().trim();

                        // Allow CHECKED_IN, CONFIRMED, and PENDING bookings
                        const allowedStatuses = [
                            'CHECKED_IN',
                            'CONFIRMED',
                            'PENDING',
                        ];
                        const statusAllowed = allowedStatuses.includes(
                            booking.status,
                        );

                        const isMatch =
                            matchById || matchByEmail || matchByName;

                        console.log(`📋 Booking ${booking.bookingID}:`, {
                            bookingCustomerId,
                            bookingEmail,
                            bookingFullName,
                            customerId,
                            userEmail,
                            userFullName,
                            matchById,
                            matchByEmail,
                            matchByName,
                            status: booking.status,
                            statusAllowed,
                            willShow: isMatch && statusAllowed,
                        });

                        // Show bookings that match user (by ID, email, or name) AND have allowed status
                        return isMatch && statusAllowed;
                    },
                );

                console.log(
                    '✅ Found',
                    userActiveBookings.length,
                    'active bookings for user',
                );
                console.log(
                    '📝 User bookings:',
                    userActiveBookings.map((b) => ({
                        id: b.bookingID,
                        status: b.status,
                        customer: b.customer?.fullName,
                        room: b.bookingDetails?.[0]?.room?.roomNumber,
                    })),
                );

                setUserBookings(userActiveBookings);

                // Auto-select first booking if available AND no booking is currently selected
                if (
                    userActiveBookings.length > 0 &&
                    !selectedBookingIdRef.current
                ) {
                    updateSelectedBookingId(userActiveBookings[0].bookingID);
                } else {
                    console.warn('⚠️ No active bookings found for this user.');
                }

                // Stop loading
                setIsLoading(false);
            } catch (err) {
                console.error('❌ Error loading bookings:', err);
                error('Không thể tải thông tin đặt phòng');
                setIsLoading(false);
            }
        },
        [selectedBookingIdRef, updateSelectedBookingId, error],
    );

    const [filteredIncidents, setFilteredIncidents] = useState<
        IncidentReportType[]
    >([]);
    const [myRoomChangeRequests, setMyRoomChangeRequests] = useState<
        RoomChangeRequestResponse[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showRoomChangeForm, setShowRoomChangeForm] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
    const [selectedIncident, setSelectedIncident] =
        useState<IncidentReportType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        | IncidentStatus
        | 'ALL'
        | 'ROOM_PENDING'
        | 'ROOM_APPROVED'
        | 'ROOM_REJECTED'
        | 'ROOM_COMPLETED'
    >('ALL');
    const [pendingOverOneHour, setPendingOverOneHour] = useState<
        IncidentReportType[]
    >([]);
    const [showAutoRoomChangeSuggestion, setShowAutoRoomChangeSuggestion] =
        useState(false);

    // Check authentication and load user's bookings

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            console.log('👤 Logged in user:', userData);
            setUser(userData);

            // Get customer ID from user object (check multiple possible field names)
            const customerId =
                userData.customerId || userData.customerID || userData.id;
            console.log('🔑 Customer ID to search:', customerId);

            if (customerId) {
                // Load user's bookings
                loadUserBookings(customerId);
            } else {
                console.error('❌ No customer ID found in user object');
                error('Không tìm thấy thông tin khách hàng');
            }
        }
    }, []);

    // Handle navigation state from MyBookings page
    useEffect(() => {
        if (location.state) {
            const { bookingId, roomNumber, roomId, booking } =
                location.state as {
                    bookingId?: string;
                    roomNumber?: string;
                    roomId?: string;
                    booking?: Booking;
                };

            console.log('📍 Received navigation state:', location.state);

            if (bookingId && booking) {
                updateSelectedBookingId(bookingId);
                setCurrentBooking(booking);
                setShowForm(true); // Auto-open the incident report form

                // Clear the navigation state after handling
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state]);

    // Auto-refresh bookings every 5 seconds to detect check-in status changes

    useEffect(() => {
        if (!user) return;

        const customerId = user.customerId || user.customerID || user.id;
        if (!customerId) return;

        const intervalId = setInterval(() => {
            console.log('🔄 Auto-refreshing bookings...');
            loadUserBookings(customerId);
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(intervalId);
    }, [user, loadUserBookings]);

    // Check for incidents pending over 1 hour and suggest room change
    useEffect(() => {
        if (incidents.length === 0) {
            setPendingOverOneHour([]);
            setShowAutoRoomChangeSuggestion(false);
            return;
        }

        const checkInterval = setInterval(() => {
            const now = new Date().getTime();
            const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds

            // Get list of bookings that already have room change requests (approved or pending)
            const bookingsWithRoomChange = new Set(
                myRoomChangeRequests
                    .filter(
                        (req) =>
                            req.status === 'PENDING' ||
                            req.status === 'COMPLETED',
                    )
                    .map((req) => req.booking.bookingID),
            );

            const overOneHour = incidents.filter((incident) => {
                if (incident.status !== 'PENDING') return false;

                // Don't show if there's already a room change request for THIS incident's booking
                if (
                    incident.bookingId &&
                    bookingsWithRoomChange.has(incident.bookingId)
                )
                    return false;

                const reportedTime = new Date(incident.reportedDate).getTime();
                const timeDiff = now - reportedTime;

                return timeDiff >= oneHourInMs;
            });

            setPendingOverOneHour(overOneHour);

            if (overOneHour.length > 0 && !showAutoRoomChangeSuggestion) {
                setShowAutoRoomChangeSuggestion(true);
            } else if (overOneHour.length === 0) {
                setShowAutoRoomChangeSuggestion(false);
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(checkInterval);
    }, [
        incidents,
        myRoomChangeRequests,
        selectedBookingId,
        showAutoRoomChangeSuggestion,
    ]);

    const loadIncidents = useCallback(async () => {
        if (!user || !selectedBookingId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            console.log('🔄 Loading customer incidents...');
            const customerId = user.customerId || user.customerID || user.id;
            if (!customerId) {
                console.error('❌ No customer ID found');
                setIsLoading(false);
                return;
            }
            // Load incidents by customer ID AND booking ID
            const data = await incidentService.getCustomerIncidents(
                customerId,
                selectedBookingId,
            );

            // CRITICAL FIX: Ensure all incidents have bookingId
            const fixedData = data.map((incident) => {
                if (!incident.bookingId) {
                    console.warn(
                        '⚠️ Fixing missing bookingId for incident:',
                        incident.id,
                    );
                    return { ...incident, bookingId: selectedBookingId };
                }
                return incident;
            });

            console.log('✅ Loaded incidents:', fixedData.length, 'records');
            console.log('📊 Data:', fixedData);

            // Only update if data has changed to prevent unnecessary re-renders
            setIncidents((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(fixedData)) {
                    return prev; // No change, return previous state
                }
                return fixedData;
            });
        } catch (err) {
            console.error('❌ Error loading incidents:', err);
            error('Không thể tải danh sách báo cáo');
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedBookingId, error]);

    const loadCurrentBooking = useCallback(async () => {
        if (!selectedBookingId) {
            error('Vui lòng chọn booking trước');
            return null;
        }

        try {
            console.log('🔄 Loading current booking...');
            const booking = await bookingService.getBookingById(
                selectedBookingId,
            );
            console.log('✅ Loaded booking:', booking);
            setCurrentBooking(booking);
            return booking;
        } catch (err) {
            console.error('❌ Error loading booking:', err);
            error('Không thể tải thông tin đặt phòng');
            return null;
        }
    }, [selectedBookingId, error]);

    // Load room change requests for current user from API
    const loadMyRoomChangeRequests = useCallback(async () => {
        if (!selectedBookingId) return;

        try {
            console.log(
                '🔄 Loading room change requests from API for booking:',
                selectedBookingId,
            );
            const requests =
                await roomChangeRequestService.getRequestsByBookingId(
                    selectedBookingId,
                );

            console.log('📋 My room change requests:', requests);

            // Only update if data has changed to prevent unnecessary re-renders
            setMyRoomChangeRequests((prev) => {
                if (JSON.stringify(prev) === JSON.stringify(requests)) {
                    return prev; // No change, return previous state
                }
                return requests;
            });
        } catch (err) {
            console.error('❌ Error loading room change requests:', err);
        }
    }, [selectedBookingId]);

    const filterIncidents = useCallback(() => {
        let filtered = incidents;

        // Filter by selected booking (room)
        if (selectedBookingId) {
            filtered = filtered.filter(
                (inc) => inc.bookingId === selectedBookingId,
            );
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((inc) => inc.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (inc) =>
                    inc.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    inc.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    inc.roomNumber?.includes(searchTerm),
            );
        }

        setFilteredIncidents(filtered);
    }, [incidents, searchTerm, statusFilter, selectedBookingId]);

    useEffect(() => {
        if (selectedBookingId) {
            loadIncidents();
            loadMyRoomChangeRequests();
        }
    }, [loadIncidents, loadMyRoomChangeRequests, selectedBookingId]);

    useEffect(() => {
        filterIncidents();
    }, [filterIncidents]);

    const handleCreateIncident = async (formData: IncidentFormData) => {
        try {
            console.log('📝 Creating incident with data:', formData);
            // Create via API
            const newIncident = await incidentService.createIncident(formData);
            console.log('✅ Created incident:', newIncident);

            // IMPORTANT: Ensure bookingId is set (backend might not return it)
            if (!newIncident.bookingId && formData.bookingId) {
                newIncident.bookingId = formData.bookingId;
                console.log('✅ Fixed bookingId:', newIncident.bookingId);
            }

            setIncidents((prev) => [newIncident, ...prev]);

            success('Báo cáo sự cố đã được gửi thành công');
            setShowForm(false);
        } catch (err) {
            console.error('❌ Error creating incident:', err);
            error('Có lỗi xảy ra khi gửi báo cáo');
            throw err;
        }
    };

    const handleSubmitRoomChange = async (data: RoomChangeRequest) => {
        try {
            console.log('📝 Submitting room change request to API:', data);

            // Create request DTO for API
            const requestDTO = {
                bookingId: data.bookingId,
                currentRoomNumber: data.currentRoomNumber,
                newRoomNumber: data.newRoomNumber,
                reason: data.reason,
            };

            // Call API to create request
            const newRequest = await roomChangeRequestService.createRequest(
                requestDTO,
            );

            console.log(
                '✅ Room change request submitted successfully:',
                newRequest,
            );
            success('Room change request submitted successfully');
            setShowRoomChangeForm(false);

            // Reload room change requests
            await loadMyRoomChangeRequests();
        } catch (err) {
            console.error('❌ Error submitting room change request:', err);
            error('An error occurred while submitting the request');
            throw err;
        }
    };

    // Check if user is logged in and is a customer
    if (!user) {
        return (
            <div className="min-h-screen">
                <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
                    <Header />
                </div>
                <div
                    className="min-h-screen pt-16"
                    style={{
                        background: 'var(--gradient-cream)',
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    <div className="max-w-4xl mx-auto px-4 py-20">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Authentication Required
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                You need to log in as a customer to access the
                                incident report feature.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/auth/login')}
                                    className="bg-[#CCBDA3] text-white hover:bg-[#b8a88a] px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Login Now
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-8 py-3 rounded-lg font-semibold transition-all"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
                <Header />
            </div>

            {/* Main Content */}
            <div
                className="min-h-screen pt-20 pb-12"
                style={{
                    background: 'var(--gradient-cream)',
                    fontFamily: 'var(--font-sans)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header - Elegant Design */}
                    <div className="text-center mb-12 pt-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#CCBDA3] to-[#B8A890] mb-4 shadow-lg">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-playfair font-bold text-[#6B4B28] mb-3">
                            Incident Report
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#CCBDA3] to-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Report and track issues during your stay with our
                            dedicated support team
                        </p>
                    </div>

                    {/* Combined Control Panel - Booking Selection, Search & Actions */}
                    <div className="bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border-2 border-[#CCBDA3]/30">
                        {/* Booking Selector Section */}
                        {userBookings.length > 0 ? (
                            <></>
                        ) : (
                            !isLoading && (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-5 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-amber-900 font-bold mb-1">
                                                No Bookings Found
                                            </p>
                                            <p className="text-amber-700 text-sm">
                                                💡 You need a booking with
                                                status{' '}
                                                <span className="font-semibold">
                                                    PENDING
                                                </span>
                                                ,{' '}
                                                <span className="font-semibold">
                                                    CONFIRMED
                                                </span>
                                                , or{' '}
                                                <span className="font-semibold">
                                                    CHECKED_IN
                                                </span>{' '}
                                                to use this feature.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {/* All Controls in One Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Booking Selector */}
                            {userBookings.length > 0 && (
                                <div className="lg:col-span-3 relative">
                                    <select
                                        value={selectedBookingId}
                                        onChange={(e) =>
                                            updateSelectedBookingId(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-4 py-3 border-2 border-[#CCBDA3]/40 rounded-xl focus:ring-2 focus:ring-[#CCBDA3] focus:border-[#CCBDA3] bg-white text-gray-800 font-medium transition-all hover:border-[#CCBDA3] hover:shadow-md appearance-none cursor-pointer text-sm"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B4B28'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition:
                                                'right 0.75rem center',
                                            backgroundSize: '1.25rem',
                                        }}
                                    >
                                        {userBookings.map((booking) => {
                                            let statusEmoji = '📋';
                                            if (booking.status === 'CHECKED_IN')
                                                statusEmoji = '🏨';
                                            else if (
                                                booking.status === 'CONFIRMED'
                                            )
                                                statusEmoji = '✅';
                                            else if (
                                                booking.status === 'PENDING'
                                            )
                                                statusEmoji = '⏳';

                                            const roomNumber =
                                                booking.bookingDetails?.[0]
                                                    ?.room?.roomNumber || 'N/A';
                                            return (
                                                <option
                                                    key={booking.bookingID}
                                                    value={booking.bookingID}
                                                >
                                                    {statusEmoji} Room{' '}
                                                    {roomNumber}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}

                            {/* Search Bar */}
                            <div
                                className={`${
                                    userBookings.length > 0
                                        ? 'lg:col-span-3'
                                        : 'lg:col-span-4'
                                } relative group`}
                            >
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCBDA3] transition-colors group-hover:text-[#B8A890]" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-3 border-2 border-[#CCBDA3]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] focus:border-[#CCBDA3] transition-all bg-white placeholder:text-gray-400 hover:border-[#CCBDA3]/50"
                                />
                            </div>

                            {/* Status Filter */}
                            <div
                                className={`${
                                    userBookings.length > 0
                                        ? 'lg:col-span-2'
                                        : 'lg:col-span-3'
                                } flex items-center gap-2`}
                            >
                                <Filter className="w-5 h-5 text-[#CCBDA3] flex-shrink-0" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value as
                                                | IncidentStatus
                                                | 'ALL',
                                        )
                                    }
                                    className="w-full px-3 py-2.5 border-2 border-[#CCBDA3]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] focus:border-[#CCBDA3] transition-all bg-white font-medium text-[#6B4B28] hover:border-[#CCBDA3]/50 text-sm"
                                >
                                    <option value="ALL">All Status</option>
                                    <optgroup label="Incident Reports">
                                        <option value="PENDING">Pending</option>
                                        <option value="COMPLETED">
                                            Completed
                                        </option>
                                        <option value="FAILED">Failed</option>
                                    </optgroup>
                                    <optgroup label="Room Change">
                                        <option value="ROOM_PENDING">
                                            Pending
                                        </option>
                                        <option value="ROOM_APPROVED">
                                            Approved
                                        </option>
                                        <option value="ROOM_REJECTED">
                                            Rejected
                                        </option>
                                        <option value="ROOM_COMPLETED">
                                            Completed
                                        </option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div
                                className={`${
                                    userBookings.length > 0
                                        ? 'lg:col-span-4'
                                        : 'lg:col-span-5'
                                } flex gap-3`}
                            >
                                <button
                                    onClick={async () => {
                                        const booking =
                                            await loadCurrentBooking();
                                        if (booking)
                                            setShowRoomChangeForm(true);
                                    }}
                                    disabled={!selectedBookingId}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none text-sm"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden xl:inline">
                                        Room Change Request
                                    </span>
                                    <span className="xl:hidden">
                                        Change Room
                                    </span>
                                </button>
                                <button
                                    onClick={() => setShowForm(true)}
                                    disabled={!selectedBookingId}
                                    className="flex-1 bg-gradient-to-r from-[#CCBDA3] to-[#B8A890] text-white hover:from-[#B8A890] hover:to-[#A69680] px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden xl:inline">
                                        Report Incident
                                    </span>
                                    <span className="xl:hidden">Report</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Auto Room Change Suggestion Banner */}
                    {showAutoRoomChangeSuggestion &&
                        pendingOverOneHour.length > 0 && (
                            <div className="mb-8 bg-gradient-to-r from-orange-50 via-red-50 to-rose-50 border-2 border-red-300 rounded-3xl shadow-2xl p-6 animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                                            <AlertCircle className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="text-xl font-bold text-red-900">
                                                🚨 Incident Resolution Time
                                                Exceeded
                                            </h3>
                                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                                Action Required
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-red-800 font-semibold">
                                                Your incident has been pending
                                                for over 1 hour. According to
                                                hotel policy:
                                            </p>
                                            <div className="bg-white/80 rounded-xl p-4 border-l-4 border-red-500">
                                                <p className="text-gray-800 font-medium mb-2">
                                                    📋 <strong>Policy:</strong>{' '}
                                                    If repairs cannot be
                                                    completed within 1 hour, the
                                                    hotel will offer a room
                                                    change to ensure your
                                                    comfort.
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {pendingOverOneHour.map(
                                                        (incident) => (
                                                            <div
                                                                key={
                                                                    incident.id
                                                                }
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium border border-red-300"
                                                            >
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        incident.title
                                                                    }
                                                                </span>
                                                                <span className="text-xs opacity-75">
                                                                    (
                                                                    {Math.floor(
                                                                        (new Date().getTime() -
                                                                            new Date(
                                                                                incident.reportedDate,
                                                                            ).getTime()) /
                                                                            (1000 *
                                                                                60),
                                                                    )}{' '}
                                                                    min)
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={async () => {
                                                        const booking =
                                                            await loadCurrentBooking();
                                                        if (booking) {
                                                            setShowRoomChangeForm(
                                                                true,
                                                            );
                                                            setShowAutoRoomChangeSuggestion(
                                                                false,
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        !selectedBookingId
                                                    }
                                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                    <span>
                                                        Request Room Change Now
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowAutoRoomChangeSuggestion(
                                                            false,
                                                        )
                                                    }
                                                    className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Room Change Requests Section - Premium Cards */}
                    {myRoomChangeRequests.length > 0 && (
                        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-blue-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <RefreshCw className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#6B4B28]">
                                    Room Change Requests
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {myRoomChangeRequests
                                    .filter((request) => {
                                        if (statusFilter === 'ALL') return true;
                                        if (statusFilter === 'ROOM_PENDING')
                                            return request.status === 'PENDING';
                                        if (statusFilter === 'ROOM_COMPLETED')
                                            return (
                                                request.status === 'COMPLETED'
                                            );
                                        if (
                                            statusFilter === 'ROOM_APPROVED' ||
                                            statusFilter === 'ROOM_REJECTED'
                                        )
                                            return request.status === 'FAILED';
                                        return true;
                                    })
                                    .map((request) => (
                                        <div
                                            key={request.requestID}
                                            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-[#CCBDA3]/20 p-6 hover:shadow-2xl hover:border-[#CCBDA3]/40 transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-[#CCBDA3]/10">
                                                <div>
                                                    <span className="inline-flex items-center px-3 py-1 bg-[#CCBDA3]/10 text-[#6B4B28] rounded-lg text-xs font-bold">
                                                        {request.requestID}
                                                    </span>
                                                    <div className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                                        <svg
                                                            className="w-4 h-4"
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
                                                        {new Date(
                                                            request.requestDate,
                                                        ).toLocaleString(
                                                            'vi-VN',
                                                        )}
                                                    </div>
                                                </div>
                                                {request.status ===
                                                    'PENDING' && (
                                                    <span className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm border border-yellow-300">
                                                        Đang chờ
                                                    </span>
                                                )}
                                                {request.status ===
                                                    'COMPLETED' && (
                                                    <span className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm border border-green-300">
                                                        Đã duyệt
                                                    </span>
                                                )}
                                                {request.status ===
                                                    'FAILED' && (
                                                    <span className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm border border-red-300">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border-2 border-blue-200">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            From:
                                                        </span>
                                                        <span className="px-3 py-1 text-sm font-bold text-gray-900 bg-white rounded-lg border-2 border-gray-300 shadow-sm">
                                                            {
                                                                request
                                                                    .currentRoom
                                                                    ?.roomNumber
                                                            }
                                                        </span>
                                                    </div>
                                                    <svg
                                                        className="w-6 h-6 text-blue-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                        />
                                                    </svg>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            To:
                                                        </span>
                                                        <span className="px-3 py-1 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
                                                            {
                                                                request.newRoom
                                                                    ?.roomNumber
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border-2 border-gray-200">
                                                    <span className="text-sm font-semibold text-gray-700 block mb-1">
                                                        Reason:
                                                    </span>
                                                    <span className="text-sm text-gray-800 leading-relaxed">
                                                        {request.reason}
                                                    </span>
                                                </div>
                                                {request.responseNote && (
                                                    <div className="mt-3 p-4 bg-gradient-to-br from-[#CCBDA3]/10 to-[#B8A890]/10 rounded-xl border-2 border-[#CCBDA3]/30">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <svg
                                                                className="w-4 h-4 text-[#6B4B28]"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                                />
                                                            </svg>
                                                            <span className="text-sm font-bold text-[#6B4B28]">
                                                                Staff Response:
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                                            {
                                                                request.responseNote
                                                            }
                                                        </p>
                                                        {request.processedBy && (
                                                            <p className="text-xs text-gray-600 font-medium">
                                                                Processed by:{' '}
                                                                <span className="text-[#6B4B28] font-semibold">
                                                                    {
                                                                        request.processedBy
                                                                    }
                                                                </span>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Incidents List - Premium Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Incident Reports
                            </h2>
                        </div>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#CCBDA3] mx-auto"></div>
                                    </div>
                                    <p className="mt-6 text-gray-700 font-semibold text-lg">
                                        Loading reports...
                                    </p>
                                </div>
                            </div>
                        ) : filteredIncidents.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 py-20 px-8 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#CCBDA3]/20 to-[#CCBDA3]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <Search className="w-10 h-10 text-[#CCBDA3]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {searchTerm || statusFilter !== 'ALL'
                                            ? 'No reports found'
                                            : 'No incident reports yet'}
                                    </h3>
                                    <p className="text-gray-600 text-base mb-8 leading-relaxed">
                                        {searchTerm || statusFilter !== 'ALL'
                                            ? 'Please try again with different keywords or filters'
                                            : 'You have not submitted any incident reports. Create your first report!'}
                                    </p>
                                    {!searchTerm && statusFilter === 'ALL' && (
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="bg-[#CCBDA3] text-white hover:bg-[#b8a88a] px-10 py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                                        >
                                            Create First Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredIncidents.map((incident) => {
                                    // Check if this incident is over 1 hour AND has no room change request yet
                                    const now = new Date().getTime();
                                    const reportedTime = new Date(
                                        incident.reportedDate,
                                    ).getTime();
                                    const timeDiff = now - reportedTime;
                                    const oneHourInMs = 60 * 60 * 1000;

                                    // Check if this incident's booking already has a room change request
                                    const hasRoomChangeRequest =
                                        myRoomChangeRequests.some(
                                            (req) =>
                                                req.booking.bookingID ===
                                                    incident.bookingId &&
                                                (req.status === 'PENDING' ||
                                                    req.status === 'COMPLETED'),
                                        );

                                    // Debug log
                                    console.log(
                                        '🔍 Incident:',
                                        incident.id,
                                        'BookingId:',
                                        incident.bookingId,
                                    );
                                    console.log(
                                        '🔍 Room Change Requests:',
                                        myRoomChangeRequests.map((r) => ({
                                            id: r.requestID,
                                            bookingId: r.booking.bookingID,
                                            status: r.status,
                                        })),
                                    );
                                    console.log(
                                        '🔍 Has Room Change Request:',
                                        hasRoomChangeRequest,
                                    );

                                    const isOverOneHour =
                                        incident.status === 'PENDING' &&
                                        timeDiff >= oneHourInMs &&
                                        !hasRoomChangeRequest;

                                    return (
                                        <IncidentCard
                                            key={incident.id}
                                            incident={incident}
                                            onClick={() =>
                                                setSelectedIncident(incident)
                                            }
                                            isOverOneHour={isOverOneHour}
                                            onRequestRoomChange={async () => {
                                                const booking =
                                                    await loadCurrentBooking();
                                                if (booking) {
                                                    setShowRoomChangeForm(true);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-[#CCBDA3] to-[#b8a88a] px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Create New Incident Report
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-1.5 hover:bg-black/10 rounded-md transition-colors"
                                >
                                    <Plus className="w-5 h-5 rotate-45 text-gray-900" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                                <IncidentReportForm
                                    bookingId={selectedBookingId}
                                    onSubmit={handleCreateIncident}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Change Form Modal */}
                {showRoomChangeForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    Room Change Request
                                </h2>
                                <button
                                    onClick={() => setShowRoomChangeForm(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <Plus className="w-5 h-5 rotate-45 text-white" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                                <RoomChangeForm
                                    currentBooking={currentBooking || undefined}
                                    onSubmit={handleSubmitRoomChange}
                                    onCancel={() =>
                                        setShowRoomChangeForm(false)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedIncident && (
                    <IncidentDetailModal
                        incident={selectedIncident}
                        onClose={() => setSelectedIncident(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default IncidentReport;
