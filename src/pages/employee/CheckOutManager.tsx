import { useState, useEffect, useRef } from 'react';
import StatusCards from '../../components/checkout/StatusCards';
import SearchFilter from '../../components/checkout/SearchFilter';
import CheckoutTabs from '../../components/checkout/CheckoutTabs';
import CheckoutTable from '../../components/checkout/CheckoutTable';
import CheckoutDetailsModal from '../../components/checkout/CheckoutDetailsModal';
import PaymentModal from '../../components/checkout/PaymentModal';
import CashConfirmationModal from '../../components/checkout/CashConfirmationModal';
import PaymentSuccessModal from '../../components/checkout/PaymentSuccessModal';
import * as bookingService from '../../services/bookingService';
import type { Booking } from '../../types/Booking';
import CustomCalendar from '../../components/checkin/CustomCalendar';
import { FaCalendarAlt } from 'react-icons/fa';

export default function CheckOutManager() {
    const [activeTab, setActiveTab] = useState('today');
    const [checkoutData, setCheckoutData] = useState<Booking[]>([]);
    const [filteredData, setFilteredData] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCheckoutDetailsModal, setShowCheckoutDetailsModal] =
        useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCashConfirmationModal, setShowCashConfirmationModal] =
        useState(false);
    const [showPaymentSuccessModal, setShowPaymentSuccessModal] =
        useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );

    // Date picker state
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const [paymentData, setPaymentData] = useState({
        bookingId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        guestImage: '',
        roomNumber: '',
        balanceDue: '',
        totalAmount: '',
        amountTendered: '',
        changeAmount: '',
    });

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target as Node)
            ) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    useEffect(() => {
        loadCheckoutData();
    }, [activeTab, currentDate]);

    const loadCheckoutData = async () => {
        setLoading(true);
        try {
            let data: Booking[] = [];
            const selectedDateStr = currentDate.toISOString().split('T')[0];

            switch (activeTab) {
                case 'today': {
                    data = await bookingService.getBookingsByCheckOutDate(
                        selectedDateStr,
                    );
                    data = data.filter((b) => b.status === 'CHECKED_IN');
                    break;
                }
                case 'tomorrow': {
                    const tomorrow = new Date(currentDate);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowStr = tomorrow.toISOString().split('T')[0];
                    data = await bookingService.getBookingsByCheckOutDate(
                        tomorrowStr,
                    );
                    data = data.filter((b) => b.status === 'CHECKED_IN');
                    break;
                }
                case 'late': {
                    const yesterday = new Date(currentDate);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    data = await bookingService.getBookingsByCheckOutDateRange(
                        yesterdayStr,
                        selectedDateStr,
                    );
                    data = data.filter((b) => {
                        const checkoutDate = new Date(b.checkOutDate);
                        return (
                            b.status === 'CHECKED_IN' &&
                            checkoutDate < currentDate
                        );
                    });
                    break;
                }
                case 'completed': {
                    const lastWeek = new Date(currentDate);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    const lastWeekStr = lastWeek.toISOString().split('T')[0];
                    data = await bookingService.getBookingsByCheckOutDateRange(
                        lastWeekStr,
                        selectedDateStr,
                    );
                    data = data.filter((b) => b.status === 'CHECKED_OUT');
                    break;
                }
            }

            setCheckoutData(data);
            setFilteredData(data);
        } catch (error) {
            console.error('Error loading checkout data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Change date by days (previous/next)
    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    // Handle date selection from calendar
    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
        setShowDatePicker(false);
    };

    const handleSearch = (keyword: string) => {
        if (!keyword.trim()) {
            setFilteredData(checkoutData);
            return;
        }

        const searchLower = keyword.toLowerCase();
        const filtered = checkoutData.filter(
            (booking) =>
                booking.bookingID.toLowerCase().includes(searchLower) ||
                booking.customer?.fullName
                    ?.toLowerCase()
                    .includes(searchLower) ||
                booking.customer?.email.toLowerCase().includes(searchLower) ||
                booking.bookingDetails.some((detail) =>
                    detail.room.roomNumber?.toString().includes(searchLower),
                ),
        );

        setFilteredData(filtered);
    };

    const handleFilter = (status: string) => {
        // Map filter status to tab ID and change active tab
        const statusToTab: { [key: string]: string } = {
            all: 'today',
            pending: 'today',
            completed: 'completed',
            late: 'late',
        };

        // Change active tab based on filter selection
        if (statusToTab[status]) {
            setActiveTab(statusToTab[status]);
        }

        // Also apply immediate filtering to current data
        if (status === 'all') {
            setFilteredData(checkoutData);
            return;
        }

        const today = new Date(currentDate);
        today.setHours(0, 0, 0, 0);

        let filtered = checkoutData;

        if (status === 'pending') {
            filtered = checkoutData.filter((b) => b.status === 'CHECKED_IN');
        } else if (status === 'completed') {
            filtered = checkoutData.filter((b) => b.status === 'CHECKED_OUT');
        } else if (status === 'late') {
            filtered = checkoutData.filter((b) => {
                if (b.status !== 'CHECKED_IN') return false;
                const checkOutDate = new Date(b.checkOutDate);
                checkOutDate.setHours(0, 0, 0, 0);
                return checkOutDate < today;
            });
        }

        setFilteredData(filtered);
    };

    const handleProcessCheckout = (booking: Booking) => {
        const roomInfo = booking.bookingDetails
            .map(
                (detail) =>
                    `${detail.room.roomNumber} - ${
                        detail.room.roomType?.roomTypeName || ''
                    }`,
            )
            .join(', ');

        const balanceDue =
            booking.paymentStatus === 'PAID'
                ? 0
                : booking.paymentStatus === 'PARTIAL'
                ? booking.totalAmount * 0.5
                : booking.totalAmount;

        setSelectedBooking(booking);
        setPaymentData({
            bookingId: booking.bookingID,
            guestName: booking.customer?.fullName || '',
            guestEmail: booking.customer?.email || '',
            guestPhone: booking.customer?.phoneNumber || '',
            guestImage: booking.customer?.avatarUrl || '',
            roomNumber: roomInfo,
            balanceDue: `${balanceDue.toLocaleString('vi-VN')} VND`,
            totalAmount: `${booking.totalAmount.toLocaleString('vi-VN')} VND`,
            amountTendered: '',
            changeAmount: '',
        });

        setShowCheckoutDetailsModal(true);
    };

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowCheckoutDetailsModal(true);
    };

    const handleProceedToPayment = () => {
        setShowCheckoutDetailsModal(false);
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async (
        paymentMethod: string,
        amountTendered?: string,
        changeAmount?: string,
        notes?: string,
    ) => {
        // Update payment data with new values
        if (amountTendered) {
            setPaymentData((prev) => ({
                ...prev,
                amountTendered,
                changeAmount: changeAmount || '0',
                notes: notes || '',
                paymentMethod,
            }));
        }

        if (paymentMethod === 'cash') {
            setShowPaymentModal(false);
            setShowCashConfirmationModal(true);
        } else if (paymentMethod === 'vnpay') {
            try {
                await bookingService.processCheckout(
                    paymentData.bookingId,
                    paymentMethod,
                );
                setShowPaymentModal(false);
                setShowPaymentSuccessModal(true);
                // Reload data immediately
                await loadCheckoutData();
            } catch (error) {
                console.error('Payment error:', error);
            }
        } else {
            setShowPaymentModal(false);
            setShowPaymentSuccessModal(true);
            // Reload data immediately
            await loadCheckoutData();
        }
    };

    const handleConfirmCashPayment = async () => {
        try {
            await bookingService.processCheckout(paymentData.bookingId, 'cash');
            setShowCashConfirmationModal(false);
            setShowPaymentSuccessModal(true);
            // Reload data immediately
            await loadCheckoutData();
        } catch (error) {
            console.error('Cash payment error:', error);
        }
    };

    const closeAllModals = () => {
        setShowCheckoutDetailsModal(false);
        setShowPaymentModal(false);
        setShowCashConfirmationModal(false);
        setShowPaymentSuccessModal(false);
        setSelectedBooking(null);
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="container mx-auto">
                <main className="p-5">
                    <div className="mt-5">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-playfair font-semibold">
                                Check-out Management
                            </h1>

                            {/* Date Picker Section */}
                            <div
                                className="flex items-center relative"
                                ref={datePickerRef}
                            >
                                <button
                                    onClick={() => changeDate(-1)}
                                    className="p-2 border border-[#EBE3D7] rounded-l-md hover:bg-[#EBE3D7] transition"
                                    title="Previous day"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                <button
                                    onClick={() =>
                                        setShowDatePicker(!showDatePicker)
                                    }
                                    className="px-4 py-2 border-t border-b border-[#EBE3D7] bg-white min-w-[200px] hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                    <FaCalendarAlt
                                        className="text-gray-500"
                                        size={14}
                                    />
                                    <span className="font-medium">
                                        {formatDate(currentDate)}
                                    </span>
                                </button>

                                {/* Custom Calendar Dropdown */}
                                {showDatePicker && (
                                    <div className="absolute top-full right-0 mt-2 z-50">
                                        <CustomCalendar
                                            selectedDate={currentDate}
                                            onDateSelect={handleDateSelect}
                                            onClose={() =>
                                                setShowDatePicker(false)
                                            }
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => changeDate(1)}
                                    className="p-2 border border-[#EBE3D7] rounded-r-md hover:bg-[#EBE3D7] transition"
                                    title="Next day"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {/* Quick Actions */}
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="ml-2 px-3 py-2 text-sm bg-[#CCBDA3] text-white rounded-md hover:bg-[#B8A488] transition font-medium"
                                >
                                    Today
                                </button>
                            </div>
                        </div>

                        <StatusCards
                            bookings={checkoutData}
                            currentDate={currentDate}
                        />

                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                        />

                        <CheckoutTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />

                        {loading ? (
                            <div className="text-center py-8">
                                <i className="fas fa-spinner fa-spin text-2xl text-gold"></i>
                                <p className="text-gray-500 mt-2">
                                    Loading checkout data...
                                </p>
                            </div>
                        ) : (
                            <CheckoutTable
                                data={filteredData}
                                onProcessCheckout={handleProcessCheckout}
                                onViewDetails={handleViewDetails}
                            />
                        )}
                    </div>

                    {/* Modals */}
                    {showCheckoutDetailsModal && selectedBooking && (
                        <CheckoutDetailsModal
                            booking={selectedBooking}
                            onClose={closeAllModals}
                            onProceedToPayment={handleProceedToPayment}
                        />
                    )}

                    {showPaymentModal && (
                        <PaymentModal
                            paymentData={paymentData}
                            onClose={closeAllModals}
                            onConfirmPayment={handleConfirmPayment}
                        />
                    )}

                    {showCashConfirmationModal && (
                        <CashConfirmationModal
                            paymentData={paymentData}
                            onClose={closeAllModals}
                            onConfirm={handleConfirmCashPayment}
                        />
                    )}

                    {showPaymentSuccessModal && (
                        <PaymentSuccessModal
                            paymentData={paymentData}
                            onClose={closeAllModals}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
