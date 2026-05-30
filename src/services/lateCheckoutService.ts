import { requestApi } from './apiClient';
import { earlyCheckinNotificationService } from './earlyCheckinNotificationService';
import type { LateCheckoutResponse } from '../types/LateCheckout';

const ENDPOINT = '/late-checkout';

/**
 * Gửi yêu cầu checkout muộn
 */
export const createLateCheckoutRequest = async (payload: {
    bookingId: string;
    requestTime: string;
    roomPrice: number;
    customerId?: string;
    customerName?: string;
    roomNumber?: string;
    standardCheckoutTime?: string;
    reason?: string;
}) => {
    try {
        const res = await requestApi.post(`${ENDPOINT}/request`, payload);
        if (res.data?.success === false) {
            throw new Error(
                res.data.message || 'Booking da gui yeu cau late check-out',
            );
        }

        if (res.data?.success && payload.customerId) {
            try {
                await earlyCheckinNotificationService.sendLateCheckoutRequest({
                    customerId: payload.customerId,
                    customerName: payload.customerName || 'Customer',
                    roomNumber: payload.roomNumber || 'N/A',
                    bookingId: payload.bookingId,
                    requestedTime: payload.requestTime,
                    standardCheckoutTime:
                        payload.standardCheckoutTime || payload.requestTime,
                    reason: payload.reason,
                    userRole: 'CUSTOMER',
                });
            } catch (notifErr) {
                console.warn('Notification error (non-blocking):', notifErr);
            }
        }

        return res.data.data;
    } catch (error) {
        console.error('Error creating late checkout request:', error);
        return [];
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

        const res = await requestApi.put(url);
        return res.data.data;
    } catch (error) {
        console.error('Error approving late checkout:', error);
        throw error;
    }
};

/**
 * Lấy tất cả yêu cầu checkout muộn
 */
export const getAllLateCheckouts = async (): Promise<LateCheckoutResponse[]> => {
    try {
        const res = await requestApi.get(`${ENDPOINT}/full`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error fetching all late checkouts:', error);
        return [];
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
        const res = await requestApi.get(`${ENDPOINT}/calculate-fee`, {
            params: { bookingId, requestTime, roomPrice },
        });
        return res.data.fee;
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
        const res = await requestApi.get(`${ENDPOINT}/by-booking`, {
            params: { bookingId },
        });
        return res.data.data;
    } catch (error) {
        console.error('Error fetching late checkout by booking ID:', error);
        return null;
    }
};

export default {
    createLateCheckoutRequest,
    approveLateCheckout,
    getAllLateCheckouts,
    calculateLateCheckoutFee,
    getLateCheckoutByBookingId,
};
