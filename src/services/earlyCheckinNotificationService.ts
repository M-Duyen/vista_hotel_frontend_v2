import { notificationApiService } from './notificationApiService';

// Interface cho early check-in request
export interface EarlyCheckinRequest {
    customerId: string;
    customerName: string;
    roomNumber: string;
    bookingId: string;
    requestedTime: string;
    standardCheckInTime: string;
    reason?: string;
    userRole: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

// Interface cho approval/rejection
export interface CheckinApproval {
    requestId: string;
    customerId: string;
    customerName: string;
    roomNumber: string;
    approvedBy: string;
    approvedTime?: string;
    isApproved: boolean;
    reason?: string;
}

// Interface cho pending request
export interface PendingEarlyCheckinRequest {
    notificationId: string;
    customerId: string;
    customerName: string;
    roomNumber: string;
    requestedTime: string;
    standardCheckInTime: string;
    reason?: string;
    requestTime: string;
    title: string;
    message: string;
}

export interface LateCheckoutRequest {
    customerId: string;
    customerName: string;
    roomNumber: string;
    bookingId: string;
    requestedTime: string;
    standardCheckoutTime: string;
    reason?: string;
    userRole: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

export interface CheckoutApproval {
    requestId: string;
    customerId: string;
    customerName: string;
    roomNumber: string;
    approvedBy: string;
    approvedTime?: string;
    isApproved: boolean;
    reason?: string;
}

export interface CancelBookingRequest {
    customerId: string;
    customerName: string;
    bookingId: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    reason?: string;
    userRole: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

class EarlyCheckinNotificationService {
    /**
     * Khách hàng gửi yêu cầu check-in sớm
     * - Tạo thông báo xác nhận cho khách hàng
     * - Tạo thông báo yêu cầu cho nhân viên
     */
    async sendEarlyCheckinRequest(request: EarlyCheckinRequest): Promise<void> {
        console.log('Sending early checkin request:', request);
        try {
            // Thông báo xác nhận cho khách hàng
            console.log('Creating customer notification...');
            const customerResponse =
                await notificationApiService.createNotification({
                    type: 'INFO',
                    category: 'EARLY_CHECKIN',
                    title: 'Early Check-in Request Submitted',
                    message: `You have requested early check-in for room ${request.roomNumber} at ${request.requestedTime}. We will process and respond as soon as possible.`,
                    toUserId: request.customerId,
                    toUserType: 'CUSTOMER',
                    priority: 'NORMAL',
                    needsAction: false,
                    status: 'SENT',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'EARLY_CHECKIN_CUSTOMER_CONFIRMATION',
                        bookingId: request.bookingId,
                        roomNumber: request.roomNumber,
                        requestedTime: request.requestedTime,
                        standardCheckInTime: request.standardCheckInTime,
                        reason: request.reason,
                    }),
                });
            console.log('Customer notification created:', customerResponse);

            // Thông báo yêu cầu cho tất cả nhân viên (role EMPLOYEE)
            console.log('Creating employee notification...');

            const employeeResponse =
                await notificationApiService.createNotification({
                    type: 'REQUEST',
                    category: 'EARLY_CHECKIN',
                    title: 'New Early Check-in Request',
                    message: `Customer ${request.customerName} has requested early check-in for room ${request.roomNumber}. Requested time: ${request.requestedTime}`,
                    // Gửi cho tất cả nhân viên
                    toUserType: 'EMPLOYEE',
                    priority: 'HIGH',
                    needsAction: true,
                    status: 'PENDING',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'EARLY_CHECKIN_EMPLOYEE_ACTION_REQUIRED',
                        customerId: request.customerId,
                        customerName: request.customerName,
                        bookingId: request.bookingId,
                        roomNumber: request.roomNumber,
                        requestedTime: request.requestedTime,
                        standardCheckInTime: request.standardCheckInTime,
                        reason: request.reason,
                        requestTime: new Date().toISOString(),
                    }),
                });
            console.log('Employee notification response:', employeeResponse);

            // Check if notification was created successfully
            if (!employeeResponse.success) {
                console.error(
                    'Failed to create employee notification:',
                    employeeResponse.message,
                );
            }

