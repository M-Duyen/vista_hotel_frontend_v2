/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, bookingsApi, customerApi, roomsApi, usersApi } from "./apiClient";
import type { Booking, RoomBooking } from "../types/Booking";
import type { BookingDetail } from "../types/BookingDetail";

const mappingBookings = async (res: any) => {
    const cancellationId = res.cancellationID || res.cancellationId || res.cancellation_id;

    const [
        customerRes,
        employeeRes,
        earlyCheckinRes,
        lateCheckoutRes,
        cancellationRes,
        bookingDetails,
    ] = await Promise.all([
        res.customerID
            ? customerApi.get(`/${res.customerID}`).catch(() => null)
            : Promise.resolve(null),
        res.employeeID
            ? usersApi.get(`/users/${res.employeeID}`).catch(() => null)
            : Promise.resolve(null),
        api
            .get(`/api/early-checkin/booking/${res.bookingID}`)
            .catch(() => null),
        api
            .get(`/api/late-checkout/booking/${res.bookingID}`)
            .catch(() => null),
        cancellationId
            ? api
                  .get(`/booking-cancellations/booking/${res.bookingID}`)
                  .catch(() => null)
            : Promise.resolve(null),
        Promise.all(
            res.bookingDetails.map((detail: any) =>
                mappingBookingDetails(detail),
            ),
        ),
    ]);

    return {
        ...res,
        customer: customerRes?.data || null,
        employee: employeeRes?.data || null,
        bookingDetails,
        earlyCheckin: earlyCheckinRes?.data?.data || earlyCheckinRes?.data || null,
        lateCheckout: lateCheckoutRes?.data?.data || lateCheckoutRes?.data || null,
        cancellation: cancellationRes?.data || null,
    };
};

const mappingBookingDetails = async (res: any) => {
    const [roomRes, reviewRes] = await Promise.all([
        roomsApi.get(`/${res.roomNumber}`),
        api
            .get(`/reviews/booking/${res.bookingID}/room/${res.roomNumber}`)
            .catch(() => null),
    ]);

    return {
        ...res,
        room: roomRes.data,
        review: reviewRes?.data || null,
    };
};

export const getAll = async (): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get('');
        const bookings = await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
        return bookings;
    } catch (error) {
        console.error('Get all bookings error:', error);
        throw error;
    }
};

export const getBookingById = async (id: string): Promise<Booking> => {
    try {
        const response = await bookingsApi.get(`/${id}`);
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Get booking by ID error:', error);
        throw error;
    }
};

export const createBooking = async (booking: any): Promise<Booking> => {
    try {
        const response = await bookingsApi.post('', booking);
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Create booking error:', error);
        throw error;
    }
};

export const updateBooking = async (
    id: string,
    booking: any,
): Promise<Booking> => {
    try {
        const response = await bookingsApi.put(`/${id}`, booking);
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Update booking error:', error);
        throw error;
    }
};

export const saveBookingWithDetails = async (
    booking: any,
    details: any[],
    services: any[],
): Promise<Booking> => {
    try {
        const response = await bookingsApi.post('/with-details', {
            booking,
            details,
            services,
        });
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Save booking with details error:', error);
        throw error;
    }
};

export const deleteBooking = async (id: string): Promise<void> => {
    try {
        await bookingsApi.delete(`/${id}`);
    } catch (error) {
        console.error('Delete booking error:', error);
        throw error;
    }
};

export const getAllRoomBookings = async (): Promise<RoomBooking[]> => {
    try {
        const bookings = await getAll();
        const roomBookings: RoomBooking[] = [];

        bookings.forEach((booking) => {
            booking.bookingDetails?.forEach((detail) => {
                roomBookings.push({
                    bookingID: booking.bookingID!,
                    customerName: booking.customer?.fullName || 'N/A',
                    roomNumber: detail.roomNumber!,
                    checkInDate: booking.checkInDate!,
                    checkOutDate: booking.checkOutDate!,
                    status: booking.status!,
                });
            });
        });

        return roomBookings;
    } catch (error) {
        console.error('Get all room bookings error:', error);
        throw error;
    }
};

export const convertToRoomBooking = (booking: Booking): RoomBooking[] => {
    if (!booking.bookingDetails) return [];
    return booking.bookingDetails.map((detail) => ({
        bookingID: booking.bookingID!,
        customerName: booking.customer?.fullName || 'N/A',
        roomNumber: detail.roomNumber!,
        checkInDate: booking.checkInDate!,
        checkOutDate: booking.checkOutDate!,
        status: booking.status!,
    }));
};

