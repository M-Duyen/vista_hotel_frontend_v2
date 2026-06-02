/* eslint-disable */
import { api } from './apiClient';
import type { EarlyCheckinResponse } from '../types/EarlyCheckin';

const ENDPOINT = '/api/early-checkin';

/**
 * Submit an early check-in request.
 * Frontend creates the customer confirmation and employee action notification.
 */
export const createEarlyCheckinRequest = async (payload: any) => {
    try {
        const enhancedPayload = {
            ...payload,
            booking: { bookingID: payload.bookingId },
            bookingId: payload.bookingId,
            bookingID: payload.bookingId,
            customerId: payload.customerId,
            customer: { id: payload.customerId },
            requestedTime: payload.requestTime,
            additionalFee: payload.roomPrice * 0.3,
        };

        console.log(
            'Sending Early Check-in Payload (Fix API Path):',
            enhancedPayload,
        );

        const res = await api.post(`${ENDPOINT}/request`, enhancedPayload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        return res.data;
    } catch (error) {
        console.error('Create early check-in request error:', error);
        throw error;
    }
};

/**
 * Get the latest early check-in request of a booking.
 */
export const getEarlyCheckinByBookingId = async (bookingId: string) => {
    try {
        const res = await api.get(`${ENDPOINT}/booking/${bookingId}`);
        return res.data;
    } catch (error) {
        console.error('Get early check-in by booking error:', error);
        return null;
    }
};

/**
 * Approve or reject an early check-in request.
 */
export const approveEarlyCheckin = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    employeeId: string,
) => {
    try {
        const res = await api.put(
            `${ENDPOINT}/approve/${requestId}?status=${status}&employeeId=${employeeId}`,
        );

        if (res.data && res.data.success) {
            console.log(
                `Early check-in request ${requestId} ${status} successfully`,
            );
        }

        return res.data;
    } catch (error) {
        console.error('Approve early check-in error:', error);
        throw error;
    }
};

/**
 * Get all early check-in requests.
 */
export const getAllEarlyCheckins = async (): Promise<EarlyCheckinResponse[]> => {
    try {
        const res = await api.get(`${ENDPOINT}/full`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Get all early check-ins error:', error);
        return [];
    }
};

export default {
    createEarlyCheckinRequest,
    getEarlyCheckinByBookingId,
    approveEarlyCheckin,
    getAllEarlyCheckins,
};