            console.log(
                'Early checkin request notifications sent successfully',
            );
        } catch (error) {
            console.error(
                'Error sending early checkin request notifications:',
                error,
            );
            throw new Error(
                'Cannot process early check-in request. Please try again.',
            );
        }
    }

    /**
     * Nhân viên phê duyệt/từ chối yêu cầu check-in sớm
     * - Đánh dấu thông báo nhân viên là đã đọc
     * - Gửi thông báo kết quả cho khách hàng
     */
    async processEarlyCheckinRequest(approval: CheckinApproval): Promise<void> {
        try {
            // 1. Đánh dấu các thông báo liên quan cho nhân viên là đã đọc
            await this.markRelatedNotificationsAsRead(
                approval.customerId,
                approval.roomNumber,
                'EARLY_CHECKIN_EMPLOYEE_ACTION_REQUIRED',
            );

            // 2. Gửi thông báo kết quả cho khách hàng
            if (approval.isApproved) {
                // Phê duyệt
                await notificationApiService.createNotification({
                    type: 'INFO',
                    category: 'EARLY_CHECKIN',
                    title: 'Early check-in request approved',
                    message: `Early check-in request for room ${approval.roomNumber} has been approved. You can check in from ${approval.approvedTime}. Enjoy your stay!`,
                    toUserId: approval.customerId,
                    toUserType: 'CUSTOMER',
                    priority: 'HIGH',
                    needsAction: false,
                    status: 'APPROVED',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'EARLY_CHECKIN_APPROVED',
                        roomNumber: approval.roomNumber,
                        approvedBy: approval.approvedBy,
                        approvedTime: approval.approvedTime,
                        originalRequestId: approval.requestId,
                    }),
                });
            } else {
                // Từ chối
                await notificationApiService.createNotification({
                    type: 'ALERT',
                    category: 'EARLY_CHECKIN',
                    title: 'Early check-in request rejected',
                    message: `We're sorry, but the early check-in request for room ${approval.roomNumber} has been rejected. Please contact the front desk for more information.`,
                    toUserId: approval.customerId,
                    toUserType: 'CUSTOMER',
                    priority: 'HIGH',
                    needsAction: false,
                    status: 'REJECTED',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'EARLY_CHECKIN_REJECTED',
                        roomNumber: approval.roomNumber,
                        rejectedBy: approval.approvedBy,
                        reason: approval.reason,
                        originalRequestId: approval.requestId,
                    }),
                });
            }

            console.log(
                `Early checkin request ${
                    approval.isApproved ? 'approved' : 'rejected'
                } successfully`,
            );
        } catch (error) {
            console.error('Error processing early checkin request:', error);
            throw new Error('Không thể xử lý yêu cầu. Vui lòng thử lại.');
        }
    }

    /**
     * Đánh dấu các thông báo liên quan là đã đọc
     * (Sử dụng khi nhân viên đã xử lý yêu cầu)
     */
    private async markRelatedNotificationsAsRead(
        customerId: string,
        roomNumber: string,
        requestType: string,
    ): Promise<void> {
        try {
            // Lấy danh sách thông báo chưa đọc của nhân viên liên quan đến yêu cầu này
            const notifications =
                await notificationApiService.getUnreadNotifications();

            if (notifications.success && notifications.data) {
                const relatedNotifications = notifications.data.filter(
                    (notification) => {
                        if (!notification.dataJson) return false;

                        try {
                            const data = JSON.parse(notification.dataJson);
                            return (
                                data.customerId === customerId &&
                                data.roomNumber === roomNumber &&
                                data.requestType === requestType
                            );
                        } catch {
                            return false;
                        }
                    },
                );

                // Đánh dấu tất cả thông báo liên quan là đã đọc
                for (const notification of relatedNotifications) {
                    await notificationApiService.markAsRead(notification.id);
                }
            }
        } catch (error) {
            console.error(
                'Error marking related notifications as read:',
                error,
            );
        }
    }

    /**
     * Thông báo khi khách hàng check-in thành công (tự động)
     */
    async notifySuccessfulCheckin(
        customerId: string,
        customerName: string,
        roomNumber: string,
        actualCheckinTime: string,
    ): Promise<void> {
        try {
            // Thông báo cho khách hàng
            await notificationApiService.createNotification({
                type: 'INFO',
                category: 'OTHER',
                title: 'Check in successful',
                message: `Welcome to Vista Hotel! You have successfully checked in to room ${roomNumber} at ${actualCheckinTime}. Enjoy your stay!`,
                toUserId: customerId,
                toUserType: 'CUSTOMER',
                priority: 'NORMAL',
                needsAction: false,
                status: 'SENT',
                isRealtime: true,
                isRead: false,
                dataJson: JSON.stringify({
                    eventType: 'SUCCESSFUL_CHECKIN',
                    roomNumber,
                    actualCheckinTime,
                    customerId,
                }),
            });

            // Thông báo cho nhân viên (thông tin)
            await notificationApiService.createNotification({
                type: 'INFO',
                category: 'OTHER',
                title: 'Customer Check-in Completed',
                message: `Customer ${customerName} has successfully checked in to room ${roomNumber} at ${actualCheckinTime}.`,
                toUserType: 'EMPLOYEE',
                priority: 'LOW',
                needsAction: false,
                status: 'SENT',
                isRealtime: true,
                isRead: false,
                dataJson: JSON.stringify({
                    eventType: 'STAFF_NOTIFICATION_CHECKIN_COMPLETED',
                    customerId,
                    customerName,
                    roomNumber,
                    actualCheckinTime,
                }),
            });
        } catch (error) {
            console.error(
                'Error sending successful checkin notifications:',
                error,
            );
            // Không throw error vì đây là thông báo phụ
        }
    }

    /**
     * Lấy danh sách yêu cầu check-in sớm đang pending (cho nhân viên)
     */
    async getPendingEarlyCheckinRequests(): Promise<
        PendingEarlyCheckinRequest[]
    > {
        try {
            const notifications =
                await notificationApiService.getUnreadNotifications();

            if (!notifications.success || !notifications.data) {
                return [];
            }

            return notifications.data
                .filter((notification) => {
                    return (
                        notification.category === 'EARLY_CHECKIN' &&
                        notification.status === 'PENDING' &&
                        notification.needsAction === true
                    );
                })
                .map((notification) => {
                    try {
                        const data = notification.dataJson
                            ? JSON.parse(notification.dataJson)
                            : {};
                        return {
                            notificationId: notification.id,
                            customerId: data.customerId,
                            customerName: data.customerName,
                            roomNumber: data.roomNumber,
                            requestedTime: data.requestedTime,
                            standardCheckInTime: data.standardCheckInTime,
                            reason: data.reason,
                            requestTime: data.requestTime,
                            title: notification.title,
                            message: notification.message,
                        };
                    } catch {
                        return null;
                    }
                })
                .filter((item) => item !== null);
        } catch (error) {
            console.error(
                'Error getting pending early checkin requests:',
                error,
            );
            return [];
        }
    }

    /**
     * Khách hàng gửi yêu cầu checkout muộn
     * - Tạo thông báo xác nhận cho khách hàng
     * - Tạo thông báo yêu cầu cho nhân viên
     */
    async sendLateCheckoutRequest(request: LateCheckoutRequest): Promise<void> {
        console.log('📤 Sending late checkout request:', request);
        try {
            // 1. Thông báo xác nhận cho khách hàng
            await notificationApiService.createNotification({
                type: 'INFO',
                category: 'LATE_CHECKOUT',
                title: 'Late Checkout Request Submitted',
                message: `You have submitted a late checkout request for room ${request.roomNumber} at ${request.requestedTime}. We will process it and respond as soon as possible.`,
                toUserId: request.customerId,
                toUserType: 'CUSTOMER',
                priority: 'NORMAL',
                needsAction: false,
                status: 'SENT',
                isRealtime: true,
                isRead: false,
                dataJson: JSON.stringify({
                    requestType: 'LATE_CHECKOUT_CUSTOMER_CONFIRMATION',
                    bookingId: request.bookingId,
                    roomNumber: request.roomNumber,
                    requestedTime: request.requestedTime,
                    standardCheckoutTime: request.standardCheckoutTime,
                    reason: request.reason,
                }),
            });

            // 2. Thông báo yêu cầu cho nhân viên
            await notificationApiService.createNotification({
                type: 'REQUEST',
                category: 'LATE_CHECKOUT',
                title: 'New Late Checkout Request',
                message: `Customer ${
                    request.customerName
                } has requested a late checkout for room ${
                    request.roomNumber
                }. Requested time: ${request.requestedTime} (Standard: ${
                    request.standardCheckoutTime
                }). Reason: ${request.reason || 'N/A'}`,
                toUserType: 'EMPLOYEE',
                priority: 'HIGH',
                needsAction: true,
                status: 'PENDING',
                isRealtime: true,
                isRead: false,
                dataJson: JSON.stringify({
                    requestType: 'LATE_CHECKOUT_EMPLOYEE_ACTION_REQUIRED',
                    customerId: request.customerId,
                    customerName: request.customerName,
                    bookingId: request.bookingId,
                    roomNumber: request.roomNumber,
                    requestedTime: request.requestedTime,
                    standardCheckoutTime: request.standardCheckoutTime,
                    reason: request.reason,
                    requestTime: new Date().toISOString(),
                }),
            });

            console.log(
                'Late checkout request notifications sent successfully',
            );
        } catch (error) {
            console.error(
                'Error sending late checkout request notifications:',
                error,
            );
            throw new Error(
                'Unable to send late checkout request. Please try again.',
            );
        }
    }

    /**
     * Nhân viên phê duyệt/từ chối yêu cầu checkout muộn
     */
    async processLateCheckoutRequest(
        approval: CheckoutApproval,
    ): Promise<void> {
        try {
            // 1. Đánh dấu thông báo nhân viên là đã đọc
            await this.markRelatedNotificationsAsRead(
                approval.customerId,
                approval.roomNumber,
                'LATE_CHECKOUT_EMPLOYEE_ACTION_REQUIRED',
            );

            // 2. Gửi thông báo kết quả cho khách hàng
            if (approval.isApproved) {
                await notificationApiService.createNotification({
                    type: 'INFO',
                    category: 'LATE_CHECKOUT',
                    title: 'Late Checkout Request Approved',
                    message: `The late checkout request for room ${approval.roomNumber} has been approved. You may checkout at ${approval.approvedTime}. Enjoy your extended stay!`,
                    toUserId: approval.customerId,
                    toUserType: 'CUSTOMER',
                    priority: 'HIGH',
                    needsAction: false,
                    status: 'APPROVED',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'LATE_CHECKOUT_APPROVED',
                        roomNumber: approval.roomNumber,
                        approvedBy: approval.approvedBy,
                        approvedTime: approval.approvedTime,
                        originalRequestId: approval.requestId,
                    }),
                });
            } else {
                await notificationApiService.createNotification({
                    type: 'ALERT',
                    category: 'LATE_CHECKOUT',
                    title: 'Late Checkout Request Rejected',
                    message: `We're sorry, the late checkout request for room ${approval.roomNumber} has been rejected. Please checkout on time.`,
                    toUserId: approval.customerId,
                    toUserType: 'CUSTOMER',
                    priority: 'HIGH',
                    needsAction: false,
                    status: 'REJECTED',
                    isRealtime: true,
                    isRead: false,
                    dataJson: JSON.stringify({
                        requestType: 'LATE_CHECKOUT_REJECTED',
                        roomNumber: approval.roomNumber,
                        rejectedBy: approval.approvedBy,
                        reason: approval.reason,
                        originalRequestId: approval.requestId,
                    }),
                });
            }
        } catch (error) {
            console.error('Error processing late checkout request:', error);
            throw error;
        }
    }

    /**
     * Khách hàng hủy booking
     * - CHỈ tạo thông báo xác nhận cho khách hàng
     * - KHÔNG gửi cho nhân viên
     */
    async sendCancelBookingRequest(
        request: CancelBookingRequest,
    ): Promise<void> {
        console.log(
            'Sending cancel booking notification to customer:',
            request,
        );
        try {
            // Thông báo xác nhận cho khách hàng

            await notificationApiService.createNotification({
                type: 'INFO',
                category: 'CANCELLATION',
                title: 'Booking Cancellation Successful',
                message: `You have successfully cancelled booking ${request.bookingId} (Room ${request.roomNumber}) successfully. Please contact the front desk for further assistance with the refund policy.`,
                toUserId: request.customerId,
                toUserType: 'CUSTOMER',
                priority: 'NORMAL',
                needsAction: false,
                status: 'SENT',
                isRealtime: true,
                isRead: false,
                dataJson: JSON.stringify({
                    requestType: 'CANCEL_BOOKING_CONFIRMATION',
                    bookingId: request.bookingId,
                    roomNumber: request.roomNumber,
                    checkInDate: request.checkInDate,
                    checkOutDate: request.checkOutDate,
                    totalAmount: request.totalAmount,
                    reason: request.reason,
                    cancelledAt: new Date().toISOString(),
                }),
            });

            console.log(
                'Cancel booking notification sent to customer successfully',
            );
        } catch (error) {
            console.error(
                'Error sending cancel booking notification:',
                error,
            );
            throw new Error(
                'Unable to send booking cancellation notification. Please try again later.',
            );
        }
    }
}

export const earlyCheckinNotificationService =
    new EarlyCheckinNotificationService();