export const getBookingsByStatus = async (
    status: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/status/${status}`);
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by status error:', error);
        throw error;
    }
};

export const getBookingsByCustomerId = async (
    customerId: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/customer/${customerId}`);
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by customer ID error:', error);
        throw error;
    }
};

export const searchBookings = async (keyword: string): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/search?keyword=${keyword}`);
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Search bookings error:', error);
        throw error;
    }
};

export const checkIn = async (bookingId: string): Promise<Booking> => {
    try {
        const response = await bookingsApi.put(`/${bookingId}/check-in`);
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Check-in error:', error);
        throw error;
    }
};

export const checkOut = async (bookingId: string): Promise<Booking> => {
    try {
        const response = await bookingsApi.put(`/${bookingId}/check-out`);
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Check-out error:', error);
        throw error;
    }
};

export const processCheckout = async (
    bookingId: string,
    paymentMethod: string,
): Promise<Booking> => {
    try {
        const response = await bookingsApi.put(`/${bookingId}/check-out`, {
            paymentMethod,
        });
        return await mappingBookings(response.data);
    } catch (error) {
        console.error('Process checkout error:', error);
        throw error;
    }
};

export const getBookingsByCheckInDate = async (
    date: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/check-in-date?date=${date}`);
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by CheckInDate error:', error);
        throw error;
    }
};

export const getBookingsByCheckInDateRange = async (
    startDate: string,
    endDate: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(
            `/check-in-range?startDate=${startDate}&endDate=${endDate}`,
        );
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by CheckInDate range error:', error);
        throw error;
    }
};

export const getBookingsByCheckOutDate = async (
    date: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/check-out-date?date=${date}`);
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by CheckOutDate error:', error);
        throw error;
    }
};

export const getBookingsByCheckOutDateRange = async (
    startDate: string,
    endDate: string,
): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(
            `/check-out-range?startDate=${startDate}&endDate=${endDate}`,
        );
        return await Promise.all(
            response.data.map((res: any) => mappingBookings(res)),
        );
    } catch (error) {
        console.error('Get bookings by CheckOutDate range error:', error);
        throw error;
    }
};

export const getTodayCheckins = async (): Promise<Booking[]> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const bookings = await getBookingsByCheckInDate(today);
        return bookings.filter((b) => b.status === 'WAITING' || b.status === 'PENDING');
    } catch (error) {
        console.error('Error fetching today checkins:', error);
        return [];
    }
};

export const getTodayCheckouts = async (): Promise<Booking[]> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const bookings = await getBookingsByCheckOutDate(today);
        return bookings.filter((b) => b.status === 'CHECKED_IN');
    } catch (error) {
        console.error('Error fetching today checkouts:', error);
        return [];
    }
};

export const getTomorrowCheckouts = async (): Promise<Booking[]> => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const bookings = await getBookingsByCheckOutDate(tomorrowStr);
        return bookings.filter((b) => b.status === 'CHECKED_IN');
    } catch (error) {
        console.error('Error fetching tomorrow checkouts:', error);
        return [];
    }
};

export const getLateCheckouts = async (): Promise<Booking[]> => {
    try {
        const today = new Date();
        const bookings = await getAll();
        return bookings.filter((b) => {
            if (b.status !== 'CHECKED_IN' || !b.checkOutDate) return false;
            const checkOutDate = new Date(b.checkOutDate);
            return checkOutDate < today;
        });
    } catch (error) {
        console.error('Error fetching late checkouts:', error);
        return [];
    }
};

export const getUpcomingCheckins = async (): Promise<Booking[]> => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];

        const bookings = await getBookingsByCheckInDateRange(
            tomorrowStr,
            nextWeekStr,
        );
        return bookings.filter((b) => b.status === 'WAITING' || b.status === 'PENDING');
    } catch (error) {
        console.error('Error fetching upcoming checkins:', error);
        return [];
    }
};

export const getRecentCheckouts = async (): Promise<Booking[]> => {
    try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        const bookings = await getBookingsByCheckOutDateRange(
            yesterdayStr,
            todayStr,
        );
        return bookings.filter((b) => b.status === 'CHECKED_OUT');
    } catch (error) {
        console.error('Error fetching recent checkouts:', error);
        return [];
    }
};

export const getCompletedCheckouts = async (): Promise<Booking[]> => {
    try {
        const bookings = await getBookingsByStatus('CHECKED_OUT');
        return bookings
            .sort((a, b) => {
                const dateA = new Date(a.checkOutDate!).getTime();
                const dateB = new Date(b.checkOutDate!).getTime();
                return dateB - dateA;
            })
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching completed checkouts:', error);
        return [];
    }
};

export const getByRoom = async (roomNumber: string): Promise<Booking[]> => {
    try {
        const response = await bookingsApi.get(`/room/${roomNumber}`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Error fetching bookings for room ${roomNumber}:`, error);
        throw error;
    }
};

