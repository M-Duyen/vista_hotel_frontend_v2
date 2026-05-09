import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';
import useModal from '../../hooks/useModal';
import StatusCards from '../../components/checkin/StatusCards';
import SearchFilter from '../../components/checkin/SearchFilter';
import CheckinTabs from '../../components/checkin/CheckinTabs';
import TodayTab from '../../components/checkin/TodayCheckins';
import CheckinDetailsModal from '../../components/checkin/CheckinDetailsModal';
import ManualCheckinModal from '../../components/checkin/ManualCheckinModal';
import TomorrowTab from '../../components/checkin/TomorrowTab';
import EarlyTab from '../../components/checkin/EarlyTab';
import HourlyTab from '../../components/checkin/HourlyTab';
import { getBookingsByCheckInDateRange } from '../../services/bookingService';
import type { Booking } from '../../types/Booking';
import CustomCalendar from '../../components/checkin/CustomCalendar';

interface FilterOptions {
    status?: string;
    paymentStatus?: string;
    packageType?: string;
}

const CheckInManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const datePickerRef = useRef<HTMLDivElement>(null);

    const {
        isOpen: isDetailsModalOpen,
        openModal: openDetailsModal,
        closeModal: closeDetailsModal,
    } = useModal();

    const {
        isOpen: isCheckinModalOpen,
        openModal: openCheckinModal,
        closeModal: closeCheckinModal,
    } = useModal();

    const [selectedGuest, setSelectedGuest] = useState<Booking | null>(null);

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

    const formatDateForAPI = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const today = new Date(currentDate);
            today.setHours(0, 0, 0, 0);

            const dayAfterSelected = new Date(today);
            dayAfterSelected.setDate(dayAfterSelected.getDate() + 2);

            const startDate = formatDateForAPI(today);
            const endDate = formatDateForAPI(dayAfterSelected);

            const data = await getBookingsByCheckInDateRange(
                startDate,
                endDate,
            );
            const activeBookings = data.filter(
                (booking) => booking.status !== 'CANCELLED',
            );
            setBookings(activeBookings);
        } catch (err) {
            setError('Failed to fetch bookings: ' + err);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    const applyFilters = useCallback(() => {
        let filtered = [...bookings];

        if (searchKeyword.trim()) {
            const searchLower = searchKeyword.toLowerCase();
            filtered = filtered.filter(
                (booking) =>
                    booking.bookingID.toLowerCase().includes(searchLower) ||
                    booking.customer.fullName
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    booking.customer.email
                        .toLowerCase()
                        .includes(searchLower) ||
                    booking.customer.phone.includes(searchKeyword),
            );
        }

        if (filters.status) {
            filtered = filtered.filter((b) => b.status === filters.status);
        }
        if (filters.paymentStatus) {
            filtered = filtered.filter(
                (b) => b.paymentStatus === filters.paymentStatus,
            );
        }
        if (filters.packageType) {
            filtered = filtered.filter(
                (b) => b.packageType === filters.packageType,
            );
        }

        setFilteredBookings(filtered);
    }, [bookings, searchKeyword, filters]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const changeDate = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
        setShowDatePicker(false);
    };

    const handleOpenDetailsModal = (guest: Booking) => {
        setSelectedGuest(guest);
        openDetailsModal();
    };

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
    };

    const handleFilter = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

    const tabCounts = useMemo(() => {
        const selectedDay = new Date(currentDate);
        selectedDay.setHours(0, 0, 0, 0);

        const nextDay = new Date(selectedDay);
        nextDay.setDate(nextDay.getDate() + 1);

        return {
            today: filteredBookings.filter((booking) => {
                const checkInDate = new Date(booking.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                return checkInDate.getTime() === selectedDay.getTime();
            }).length,

            tomorrow: filteredBookings.filter((booking) => {
                const checkInDate = new Date(booking.checkInDate);
                checkInDate.setHours(0, 0, 0, 0);
                return checkInDate.getTime() === nextDay.getTime();
            }).length,

            early: filteredBookings.filter(
                (booking) => booking.earlyCheckin !== null,
            ).length,

            hourly: filteredBookings.filter(
                (booking) =>
                    booking.hourlyRate !== null && booking.hourlyRate > 0,
            ).length,
        };
    }, [filteredBookings, currentDate]);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getBookingsForTab = useCallback((): Booking[] => {
        const selectedDay = new Date(currentDate);
        selectedDay.setHours(0, 0, 0, 0);

        const nextDay = new Date(selectedDay);
        nextDay.setDate(nextDay.getDate() + 1);

        switch (activeTab) {
            case 'today':
                return filteredBookings.filter((booking) => {
                    const checkInDate = new Date(booking.checkInDate);
                    checkInDate.setHours(0, 0, 0, 0);
                    return checkInDate.getTime() === selectedDay.getTime();
                });

            case 'tomorrow':
                return filteredBookings.filter((booking) => {
                    const checkInDate = new Date(booking.checkInDate);
                    checkInDate.setHours(0, 0, 0, 0);
                    return checkInDate.getTime() === nextDay.getTime();
                });

            case 'early':
                return filteredBookings.filter(
                    (booking) => booking.earlyCheckin !== null,
                );

            case 'hourly':
                return filteredBookings.filter(
                    (booking) =>
                        booking.hourlyRate !== null && booking.hourlyRate > 0,
                );

            default:
                return filteredBookings;
        }
    }, [activeTab, filteredBookings, currentDate]);

    if (loading) {
        return (
            <div className="bg-[#F5F0EB] min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCBDA3] mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#F5F0EB] min-h-screen flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-semibold mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchBookings()}
                        className="px-4 py-2 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const tabBookings = getBookingsForTab();

    return (
        <div className="bg-[#F5F0EB] min-h-screen">
            <main className="px-5 py-4 max-w-[1600px] mx-auto">
                <div className="mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-playfair font-semibold text-black">
                            Check-in Management
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div
                                className="flex items-center relative"
                                ref={datePickerRef}
                            >
                                <button
                                    onClick={() => changeDate(-1)}
                                    className="p-2 border border-[#EBE3D7] rounded-l-md hover:bg-[#EBE3D7] transition"
                                >
                                    <span className="sr-only">
                                        Previous day
                                    </span>
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
                                    {formatDate(currentDate)}
                                </button>

                                {/* Custom Calendar Dropdown */}
                                {showDatePicker && (
                                    <div className="absolute top-full left-0 mt-2 z-50">
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
                                >
                                    <span className="sr-only">Next day</span>
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
                            </div>
                            <button
                                onClick={openCheckinModal}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition font-medium"
                            >
                                <FaPlus size={14} />
                                Manual Check-in
                            </button>
                        </div>
                    </div>

                    <div className="mb-8">
                        <StatusCards bookings={bookings} />
                    </div>

                    <div className="mb-6">
                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-sm">
                        <CheckinTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            counts={tabCounts}
                            selectedDate={currentDate}
                        />

                        {activeTab === 'today' && (
                            <TodayTab
                                onViewDetails={handleOpenDetailsModal}
                                bookings={tabBookings}
                                onRefresh={fetchBookings}
                            />
                        )}
                        {activeTab === 'tomorrow' && (
                            <TomorrowTab
                                onViewDetails={handleOpenDetailsModal}
                                bookings={tabBookings}
                            />
                        )}
                        {activeTab === 'early' && (
                            <EarlyTab
                                onViewDetails={handleOpenDetailsModal}
                                bookings={tabBookings}
                                onRefresh={fetchBookings}
                            />
                        )}
                        {activeTab === 'hourly' && (
                            <HourlyTab
                                onViewDetails={handleOpenDetailsModal}
                                bookings={tabBookings}
                            />
                        )}
                    </div>
                </div>
            </main>

            {isDetailsModalOpen && (
                <CheckinDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={closeDetailsModal}
                    guest={selectedGuest}
                    onRefresh={fetchBookings}
                />
            )}

            {isCheckinModalOpen && (
                <ManualCheckinModal
                    isOpen={isCheckinModalOpen}
                    onClose={closeCheckinModal}
                    onSuccess={fetchBookings}
                />
            )}
        </div>
    );
};

export default CheckInManager;
