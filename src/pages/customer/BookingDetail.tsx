/* eslint-disable */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';

import {
    getBookingById,
    getBookingServicesByBookingId,
    deleteBookingService,
    saveBookingService,
    updateBookingService,
} from '../../services/bookingService';
import { getAll as getAllServices } from '../../services/serviceService';
import { getEarlyCheckinByBookingId } from '../../services/earlyCheckinService';
import { getLateCheckoutByBookingId } from '../../services/lateCheckoutService';

import EarlyCheckinModal from '../../components/checkin/EarlyCheckinModal';
import IncidentReportModal from '../../components/customer/IncidentReportModal';
import CancelBookingModal from '../../components/customer/CancelBookingModal';
import LateCheckoutModal from '../../components/checkout/LateCheckoutModal';

import type { Booking } from '../../types/Booking';
import type { BookingDetail } from '../../types/BookingDetail';
import type { EarlyCheckinResponse } from '../../types/EarlyCheckin';
import type { LateCheckout } from '../../types/LateCheckout';
import type { Service } from '../../types/Service';

import { MdRoomService, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { FaTimes } from 'react-icons/fa';
import type { JSX } from 'react/jsx-runtime';

// Type cho BookingService - cập nhật theo API response
interface BookingServiceItem {
    id?: string;
    service: {
        serviceID: string;
        serviceName: string;
        price: number;
        description?: string;
        serviceCategory?: string;
        images?: string[];
    };
    quantity: number;
    servicePrice: number;
    totalAmount: number;
    orderStatus: string;
    paymentMethod?: string;
    room?: {
        roomNumber: string;
    };
    roomNumbers?: string[];
    // UI-only fields
    scheduledDate?: string;
    scheduledTime?: string;
}

const statusColor = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    WAITING: 'bg-amber-50 text-amber-700 border-amber-200',
    CHECKED_IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CHECKED_OUT: 'bg-sky-50 text-sky-700 border-sky-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function BookingDetailPage() {
    const { id } = useParams();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [details, setDetails] = useState<BookingDetail[]>([]);
    const [loading, setLoading] = useState(true);

    const [earlyCheckinRequest, setEarlyCheckinRequest] =
        useState<EarlyCheckinResponse | null>(null);

    const [lateCheckoutRequest, setLateCheckoutRequest] =
        useState<LateCheckout | null>(null);

    const [showEarlyModal, setShowEarlyModal] = useState(false);
    const [showLateModal, setShowLateModal] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // State cho booking services
    const [bookingServices, setBookingServices] = useState<
        BookingServiceItem[]
    >([]);
    const [rawBookingServices, setRawBookingServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);

    // State cho CRUD dịch vụ
    const [availableServices, setAvailableServices] = useState<Service[]>([]);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] =
        useState<BookingServiceItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
        null,
    );

    // Form state cho add/edit service
    const [serviceForm, setServiceForm] = useState({
        serviceID: '',
        quantity: 1,
        roomNumber: 'ALL',
        scheduledDate: '',
        scheduledTime: '10:00',
    });

    const handleIncidentReport = () => {
        if (isActionLocked()) return;
        setShowIncidentModal(true);
    };

    const handleCancelBooking = () => {
        if (
            (booking?.status === 'PENDING' || booking?.status === 'WAITING') &&
            !isActionLocked()
        ) {
            setShowCancelModal(true);
        }
    };

    const isActionLocked = () => {
        if (!booking) return true;
        return booking.status === 'CANCELLED';
    };

    const canCancelBooking = () => {
        if (!booking) return false;
        return booking.status === 'PENDING' || booking.status === 'WAITING';
    };

    const handleCancelSuccess = () => {
        setShowCancelModal(false);
        setBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
    };

    const handleEarlyCheckinSuccess = () => {
        setShowEarlyModal(false);
        // Refresh data or set local state
        setEarlyCheckinRequest({
            requestID: 'pending',
            requestTime: new Date().toISOString(),
            approvalStatus: 'PENDING',
            additionalFee: 0,
            requestDate: new Date().toISOString(),
            booking: booking as any,
        });
        setBooking((prev) =>
            prev
                ? { ...prev, earlyCheckin: prev.earlyCheckin || ({} as any) }
                : prev,
        );
    };

    const handleLateCheckoutSuccess = () => {
        setShowLateModal(false);
        // Refresh data or set local state
        setLateCheckoutRequest({
            requestID: 'pending',
            requestTime: new Date().toISOString(),
            approvalStatus: 'PENDING',
            additionalFee: 0,
            requestDate: new Date().toISOString(),
            bookingId: booking?.bookingID,
        } as any);
        setBooking((prev) =>
            prev
                ? { ...prev, lateCheckout: prev.lateCheckout || ({} as any) }
                : prev,
        );
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch available services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const services = await getAllServices();
                setAvailableServices(services);
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };
        fetchServices();
    }, []);

    // FETCH BOOKING + CHECKINS + LATE CHECKOUT + SERVICES
    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const bookingRes = await getBookingById(id);
                console.log('Booking response:', bookingRes);
                setBooking(bookingRes);
                setDetails(bookingRes.bookingDetails || []);

                // Lấy bookingServices từ API riêng (hoặc từ response nếu có)
                setLoadingServices(true);
                try {
                    const servicesRes = await getBookingServicesByBookingId(id);
                    if (Array.isArray(servicesRes) && servicesRes.length > 0) {
                        console.log('Booking services from API:', servicesRes);
                        setRawBookingServices(servicesRes);
                    } else if (
                        bookingRes.bookingServices &&
                        Array.isArray(bookingRes.bookingServices)
                    ) {
                        console.log(
                            'Booking services from booking response:',
                            bookingRes.bookingServices,
                        );
                        setRawBookingServices(bookingRes.bookingServices);
                    } else {
                        console.log('No booking services found');
                        setRawBookingServices([]);
                    }
                } catch (err) {
                    console.error('Error fetching booking services:', err);
                    setRawBookingServices([]);
                } finally {
                    setLoadingServices(false);
                }

                // Process Early Checkin
                let earlyRequest = null;
                if (bookingRes.earlyCheckin) {
                    earlyRequest = {
                        requestID:
                            bookingRes.earlyCheckin.id ||
                            bookingRes.earlyCheckin.requestID ||
                            'booking-' + id,
                        requestTime: bookingRes.earlyCheckin.requestTime,
                        approvalStatus: bookingRes.earlyCheckin.approvalStatus,
                        additionalFee: bookingRes.earlyCheckin.additionalFee,
                        requestDate: bookingRes.earlyCheckin.requestTime,
                        booking: bookingRes,
                    };
                }
                if (!earlyRequest) {
                    const earlyByBooking = await getEarlyCheckinByBookingId(id);
                    if (earlyByBooking) {
                        earlyRequest = {
                            requestID:
                                earlyByBooking.requestID ||
                                earlyByBooking.id ||
                                'booking-' + id,
                            requestTime: earlyByBooking.requestTime,
                            approvalStatus: earlyByBooking.approvalStatus,
                            additionalFee: earlyByBooking.additionalFee,
                            requestDate:
                                earlyByBooking.requestDate ||
                                earlyByBooking.requestTime,
                            booking: bookingRes,
                        };
                    }
                }
                setEarlyCheckinRequest(earlyRequest);

                // Process Late Checkout
                const lateByBooking = await getLateCheckoutByBookingId(id);
                setLateCheckoutRequest(lateByBooking || null);
            } catch (err) {
                console.error('Error fetching booking detail:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Helper functions for services
    const getServiceStatusColor = (status: string) => {
        switch (status) {
            case 'PLACE':
                return 'bg-blue-100 text-blue-700';
            case 'PREPARING':
                return 'bg-yellow-100 text-yellow-700';
            case 'READY':
                return 'bg-purple-100 text-purple-700';
            case 'DELIVERED':
                return 'bg-green-100 text-green-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getServiceCategoryLabel = (category: string) => {
        switch (category) {
            case 'FOOD_BEVERAGE':
                return '🍽️ Food & Beverage';
            case 'LAUNDRY':
                return '👕 Laundry';
            case 'SPA':
                return '💆 Spa';
            case 'TRANSPORT':
                return '🚗 Transport';
            case 'TOUR':
                return '🗺️ Tour';
            default:
                return '📦 Others';
        }
    };

    const totalServicesCost = bookingServices.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
    );

    const roomSubtotal = details.reduce(
        (sum, detail) => sum + (detail.roomPrice || 0),
        0,
    );

    const mapBookingServices = (
        rawServices: any[],
        checkInDate?: string,
    ): BookingServiceItem[] =>
        rawServices.map((item) => {
            const serviceId = item.service?.serviceID || item.serviceId || '';
            const serviceFromList = availableServices.find(
                (s) => s.serviceID === serviceId,
            );
            const servicePrice =
                item.servicePrice ??
                item.service?.price ??
                serviceFromList?.price ??
                0;

            return {
                id: item.id || item.bookingServiceId || `temp-${Math.random()}`,
                service: {
                    serviceID: serviceId,
                    serviceName:
                        item.service?.serviceName ||
                        serviceFromList?.serviceName ||
                        'Unknown Service',
                    price:
                        item.service?.price ??
                        serviceFromList?.price ??
                        servicePrice,
                    description:
                        item.service?.description ||
                        serviceFromList?.description ||
                        '',
                    serviceCategory:
                        item.service?.serviceCategory ||
                        serviceFromList?.serviceCategory ||
                        '',
                    images:
                        item.service?.images || serviceFromList?.images || [],
                },
                quantity: item.quantity ?? 1,
                servicePrice,
                totalAmount:
                    item.totalAmount ?? servicePrice * (item.quantity ?? 1),
                orderStatus: item.orderStatus || 'PLACE',
                paymentMethod: item.paymentMethod || 'CASH',
                roomNumbers: Array.isArray(item.roomNumber)
                    ? item.roomNumber
                    : item.roomNumber
                        ? [item.roomNumber]
                        : undefined,
                room:
                    item.room ||
                    (item.roomNumber
                        ? {
                            roomNumber: Array.isArray(item.roomNumber)
                                ? item.roomNumber[0]
                                : item.roomNumber,
                        }
                        : undefined),
                scheduledDate:
                    item.scheduledDate || checkInDate?.split('T')[0] || '',
                scheduledTime: item.scheduledTime || '10:00',
            };
        });

    const mergeSavedService = (saved: any) => {
        if (!saved) return;
        const nextItem = Array.isArray(saved) ? saved[0] : saved;
        if (!nextItem) return;

        setRawBookingServices((prev) => {
            const nextId =
                nextItem.id ??
                nextItem.bookingServiceId ??
                `${nextItem.serviceId}-${JSON.stringify(nextItem.roomNumber || [])}`;
            const existingIndex = prev.findIndex((item) => {
                const currentId =
                    item.id ??
                    item.bookingServiceId ??
                    `${item.serviceId}-${JSON.stringify(item.roomNumber || [])}`;
                return currentId === nextId;
            });

            if (existingIndex === -1) return [...prev, nextItem];
            const clone = [...prev];
            clone[existingIndex] = nextItem;
            return clone;
        });
    };

    const getAppliedRoomCount = (roomNumber: string) => {
        if (roomNumber !== 'ALL') return 1;
        return Math.max(1, details.length);
    };

    useEffect(() => {
        if (!rawBookingServices.length) {
            setBookingServices([]);
            return;
        }
        setBookingServices(
            mapBookingServices(rawBookingServices, booking?.checkInDate),
        );
    }, [availableServices, rawBookingServices, booking?.checkInDate]);

    // CRUD Service Functions
    const handleAddService = () => {
        setEditingService(null);
        const checkInDate =
            booking?.checkInDate?.split('T')[0] ||
            new Date().toISOString().split('T')[0];
        const roomCount = getAppliedRoomCount('ALL');

        setServiceForm({
            serviceID: availableServices[0]?.serviceID || '',
            quantity: roomCount,
            roomNumber: 'ALL',
            scheduledDate: checkInDate,
            scheduledTime: '10:00',
        });
        setShowServiceModal(true);
    };

    const handleEditService = (item: BookingServiceItem) => {
        const roomNumbers = item.roomNumbers || [];
        const isAllRooms =
            roomNumbers.length > 0 && roomNumbers.length === details.length;
        const roomCount = isAllRooms ? Math.max(1, details.length) : 1;

        setEditingService(item);
        setServiceForm({
            serviceID: item.service.serviceID,
            quantity: Math.max(item.quantity, roomCount),
            roomNumber: isAllRooms
                ? 'ALL'
                : roomNumbers[0] || item.room?.roomNumber || 'ALL',
            scheduledDate:
                item.scheduledDate || booking?.checkInDate?.split('T')[0] || '',
            scheduledTime: item.scheduledTime || '10:00',
        });
        setShowServiceModal(true);
    };

    const handleSaveService = async () => {
        if (!id || !booking) return;

        const selectedService = availableServices.find(
            (s) => s.serviceID === serviceForm.serviceID,
        );
        if (!selectedService) return;

        const roomNumbers =
            serviceForm.roomNumber === 'ALL'
                ? details
                    .map((d) => d.room.roomNumber)
                    .filter((rn): rn is string => Boolean(rn))
                : serviceForm.roomNumber
                    ? [serviceForm.roomNumber]
                    : [];

        if (roomNumbers.length === 0) {
            alert('Please select at least one room for this service.');
            return;
        }

        const roomCount = getAppliedRoomCount(serviceForm.roomNumber);
        if (serviceForm.quantity < roomCount) {
            alert(
                `Quantity must be at least ${roomCount} when applying to ${roomCount} room(s).`,
            );
            return;
        }

        const totalQuantity = serviceForm.quantity;
        const servicePayload = {
            serviceId: selectedService.serviceID,
            quantity: totalQuantity,
            roomNumber: roomNumbers,
            orderStatus: editingService?.orderStatus || 'PLACE',
            paymentMethod: editingService?.paymentMethod || 'CASH',
        };

        setLoadingServices(true);
        try {
            const savedService = editingService?.id
                ? await updateBookingService(editingService.id, servicePayload)
                : await saveBookingService(id, servicePayload);

            console.log('Saved booking service:', savedService);
            mergeSavedService(savedService);

            const updatedBooking = await getBookingById(id);
            setBooking(updatedBooking);

            const servicesRes = await getBookingServicesByBookingId(id);
            if (Array.isArray(servicesRes) && servicesRes.length > 0) {
                setRawBookingServices(servicesRes);
            }

            setShowServiceModal(false);
            setEditingService(null);
        } catch (err: any) {
            console.error('Error saving booking with services:', err);
            const serverMsg =
                err?.response?.data || err?.message || String(err);
            alert('Failed to save service: ' + JSON.stringify(serverMsg));
        } finally {
            setLoadingServices(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!id) return;
        setLoadingServices(true);
        try {
            await deleteBookingService(serviceId);
            const updatedBooking = await getBookingById(id);
            setBooking(updatedBooking);
            const servicesRes = await getBookingServicesByBookingId(id);
            setRawBookingServices(
                Array.isArray(servicesRes) ? servicesRes : [],
            );
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting service:', err);
            alert('Failed to delete service.');
        } finally {
            setLoadingServices(false);
        }
    };

    const getScheduleDateRange = () => {
        if (!booking) return { min: '', max: '' };
        return {
            min: booking.checkInDate?.split('T')[0] || '',
            max: booking.checkOutDate?.split('T')[0] || '',
        };
    };

    const renderEarlyCheckinButton = () => {
        if (
            !booking ||
            booking.status === 'CANCELLED' ||
            booking.status === 'CHECKED_IN' ||
            booking.status === 'CHECKED_OUT'
        )
            return null;
        if (!earlyCheckinRequest) {
            return (
                <button
                    onClick={() => setShowEarlyModal(true)}
                    className="w-full cursor-pointer bg-[#d8d0c1] border border-[#ddd6c3] text-black hover:bg-[#b9ad96] hover:text-white transition-all duration-200 py-3 rounded-xl"
                >
                    Early Check-in
                </button>
            );
        }

        // If an early request exists show its status but do not block other quick actions
        switch (earlyCheckinRequest.approvalStatus) {
            case 'PENDING':
                return (
                    <button
                        disabled
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl opacity-75 cursor-not-allowed"
                    >
                        Early check-in request submitted
                    </button>
                );
            case 'APPROVED':
                return (
                    <button
                        disabled
                        className="w-full bg-green-600 text-white py-3 rounded-xl opacity-75 cursor-not-allowed"
                    >
                        Early check-in approved
                    </button>
                );
            case 'REJECTED':
                return (
                    <button
                        onClick={() => setShowEarlyModal(true)}
                        className="cursor-pointer w-full bg-white border-2 border-black py-3 rounded-xl"
                    >
                        Resubmit early check-in request
                    </button>
                );
            default:
                return null;
        }
    };

    const renderLateCheckoutButton = () => {
        if (
            !booking ||
            booking.status === 'CANCELLED' ||
            booking.status !== 'CHECKED_IN'
        )
            return null;
        if (!lateCheckoutRequest) {
            return (
                <button
                    onClick={() => setShowLateModal(true)}
                    className="w-full cursor-pointer bg-[#d8d0c1] border border-[#ddd6c3] text-black hover:bg-[#b9ad96] hover:text-white transition-all duration-200 py-3 rounded-xl"
                >
                    Late Check-out
                </button>
            );
        }

        // If a late request exists show its status but do not block other quick actions
        switch (lateCheckoutRequest.approvalStatus) {
            case 'PENDING':
                return (
                    <button
                        disabled
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl opacity-75 cursor-not-allowed"
                    >
                        Late check-out request submitted
                    </button>
                );
            case 'APPROVED':
                return (
                    <button
                        disabled
                        className="w-full bg-green-600 text-white py-3 rounded-xl opacity-75 cursor-not-allowed"
                    >
                        Late check-out approved
                    </button>
                );
            case 'REJECTED':
                return (
                    <button
                        onClick={() => setShowLateModal(true)}
                        className="cursor-pointer w-full bg-white border-2 border-black py-3 rounded-xl"
                    >
                        Resubmit late check-out request
                    </button>
                );
            default:
                return null;
        }
    };

    const renderNotification = () => {
        if (!booking) return null;
        if (booking.status === 'CANCELLED') {
            return (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-semibold text-red-800">
                        Booking cancelled
                    </h4>
                    <p className="text-red-600 text-sm">
                        No further actions are available for this booking.
                    </p>
                </div>
            );
        }
        const notifications: JSX.Element[] = [];

        if (earlyCheckinRequest) {
            const req = earlyCheckinRequest;
            if (req.approvalStatus === 'APPROVED') {
                notifications.push(
                    <div
                        key="early-approved"
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-green-800">
                            Early check-in approved
                        </h4>
                        <p className="text-green-600 text-sm">
                            Additional fee:{' '}
                            {req.additionalFee?.toLocaleString() || 0} VND
                        </p>
                    </div>,
                );
            } else if (req.approvalStatus === 'REJECTED') {
                notifications.push(
                    <div
                        key="early-rejected"
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-red-800">
                            Early check-in rejected
                        </h4>
                    </div>,
                );
            } else {
                notifications.push(
                    <div
                        key="early-pending"
                        className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-yellow-800">
                            Early check-in pending
                        </h4>
                    </div>,
                );
            }
        }

        if (lateCheckoutRequest) {
            const req = lateCheckoutRequest;
            if (req.approvalStatus === 'APPROVED') {
                notifications.push(
                    <div
                        key="late-approved"
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-green-800">
                            Late check-out approved
                        </h4>
                        {req.additionalFee > 0 && (
                            <p className="text-green-600 text-sm">
                                Additional fee:{' '}
                                {req.additionalFee.toLocaleString()} VND
                            </p>
                        )}
                    </div>,
                );
            } else if (req.approvalStatus === 'REJECTED') {
                notifications.push(
                    <div
                        key="late-rejected"
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-red-800">
                            Late check-out rejected
                        </h4>
                    </div>,
                );
            } else {
                notifications.push(
                    <div
                        key="late-pending"
                        className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                    >
                        <h4 className="font-semibold text-yellow-800">
                            Late check-out pending
                        </h4>
                    </div>,
                );
            }
        }

        if (notifications.length === 0) return null;
        return <>{notifications}</>;
    };

    if (loading)
        return (
            <div className="min-h-screen flex justify-center items-center text-black">
                Loading...
            </div>
        );
    if (!booking)
        return (
            <div className="min-h-screen flex justify-center items-center text-black">
                Booking Not Found
            </div>
        );

    const dateRange = getScheduleDateRange();

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-white sticky top-0 z-50">
                <Header />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* BACK */}
                <div className="mb-6">
                    <button
                        onClick={() => globalThis.history.back()}
                        className="text-black flex items-center gap-2 font-medium"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Bookings
                    </button>
                </div>

                {/* NOTIFICATION */}
                {renderNotification()}

                {/* TITLE */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-black">
                            Booking Details
                        </h1>
                        <p className="text-black/60">
                            ID:{' '}
                            <span className="font-mono">
                                {booking.bookingID}
                            </span>
                        </p>
                    </div>
                    <span
                        className={`px-5 py-2 rounded-full border-2 text-sm font-semibold ${statusColor[booking.status as keyof typeof statusColor] || ''}`}
                    >
                        {booking.status?.replace('_', ' ') || 'PENDING'}
                    </span>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* CUSTOMER INFO */}
                        <div className="bg-white border p-6 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">
                                Customer Information
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-[#F5F0EB] rounded-lg flex gap-3">
                                    <strong className="min-w-[70px] text-black/70">
                                        Name
                                    </strong>
                                    <span>{booking.customer?.fullName}</span>
                                </div>
                                <div className="p-3 bg-[#F5F0EB] rounded-lg flex gap-3">
                                    <strong className="min-w-[70px] text-black/70">
                                        Phone
                                    </strong>
                                    <span>{booking.customer?.phone}</span>
                                </div>
                                <div className="p-3 bg-[#F5F0EB] rounded-lg flex gap-3">
                                    <strong className="min-w-[70px] text-black/70">
                                        Email
                                    </strong>
                                    <span>{booking.customer?.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* SCHEDULE */}
                        <div className="bg-white border p-6 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">Schedule</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-[#F5F0EB] p-4 rounded-xl">
                                    <p className="text-black/60 text-sm">
                                        Check-in
                                    </p>
                                    <p className="text-lg font-bold">
                                        {booking.checkInDate?.split('T')[0]}
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {booking.checkInDate?.split('T')[1]}
                                    </p>
                                </div>
                                <div className="bg-[#F5F0EB] p-4 rounded-xl">
                                    <p className="text-black/60 text-sm">
                                        Check-out
                                    </p>
                                    <p className="text-lg font-bold">
                                        {booking.checkOutDate?.split('T')[0]}
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {booking.checkOutDate?.split('T')[1]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 bg-[#F5F0EB] rounded-lg flex-1">
                                    <span className="font-semibold">
                                        {booking.numberOfGuests} Guests
                                    </span>
                                </div>
                                <div className="p-3 bg-[#F5F0EB] rounded-lg">
                                    <span className="font-semibold text-[#c9b8a8]">
                                        {booking.type || 'DAILY'} Booking
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ROOMS */}
                        <div className="bg-white border p-6 rounded-2xl">
                            <h3 className="text-xl font-bold mb-5">
                                Rooms Booked
                            </h3>
                            <div className="space-y-4">
                                {details.map((detail) => (
                                    <div
                                        key={detail.room.roomNumber}
                                        className="bg-[#F5F0EB] p-5 rounded-xl border"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <h4 className="text-lg font-bold">
                                                    Room{' '}
                                                    {detail.room.roomNumber}
                                                </h4>
                                                <p className="text-black/60">
                                                    {
                                                        detail.room.roomType
                                                            ?.typeName
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-black/60">
                                                    Price
                                                </p>
                                                <p className="text-lg font-bold">
                                                    {detail.roomPrice?.toLocaleString()}{' '}
                                                    VNĐ
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 overflow-x-auto">
                                            {detail.room.images
                                                ?.slice(0, 3)
                                                .map((img) => (
                                                    <img
                                                        key={img}
                                                        src={img}
                                                        alt={detail.room.roomNumber}
                                                        className="w-24 h-20 rounded-lg object-cover border"
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BOOKED SERVICES */}
                        <div className="bg-white border p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <MdRoomService className="text-2xl text-[#c9b8a8]" />
                                    <h3 className="text-xl font-bold">
                                        Booked Services
                                    </h3>
                                    {bookingServices.length > 0 && (
                                        <span className="bg-[#c9b8a8] text-white text-xs px-2 py-1 rounded-full">
                                            {bookingServices.length}
                                        </span>
                                    )}
                                </div>
                                {(booking.status === 'PENDING' ||
                                    booking.status === 'WAITING' ||
                                    booking.status === 'CHECKED_IN') &&
                                    !isActionLocked() && (
                                        <button
                                            onClick={handleAddService}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#c9b8a8] text-white rounded-lg hover:bg-[#b9ad96] transition"
                                        >
                                            <MdAdd className="text-lg" /> Add
                                            Service
                                        </button>
                                    )}
                            </div>

                            {loadingServices ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9b8a8]"></div>
                                </div>
                            ) : bookingServices.length === 0 ? (
                                <div className="text-center py-8 text-black/50">
                                    <MdRoomService className="text-4xl mx-auto mb-2 opacity-50" />
                                    <p>No services booked</p>
                                    {(booking.status === 'PENDING' ||
                                        booking.status === 'WAITING' ||
                                        booking.status === 'CHECKED_IN') &&
                                        !isActionLocked() && (
                                            <button
                                                onClick={handleAddService}
                                                className="mt-3 text-[#c9b8a8] hover:underline"
                                            >
                                                + Add your first service
                                            </button>
                                        )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookingServices.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="bg-[#F5F0EB] p-4 rounded-xl border"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h4 className="text-lg font-semibold">
                                                            {
                                                                item.service
                                                                    .serviceName
                                                            }
                                                        </h4>
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getServiceStatusColor(item.orderStatus)}`}
                                                        >
                                                            {item.orderStatus}
                                                        </span>
                                                        {item.service
                                                            .serviceCategory && (
                                                                <span className="text-xs text-gray-500">
                                                                    {getServiceCategoryLabel(
                                                                        item.service
                                                                            .serviceCategory,
                                                                    )}
                                                                </span>
                                                            )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-black/60">
                                                                Quantity:
                                                            </span>
                                                            <span className="font-medium">
                                                                x{item.quantity}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-black/60">
                                                                Unit Price:
                                                            </span>
                                                            <span className="font-medium">
                                                                {item.servicePrice?.toLocaleString()}{' '}
                                                                VNĐ
                                                            </span>
                                                        </div>
                                                        {(item.room ||
                                                            (item.roomNumbers &&
                                                                item.roomNumbers
                                                                    .length >
                                                                0)) && (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-black/60">
                                                                        Room:
                                                                    </span>
                                                                    <span className="font-medium text-[#c9b8a8]">
                                                                        {item.roomNumbers?.join(
                                                                            ', ',
                                                                        ) ||
                                                                            item
                                                                                .room
                                                                                ?.roomNumber}
                                                                    </span>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 ml-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-black/60">
                                                            Total
                                                        </p>
                                                        <p className="text-lg font-bold text-[#c9b8a8]">
                                                            {item.totalAmount?.toLocaleString()}{' '}
                                                            VNĐ
                                                        </p>
                                                    </div>
                                                    {item.orderStatus ===
                                                        'PLACE' &&
                                                        (booking.status ===
                                                            'PENDING' ||
                                                            booking.status ===
                                                            'WAITING' ||
                                                            booking.status ===
                                                            'CHECKED_IN') &&
                                                        !isActionLocked() && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditService(
                                                                            item,
                                                                        )
                                                                    }
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                    title="Edit"
                                                                >
                                                                    <MdEdit className="text-lg" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setShowDeleteConfirm(
                                                                            item.id ||
                                                                            null,
                                                                        )
                                                                    }
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Delete"
                                                                >
                                                                    <MdDelete className="text-lg" />
                                                                </button>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                            {showDeleteConfirm === item.id && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm text-red-800 mb-2">
                                                        Are you sure you want to
                                                        delete this service?
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteService(
                                                                    item.id!,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setShowDeleteConfirm(
                                                                    null,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <span className="font-semibold text-lg">
                                            Total Services
                                        </span>
                                        <span className="font-bold text-xl text-[#c9b8a8]">
                                            {totalServicesCost.toLocaleString()}{' '}
                                            VNĐ
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — PAYMENT + ACTIONS */}
                    <div className="space-y-6">
                        {/* PAYMENT CARD */}
                        <div className="shadow-2xl bg-[#d8d0c1] text-black p-6 rounded-2xl">
                            <h3 className="text-lg font-semibold mb-6 border-b border-white/20 pb-3">
                                Payment Summary
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-black/70">
                                        Room Subtotal
                                    </span>
                                    <span>
                                        {roomSubtotal.toLocaleString()}{' '}
                                        VNĐ
                                    </span>
                                </div>
                                {totalServicesCost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-black/70">
                                            Services ({bookingServices.length})
                                        </span>
                                        <span>
                                            {totalServicesCost.toLocaleString()}{' '}
                                            VNĐ
                                        </span>
                                    </div>
                                )}
                                {earlyCheckinRequest?.approvalStatus ===
                                    'APPROVED' && (
                                        <div className="flex justify-between">
                                            <span className="text-black/70">
                                                Early Check-in Fee
                                            </span>
                                            <span>
                                                {earlyCheckinRequest.additionalFee?.toLocaleString()}{' '}
                                                VNĐ
                                            </span>
                                        </div>
                                    )}
                                {lateCheckoutRequest?.approvalStatus ===
                                    'APPROVED' && (
                                        <div className="flex justify-between">
                                            <span className="text-black/70">
                                                Late Check-out Fee
                                            </span>
                                            <span>
                                                {lateCheckoutRequest.additionalFee?.toLocaleString()}{' '}
                                                VNĐ
                                            </span>
                                        </div>
                                    )}
                            </div>
                            <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                                <span className="text-lg font-semibold">
                                    Total
                                </span>
                                <span className="text-2xl font-bold">
                                    {(
                                        roomSubtotal +
                                        (earlyCheckinRequest?.approvalStatus ===
                                            'APPROVED'
                                            ? earlyCheckinRequest.additionalFee ||
                                            0
                                            : 0) +
                                        (lateCheckoutRequest?.approvalStatus ===
                                            'APPROVED'
                                            ? lateCheckoutRequest.additionalFee ||
                                            0
                                            : 0) +
                                        totalServicesCost
                                    ).toLocaleString()}{' '}
                                    VNĐ
                                </span>
                            </div>
                        </div>

                        {/* QUICK ACTIONS */}
                        <div className="bg-white border p-6 rounded-2xl">
                            <h3 className="text-lg font-bold mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                {renderEarlyCheckinButton()}
                                {renderLateCheckoutButton()}
                                {/* {booking?.status === 'CHECKED_IN' &&
                                    !isActionLocked() && (
                                        <button
                                            onClick={handleIncidentReport}
                                            className="cursor-pointer w-full hover:text-amber-500 text-black border py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <i className="fas fa-exclamation-triangle"></i>{' '}
                                            Report Incident
                                        </button>
                                    )} */}
                                {canCancelBooking() && (
                                    <button
                                        onClick={handleCancelBooking}
                                        className="cursor-pointer border border-red-600 w-full text-red-600 hover:bg-red-50 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                                {booking?.status === 'CANCELLED' && (
                                    <button
                                        disabled
                                        className="border border-red-600 bg-red-600 w-full text-white py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                                    >
                                        Booking cancelled
                                    </button>
                                )}
                                {/* Per-request buttons above already show submitted statuses; no generic lock needed */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">
                                {editingService
                                    ? 'Edit Service'
                                    : 'Add Service'}
                            </h3>
                            <button
                                onClick={() => setShowServiceModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Service
                                </label>
                                <select
                                    value={serviceForm.serviceID}
                                    onChange={(e) =>
                                        setServiceForm((p) => ({
                                            ...p,
                                            serviceID: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                                >
                                    {availableServices.map((s) => (
                                        <option
                                            key={s.serviceID}
                                            value={s.serviceID}
                                        >
                                            {s.serviceName} -{' '}
                                            {s.price?.toLocaleString()} VNĐ
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setServiceForm((p) => ({
                                                ...p,
                                                quantity: Math.max(
                                                    getAppliedRoomCount(
                                                        p.roomNumber,
                                                    ),
                                                    p.quantity - 1,
                                                ),
                                            }))
                                        }
                                        disabled={
                                            serviceForm.quantity <=
                                            getAppliedRoomCount(
                                                serviceForm.roomNumber,
                                            )
                                        }
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c9b8a8] text-[#c9b8a8] hover:bg-[#c9b8a8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        value={serviceForm.quantity}
                                        onChange={(e) =>
                                            setServiceForm((p) => ({
                                                ...p,
                                                quantity: Math.max(
                                                    getAppliedRoomCount(
                                                        p.roomNumber,
                                                    ),
                                                    Number.parseInt(e.target.value) ||
                                                    1,
                                                ),
                                            }))
                                        }
                                        className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setServiceForm((p) => ({
                                                ...p,
                                                quantity: Math.min(
                                                    99,
                                                    p.quantity + 1,
                                                ),
                                            }))
                                        }
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c9b8a8] text-[#c9b8a8] hover:bg-[#c9b8a8] hover:text-white"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Apply to Room
                                </label>
                                <select
                                    value={serviceForm.roomNumber}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setServiceForm((p) => ({
                                            ...p,
                                            roomNumber: val,
                                            quantity: Math.max(
                                                p.quantity,
                                                getAppliedRoomCount(val),
                                            ),
                                        }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                                >
                                    <option value="ALL">
                                        All Rooms ({details.length} rooms)
                                    </option>
                                    {details.map((d) => (
                                        <option
                                            key={d.room.roomNumber}
                                            value={d.room.roomNumber}
                                        >
                                            Room {d.room.roomNumber} -{' '}
                                            {d.room.roomType?.typeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Scheduled Date
                                </label>
                                <input
                                    type="date"
                                    value={serviceForm.scheduledDate}
                                    min={dateRange.min}
                                    max={dateRange.max}
                                    onChange={(e) =>
                                        setServiceForm((p) => ({
                                            ...p,
                                            scheduledDate: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Scheduled Time
                                </label>
                                <input
                                    type="time"
                                    value={serviceForm.scheduledTime}
                                    onChange={(e) =>
                                        setServiceForm((p) => ({
                                            ...p,
                                            scheduledTime: e.target.value,
                                        }))
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                                />
                            </div>
                            <div className="bg-[#F5F0EB] p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/70">
                                        Estimated Total:
                                    </span>
                                    <span className="text-xl font-bold text-[#c9b8a8]">
                                        {(() => {
                                            const s = availableServices.find(
                                                (s) =>
                                                    s.serviceID ===
                                                    serviceForm.serviceID,
                                            );
                                            if (!s) return '0 VNĐ';
                                            return (
                                                (
                                                    s.price *
                                                    serviceForm.quantity
                                                ).toLocaleString() + ' VNĐ'
                                            );
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowServiceModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveService}
                                className="flex-1 px-4 py-3 bg-[#c9b8a8] text-white rounded-lg hover:bg-[#b9ad96] transition"
                            >
                                {editingService
                                    ? 'Save Changes'
                                    : 'Add Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEarlyModal && !isActionLocked() && (
                <EarlyCheckinModal
                    booking={booking}
                    onClose={() => setShowEarlyModal(false)}
                    onSuccess={handleEarlyCheckinSuccess}
                />
            )}
            {showLateModal && !isActionLocked() && (
                <LateCheckoutModal
                    booking={booking}
                    onClose={() => setShowLateModal(false)}
                    onSuccess={handleLateCheckoutSuccess}
                />
            )}
            {showIncidentModal && (
                <IncidentReportModal
                    booking={booking}
                    onClose={() => setShowIncidentModal(false)}
                />
            )}
            {showCancelModal && !isActionLocked() && (
                <CancelBookingModal
                    booking={booking}
                    onClose={() => setShowCancelModal(false)}
                    onSuccess={handleCancelSuccess}
                />
            )}
        </div>
    );
}