// ========== ADD SERVICES TO BOOKING ==========
export type BookingServiceCreateItem = {
    serviceId: string;
    quantity: number;
    roomNumber?: string[];
    totalAmount?: number;
    orderStatus?: string;
    paymentMethod?: string;
};

export const addServicesToBooking = async (
    bookingId: string,
    items: BookingServiceCreateItem[],
) => {
    const res = await bookingsApi.post(`/${bookingId}/services/bulk`, items);
    return res.data;
};

export const addServiceToBooking = async (
    bookingId: string,
    item: BookingServiceCreateItem,
) => {
    const res = await bookingsApi.post(`/${bookingId}/services`, item);
    return res.data;
};

export const getBookingServicesByBookingId = async (bookingId: string) => {
    try {
        const response = await api.get(`/api/booking-services/booking/${bookingId}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching booking services:", err);
        return [];
    }
};

export const saveBookingService = async (
    bookingId: string,
    data: object,
) => {
    try {
        const response = await api.post(
            `/api/booking-services/booking/${bookingId}`,
            data,
        );
        return response.data;
    } catch (error) {
        console.error("Error saving booking service:", error);
        throw error;
    }
};

export const updateBookingService = async (
    id: string | number,
    data: Partial<BookingServiceCreateItem>,
) => {
    try {
        const response = await api.put(`/api/booking-services/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating booking service ${id}:`, error);
        throw error;
    }
};

export const deleteBookingService = async (id: string | number) => {
    try {
        await api.delete(`/api/booking-services/${id}`);
    } catch (error) {
        console.error(`Error deleting booking service ${id}:`, error);
        throw error;
    }
};

export const confirmPayAtCheckout = async (
    bookingId: string,
): Promise<void> => {
    try {
        await bookingsApi.put(`/${bookingId}/confirm-pay-at-checkout`);
    } catch (error) {
        console.error(
            `Error confirming pay at checkout for booking ${bookingId}:`,
            error,
        );
        throw error;
    }
};

export const getRemainingTimeForPayment = async (
    bookingId: string,
): Promise<string> => {
    try {
        const response = await bookingsApi.get(
            `/remaining-payment-time/${bookingId}`,
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error getting remaining time for payment for booking ${bookingId}:`,
            error,
        );
        throw error;
    }
};

export const checkRoomAvailability = async (
    roomNumber: string,
    checkIn: string,
    checkOut: string,
    bookingId?: string,
): Promise<boolean> => {
    try {
        const params: any = { checkIn, checkOut, roomNumber };
        if (bookingId) params.bookingId = bookingId;
        
        const response = await bookingsApi.get('/check-availability', { params });
        return response.data;
    } catch (error) {
        console.error('Error checking room availability:', error);
        throw error;
    }
};

export const overlapBookingExists = async (
    roomNumber: string,
): Promise<string[]> => {
    try {
        const response = await bookingsApi.get(`/overlap/${roomNumber}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error checking overlap bookings for room ${roomNumber}:`,
            error,
        );
        return [];
    }
};

export const cancelBooking = async (
    bookingId: string,
    reason: string = 'Customer request',
): Promise<void> => {
    try {
        await bookingsApi.put(`/${bookingId}/cancel`, { reason });
    } catch (error) {
        console.error(`Error cancelling booking ${bookingId}:`, error);
        throw error;
    }
};

export default {
    getAll,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getAllRoomBookings,
    convertToRoomBooking,
    getBookingsByStatus,
    getBookingsByCustomerId,
    checkIn,
    checkOut,
    getBookingsByCheckInDate,
    getBookingsByCheckInDateRange,
    getBookingsByCheckOutDate,
    getBookingsByCheckOutDateRange,
    getTodayCheckins,
    getTodayCheckouts,
    getTomorrowCheckouts,
    getLateCheckouts,
    getUpcomingCheckins,
    getRecentCheckouts,
    getCompletedCheckouts,
    getByRoom,
    addServicesToBooking,
    addServiceToBooking,
    getBookingServicesByBookingId,
    saveBookingService,
    updateBookingService,
    deleteBookingService,
    confirmPayAtCheckout,
    getRemainingTimeForPayment,
    checkRoomAvailability,
    cancelBooking,
    searchBookings,
    processCheckout,
    overlapBookingExists,
    saveBookingWithDetails,
};
