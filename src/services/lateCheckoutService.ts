import { api } from './apiClient';

const ENDPOINT = '/late-checkout';

/**
 * Gửi yêu cầu checkout muộn
 */
export const createLateCheckoutRequest = async (payload: {
    bookingId: string;
    requestTime: string;
    roomPrice: number;
}) => {
    try {
        const res = await api.post(`${ENDPOINT}/request`, payload);
        return res.data.data; // ⭐ BE trả { success, message, data }
    } catch (error) {
        console.error('Error creating late checkout request:', error);
        throw error;
    }
};

/**
 * Duyệt hoặc từ chối yêu cầu checkout muộn
 */
export const approveLateCheckout = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    employeeId?: string,
) => {
    try {
        const url = employeeId
            ? `${ENDPOINT}/approve/${requestId}?status=${status}&employeeId=${employeeId}`
            : `${ENDPOINT}/approve/${requestId}?status=${status}`;

        const res = await api.put(url);
        return res.data.data; // ⭐ BE trả { success, message, data }
    } catch (error) {
        console.error('Error approving late checkout:', error);
        throw error;
    }
};

/**
 * Lấy tất cả yêu cầu checkout muộn
 */
export const getAllLateCheckouts = async () => {
    try {
        const res = await api.get(ENDPOINT);
        return res.data; // ⭐ BE trả list DTO
    } catch (error) {
        console.error('Error fetching all late checkouts:', error);
        throw error;
    }
};

/**
 * Tính phí checkout muộn realtime
 */
export const calculateLateCheckoutFee = async (
    bookingId: string,
    requestTime: string,
    roomPrice: number,
) => {
    try {
        const res = await api.get(`${ENDPOINT}/calculate-fee`, {
            params: { bookingId, requestTime, roomPrice },
        });
        return res.data.fee; // ⭐ BE trả { success, fee }
    } catch (error) {
        console.error('Error calculating late checkout fee:', error);
        throw error;
    }
};

/**
 * Lấy yêu cầu checkout muộn theo bookingId
 */
export const getLateCheckoutByBookingId = async (bookingId: string) => {
    try {
        const res = await api.get(`${ENDPOINT}/by-booking`, {
            params: { bookingId },
        });
        return res.data.data; // ⭐ BE trả { success, data }
    } catch (error) {
        console.error('Error fetching late checkout by booking ID:', error);
        throw error;
    }
};

export default {
    createLateCheckoutRequest,
    approveLateCheckout,
    getAllLateCheckouts,
    calculateLateCheckoutFee,
    getLateCheckoutByBookingId,
};
