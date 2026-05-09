import { api } from './apiClient';
import { earlyCheckinNotificationService } from './earlyCheckinNotificationService';
import type { CheckinApproval } from './earlyCheckinNotificationService';

const ENDPOINT = '/early-checkin';

/**
 * Gửi yêu cầu check-in sớm
 * payload:
 *  {
 *    customerId: string,
 *    bookingId: string,
 *    requestTime: "2024-06-20T08:00",
 *    roomPrice: number
 *  }
 */
export const createEarlyCheckinRequest = async (payload: {
    customerId: string;
    bookingId: string;
    requestTime: string;
    roomPrice: number;
}) => {
    try {
        const res = await api.post(`${ENDPOINT}/request`, payload);
        return res.data;
    } catch (error) {
        console.error('Error creating early checkin request:', error);

        // Development fallback - create mock response
        if (import.meta.env.DEV) {
            console.warn(
                'DEV MODE: Backend server not available, using mock response',
            );
            console.info(
                'To fix this: Start your backend server on http://localhost:8080',
            );

            const mockResponse = {
                requestID: `ER-${Date.now()}`,
                requestTime: payload.requestTime,
                approvalStatus: 'PENDING',
                additionalFee: payload.roomPrice * 0.3, // 30% fee
                requestDate: new Date().toISOString(),
                booking: { bookingID: payload.bookingId },
            };

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            return mockResponse;
        }

        throw error;
    }
};

/**
 * Nhân viên duyệt hoặc từ chối yêu cầu
 * status = APPROVED | REJECTED
 */
export const approveEarlyCheckin = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    employeeId: string,
    bookingInfo?: {
        customerId: string;
        customerName: string;
        roomNumber: string;
        requestedTime?: string;
    },
) => {
    try {
        // 1. Call backend API to approve/reject with employeeId
        const res = await api.put(
            `${ENDPOINT}/approve/${requestId}?status=${status}&employeeId=${employeeId}`,
        );

        // 2. Send notification to customer
        if (bookingInfo) {
            try {
                const approvalData: CheckinApproval = {
                    requestId,
                    customerId: bookingInfo.customerId,
                    customerName: bookingInfo.customerName,
                    roomNumber: bookingInfo.roomNumber,
                    approvedBy: employeeId,
                    approvedTime: bookingInfo.requestedTime,
                    isApproved: status === 'APPROVED',
                    reason:
                        status === 'REJECTED'
                            ? 'Yêu cầu bị từ chối bởi nhân viên'
                            : undefined,
                };

                await earlyCheckinNotificationService.processEarlyCheckinRequest(
                    approvalData,
                );
                console.log(
                    '✅ Notification sent to customer after approval/rejection',
                );
            } catch (notifError) {
                console.error('⚠️ Failed to send notification:', notifError);
                // Don't throw - approval already succeeded
            }
        }

        return res.data;
    } catch (error) {
        console.error('Error approving early checkin:', error);

        // Development fallback
        if (import.meta.env.DEV) {
            console.log('DEV MODE: Mock approval response');
            await new Promise((resolve) => setTimeout(resolve, 300));
            return { success: true, requestId, status };
        }

        throw error;
    }
};

/**
 * Lấy tất cả yêu cầu check-in sớm
 */
export const getAllEarlyCheckins = async () => {
    try {
        const res = await api.get(ENDPOINT);
        return res.data;
    } catch (error) {
        console.error('Error fetching early checkins:', error);
        throw error;
    }
};

export default {
    createEarlyCheckinRequest,
    approveEarlyCheckin,
    getAllEarlyCheckins,
};
