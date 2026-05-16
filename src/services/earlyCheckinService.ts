/* eslint-disable */
import { api } from './apiClient';
import { earlyCheckinNotificationService } from './earlyCheckinNotificationService';

// Thêm /api để khớp với Gateway route và Backend RequestMapping
const ENDPOINT = '/api/early-checkin';

/**
 * Gửi yêu cầu check-in sớm
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

        // Gọi qua Gateway với prefix /api
        const res = await api.post(`${ENDPOINT}/request`, enhancedPayload);

        if (res.data && res.data.success) {
            // Gửi notification bất đồng bộ, không block kết quả chính
            try {
                const ecData = res.data.data;
                await earlyCheckinNotificationService.sendEarlyCheckinRequest({
                    customerId: payload.customerId,
                    customerName: 'Customer',
                    roomNumber: '',
                    bookingId: payload.bookingId,
                    requestedTime: payload.requestTime,
                    standardCheckInTime: payload.requestTime,
                    userRole: 'CUSTOMER',
                });
            } catch (notifErr) {
                console.warn('Notification error (non-blocking):', notifErr);
            }
        }
        return res.data;
    } catch (error) {
        console.error('Create early check-in request error:', error);
        throw error;
    }
};

/**
 * Lấy danh sách yêu cầu check-in sớm của một booking
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
 * Phê duyệt/Từ chối yêu cầu check-in sớm (Dành cho Nhân viên)
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
            // Notification được xử lý phía BE hoặc qua processEarlyCheckinRequest riêng
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
 * Lấy tất cả yêu cầu check-in sớm (Dành cho Quản lý)
 */
export const getAllEarlyCheckins = async () => {
    try {
        const res = await api.get(ENDPOINT);
        return res.data;
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
