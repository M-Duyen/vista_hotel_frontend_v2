import { useState, useEffect } from 'react';
import type { Booking } from '../../types/Booking';
import { cancelBooking } from '../../services/bookingService';
import { useNotificationContext } from '../../context/NotificationContextAPI';
import { earlyCheckinNotificationService } from '../../services/earlyCheckinNotificationService';
import type { CancelBookingRequest } from '../../services/earlyCheckinNotificationService';
import { useToastContext } from '../../hooks/useToastContext';
import { sendEmail, type EmailPayload } from '../../services/emailService';

interface Props {
    booking: Booking | null;
    onClose: () => void;
    onSuccess: () => void;
    onError?: (message: string) => void;
}

// ============================================
// EMAIL TEMPLATE BUILDER
// ============================================
interface CancellationEmailData {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    bookingId: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: string;
    reason: string;
    refundAmount?: number;
    paymentInfo?: {
        method: string;
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        mobileNumber?: string;
    };
}

const createCancellationEmailTemplate = (
    data: CancellationEmailData,
): EmailPayload => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Cancellation Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Header với màu chủ đạo #b9ad96 -->
                <div style="background: linear-gradient(135deg, #b9ad96 0%, #a89981 100%); padding: 40px 30px; text-align: center; position: relative;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                        Vista Hotel
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 300;">
                        Booking Cancellation Confirmation
                    </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 35px;">
                    
                    <!-- Greeting -->
                    <div style="margin-bottom: 30px;">
                        <p style="font-size: 16px; color: #2c2c2c; margin: 0 0 10px 0; line-height: 1.6;">
                            Dear <strong style="color: #b9ad96;">${
                                data.customerName
                            }</strong>,
                        </p>
                        <p style="font-size: 14px; color: #5a5a5a; margin: 0; line-height: 1.8;">
                            We have received and successfully processed your booking cancellation request. Below are the details of the cancelled booking.
                        </p>
                    </div>

                    <!-- Customer Information -->
                    <div style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); border-left: 4px solid #b9ad96; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 18px 0; color: #2c2c2c; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                            Customer Information
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px; width: 40%;"><strong>Full Name:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${
                                    data.customerName
                                }</td>
                            </tr>
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Email:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${
                                    data.customerEmail
                                }</td>
                            </tr>
                            ${
                                data.customerPhone
                                    ? `
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Phone Number:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${data.customerPhone}</td>
                            </tr>
                            `
                                    : ''
                            }
                            ${
                                data.customerAddress
                                    ? `
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Address:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${data.customerAddress}</td>
                            </tr>
                            `
                                    : ''
                            }
                        </table>
                    </div>

                    <!-- Booking Information -->
                    <div style="background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%); border-left: 4px solid #b9ad96; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 18px 0; color: #2c2c2c; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                            Booking Details
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px; width: 40%;"><strong>Booking ID:</strong></td>
                                <td style="padding: 10px 0; color: #b9ad96; font-size: 14px; font-weight: 600;">${
                                    data.bookingId
                                }</td>
                            </tr>
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Room Number:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${
                                    data.roomNumber
                                }</td>
                            </tr>
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Check-in Date:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${
                                    data.checkInDate
                                }</td>
                            </tr>
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px;"><strong>Check-out Date:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; font-weight: 500;">${
                                    data.checkOutDate
                                }</td>
                            </tr>
                            <tr style="border-top: 2px solid #b9ad96;">
                                <td style="padding: 12px 0; color: #5a5a5a; font-size: 14px;"><strong>Total Amount:</strong></td>
                                <td style="padding: 12px 0; color: #2c2c2c; font-size: 18px; font-weight: 700;">${
                                    data.totalAmount
                                } VNĐ</td>
                            </tr>
                            <tr style="border-top: 1px solid #e8e8e8;">
                                <td style="padding: 10px 0; color: #5a5a5a; font-size: 14px; vertical-align: top;"><strong>Cancellation Reason:</strong></td>
                                <td style="padding: 10px 0; color: #2c2c2c; font-size: 14px; line-height: 1.6;">${
                                    data.reason
                                }</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Refund Information (nếu có) -->
                    ${
                        data.refundAmount && data.refundAmount > 0
                            ? `
                    <div style="background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e9 100%); border-left: 4px solid #4caf50; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 18px 0; color: #2e7d32; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                          
                            Refund Information
                        </h3>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; text-align: center; border: 2px dashed #4caf50;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; color: #5a5a5a; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</p>
                            <p style="margin: 0; font-size: 32px; color: #2e7d32; font-weight: 700;">
                                ${data.refundAmount.toLocaleString(
                                    'vi-VN',
                                )} <span style="font-size: 18px;">VNĐ</span>
                            </p>
                        </div>

                        <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <p style="margin: 0; font-size: 13px; color: #5a5a5a; line-height: 1.8;">
                                ⏱<strong>Processing Time:</strong> The refund will be credited to your account within <strong style="color: #2e7d32;">3-5 business days</strong> from the confirmation date.
                            </p>
                        </div>

                        ${
                            data.paymentInfo?.method === 'BANK_TRANSFER'
                                ? `
                        <div style="background-color: white; padding: 18px; border-radius: 8px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #2c2c2c; font-weight: 600;">
                                Refund Method: Bank Transfer
                            </p>
                            <table style="width: 100%; font-size: 13px; color: #5a5a5a;">
                                <tr>
                                    <td style="padding: 6px 0; width: 35%;"><strong>Bank Name:</strong></td>
                                    <td style="padding: 6px 0; color: #2c2c2c; font-weight: 500;">${data.paymentInfo.bankName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Account Number:</strong></td>
                                    <td style="padding: 6px 0; color: #2c2c2c; font-weight: 500;">${data.paymentInfo.accountNumber}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0;"><strong>Account Holder:</strong></td>
                                    <td style="padding: 6px 0; color: #2c2c2c; font-weight: 500;">${data.paymentInfo.accountName}</td>
                                </tr>
                            </table>
                        </div>
                        `
                                : data.paymentInfo
                                ? `
                        <div style="background-color: white; padding: 18px; border-radius: 8px;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #2c2c2c; font-weight: 600;">
                                Refund Method: ${data.paymentInfo.method}
                            </p>
                            <table style="width: 100%; font-size: 13px; color: #5a5a5a;">
                                <tr>
                                    <td style="padding: 6px 0; width: 35%;"><strong>Phone Number:</strong></td>
                                    <td style="padding: 6px 0; color: #2c2c2c; font-weight: 500;">${data.paymentInfo.mobileNumber}</td>
                                </tr>
                            </table>
                        </div>
                        `
                                : ''
                        }
                    </div>
                    `
                            : ''
                    }

                    <!-- Contact Information -->
                    <div style="background-color: #2c2c2c; color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #b9ad96;">
                            Need Assistance?
                        </h3>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #e0e0e0; line-height: 1.6;">
                            If you have any questions, please contact us:
                        </p>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <p style="margin: 0; font-size: 14px;">
                                <span style="color: #b9ad96; font-weight: 600;">Hotline:</span> <br/>
                                <a href="tel:1900xxxx" style="color: white; text-decoration: none;">1900-xxxx</a>
                            </p>
                            <p style="margin: 0; font-size: 14px;">
                                <span style="color: #b9ad96; font-weight: 600;">Email:</span> 
                                <a href="mailto:support@vistahotel.com" style="color: white; text-decoration: none;">support@vistahotel.com</a>
                            </p>
                            <p style="margin: 0; font-size: 14px;">
                                <span style="color: #b9ad96; font-weight: 600;">🌐 Website:</span> 
                                <a href="http://localhost:5173/" style="color: white; text-decoration: none;">www.vistahotel.com</a>
                            </p>
                        </div>
                    </div>

                    <!-- Closing Message -->
                    <div style="text-align: center; padding: 20px 0;">
                        <p style="margin: 0 0 15px 0; font-size: 14px; color: #5a5a5a; line-height: 1.8;">
                            We sincerely apologize for any inconvenience and hope to serve you again in the future.
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #2c2c2c; font-weight: 600;">
                            Best Regards,<br>
                            <span style="color: #b9ad96; font-size: 16px;">Vista Hotel Team</span>
                        </p>
                    </div>

                </div>

                <!-- Footer -->
                <div style="background-color: #f5f5f5; padding: 25px 35px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">
                        This is an automated email. Please do not reply directly to this message.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #b0b0b0;">
                        © 2025 Vista Hotel. All Rights Reserved.
                    </p>
                </div>

            </div>
        </body>
        </html>
            </p>
        </div>
    `;

    return {
        to: data.customerEmail,
        subject: `[Vista Hotel] Xác nhận hủy đặt phòng #${data.bookingId}`,
        htmlContent,
    };
};

export default function CancelBookingModal({
    booking,
    onClose,
    onSuccess,
    onError,
}: Props) {
    const { refreshNotifications } = useNotificationContext();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        method: 'BANK_TRANSFER',
        accountNumber: '',
        accountName: '',
        bankName: '',
        mobileNumber: '',
    });

    const toast = useToastContext();

    // Chặn scroll body khi modal mở và thêm ESC key
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirmed) {
            toast.error('Vui lòng xác nhận hủy booking');
            return;
        }

        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do hủy');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare refund method data với validation tốt hơn
            let refundMethodData = null;

            if (refundAmount > 0) {
                // Validate dữ liệu trước khi gửi
                if (paymentInfo.method === 'BANK_TRANSFER') {
                    if (
                        !paymentInfo.bankName ||
                        !paymentInfo.accountNumber ||
                        !paymentInfo.accountName
                    ) {
                        toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
                        setIsSubmitting(false);
                        return;
                    }
                    refundMethodData = {
                        refundMethod: {
                            method: paymentInfo.method,
                            bankName: paymentInfo.bankName.trim(),
                            accountNumber: paymentInfo.accountNumber.trim(),
                            accountName: paymentInfo.accountName.trim(),
                        },
                        refundAccountInfo: `Bank: ${paymentInfo.bankName.trim()}, Acc: ${paymentInfo.accountNumber.trim()}, Name: ${paymentInfo.accountName.trim()}`,
                        refundAmount: refundAmount,
                    };
                } else {
                    // MOMO, ZALOPAY, VNPAY
                    if (!paymentInfo.mobileNumber) {
                        toast.error(
                            `Vui lòng điền số điện thoại ${paymentInfo.method}`,
                        );
                        setIsSubmitting(false);
                        return;
                    }
                    refundMethodData = {
                        refundMethod: {
                            method: paymentInfo.method,
                            mobileNumber: paymentInfo.mobileNumber.trim(),
                        },
                        refundAccountInfo: `Phone: ${paymentInfo.mobileNumber.trim()}`,
                        refundAmount: refundAmount,
                    };
                }
            }

            console.log('=== DEBUG PAYMENT INFO (ENHANCED) ===');
            console.log(
                'Original Payment Info State:',
                JSON.stringify(paymentInfo, null, 2),
            );
            console.log('Refund Amount Calculated:', refundAmount);
            console.log(
                'Final Refund Method Data:',
                JSON.stringify(refundMethodData, null, 2),
            );
            console.log('Booking Payment Status:', booking?.paymentStatus);
            console.log('Booking Status:', booking?.status);

            console.log('=== API CALL PARAMETERS ===');
            console.log('Booking ID:', booking?.bookingID);
            console.log(
                'Reason length:',
                reason.trim().length,
                '- Content:',
                reason.trim(),
            );
            console.log('Customer ID:', booking?.customer?.id);

            // Validate trước khi call API
            if (!refundMethodData && refundAmount > 0) {
                console.error(
                    'ERROR: Refund data is null but refund amount > 0',
                );
                toast.error('Lỗi: Không thể tạo thông tin hoàn tiền');
                setIsSubmitting(false);
                return;
            }

            // Call real API
            const result = await cancelBooking(
                booking?.bookingID || '',
                reason.trim(),
                booking?.customer?.id || '',
                refundMethodData || {
                    refundMethod: { method: 'NONE' },
                    refundAccountInfo: 'No refund required (Booking was not paid)',
                    refundAmount: 0,
                },
            );

            console.log('=== API RESPONSE (ENHANCED) ===');
            console.log(
                'Full Cancel Booking Result:',
                JSON.stringify(result, null, 2),
            );
            console.log(
                'Response Refund Account Info:',
                result?.refundAccountInfo,
            );
            console.log('Response Refund Method:', result?.refundMethod);
            console.log('Response Refund Amount:', result?.refundAmount);

            // Kiểm tra xem dữ liệu có được lưu không
            if (refundAmount > 0) {
                if (!result?.refundAccountInfo && !result?.refundMethod) {
                    console.warn('WARNING: Refund data not saved to backend!');
                    console.warn(
                        'This might be due to PaymentStatus condition in backend',
                    );
                    console.warn(
                        'Backend might be checking for PAID status only',
                    );
                    console.warn(
                        'But actual status might be PERCENTAGE_50 or PERCENTAGE_100',
                    );
                } else {
                    console.log('SUCCESS: Refund data saved successfully');
                }
            }

            // Send notifications to customer & employee
            try {
                const notificationRequest: CancelBookingRequest = {
                    customerId: booking?.customer?.id || '',
                    customerName: booking?.customer?.fullName || 'Khách hàng',
                    bookingId: booking?.bookingID || '',
                    roomNumber:
                        booking?.bookingDetails?.[0]?.room?.roomNumber || 'N/A',
                    checkInDate: booking?.checkInDate || '',
                    checkOutDate: booking?.checkOutDate || '',
                    totalAmount: booking?.totalAmount || 0,
                    reason: reason.trim(),
                    userRole: 'CUSTOMER',
                };

                await earlyCheckinNotificationService.sendCancelBookingRequest(
                    notificationRequest,
                );

                await refreshNotifications();

                console.log('Cancel booking notifications sent successfully');
            } catch (notifError) {
                console.error('Failed to send notifications:', notifError);
            }

            // GỬI EMAIL XÁC NHẬN HỦY BOOKING
            try {
                const customerEmail = booking?.customer?.email;

                if (customerEmail) {
                    // Prepare email data object
                    const emailData: CancellationEmailData = {
                        customerName:
                            booking?.customer?.fullName || 'Quý khách',
                        customerEmail: customerEmail,
                        customerPhone: booking?.customer?.phone || undefined,
                        customerAddress:
                            booking?.customer?.address || undefined,
                        bookingId: booking?.bookingID || '',
                        roomNumber:
                            booking?.bookingDetails?.[0]?.room?.roomNumber ||
                            'N/A',
                        checkInDate: new Date(
                            booking?.checkInDate || '',
                        ).toLocaleDateString('vi-VN'),
                        checkOutDate: new Date(
                            booking?.checkOutDate || '',
                        ).toLocaleDateString('vi-VN'),
                        totalAmount:
                            booking?.totalAmount?.toLocaleString('vi-VN') ||
                            '0',
                        reason: reason.trim(),
                        refundAmount:
                            refundAmount > 0 ? refundAmount : undefined,
                        paymentInfo: refundAmount > 0 ? paymentInfo : undefined,
                    };

                    // Generate email template and send
                    const emailPayload =
                        createCancellationEmailTemplate(emailData);
                    await sendEmail(emailPayload);

                    console.log('Cancellation email sent to:', customerEmail);
                } else {
                    console.warn(
                        'No customer email found, skipping email notification',
                    );
                }
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
                // Không fail toàn bộ process nếu email lỗi
            }

            // Thông báo thành công
            toast.success('Booking is cancelled successfully!!!');
            onSuccess();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            // Thông báo lỗi
            if (onError) {
                onError('Có lỗi xảy ra khi hủy booking');
            } else {
                toast.error('Có lỗi xảy ra khi hủy booking');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!booking) return null;

    // Kiểm tra xem có thể hủy booking không
    const canCancelBooking = () => {
        if (booking.status === 'CHECKED_IN')
            return {
                canCancel: false,
                reason: 'Không thể hủy sau khi đã check-in',
            };
        if (booking.status === 'CHECKED_OUT')
            return {
                canCancel: false,
                reason: 'Không thể hủy sau khi đã check-out',
            };
        if (booking.status === 'CANCELLED')
            return { canCancel: false, reason: 'Booking đã được hủy trước đó' };
        return { canCancel: true, reason: '' };
    };

    const calculateRefund = () => {
        const checkInDate = new Date(booking.checkInDate);
        const now = new Date();
        // Làm tròn số ngày để tránh sai số thập phân
        const daysUntilCheckin = Math.ceil(
            (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        console.log('=== DEBUG REFUND CALCULATION ===');
        console.log('Check-in date:', checkInDate);
        console.log('Current date:', now);
        console.log('Days until check-in:', daysUntilCheckin);
        console.log('Payment status:', booking.paymentStatus);
        console.log('Booking status:', booking.status);

        // Kiểm tra điều kiện hoàn tiền - phải match với backend enum
        const paidStatuses = [
            'COMPLETED',
            'PERCENTAGE_30',
            'PERCENTAGE_50',
            'PAID',
            'PARTIAL',
        ];
        const isPaid = paidStatuses.includes(booking.paymentStatus);
        // Chỉ hoàn tiền nếu đã thanh toán (COMPLETED, PERCENTAGE_30, PERCENTAGE_50, PAID) và booking đang PENDING, WAITING hoặc CONFIRMED
        const isRefundableStatus = booking.status === 'PENDING' || booking.status === 'WAITING' || (booking.status as string) === 'CONFIRMED';

        if (isPaid && isRefundableStatus) {
            // Xác định số tiền thực tế đã thanh toán
            let paidAmount = booking.totalAmount;
            if (booking.paymentStatus === 'PERCENTAGE_30') paidAmount = booking.totalAmount * 0.3;
            else if (booking.paymentStatus === 'PERCENTAGE_50') paidAmount = booking.totalAmount * 0.5;
            else if (booking.paymentStatus === 'PARTIAL') paidAmount = booking.totalAmount * 0.5; // Giả định Partial là 50% nếu không có trường paidAmount

            if (daysUntilCheckin >= 7) {
                console.log(
                    '-> 100% refund of paid amount:',
                    paidAmount,
                    ' (>=7 days)',
                );
                return paidAmount; // Hoàn 100% số tiền đã trả
            } else if (daysUntilCheckin >= 3) {
                console.log(
                    '-> 50% refund of paid amount:',
                    paidAmount * 0.5,
                    ' (3-6 days)',
                );
                return paidAmount * 0.5; // Hoàn 50% số tiền đã trả
            } else {
                console.log('-> No refund: <3 days, even though paid');
                return 0; // Không hoàn tiền
            }
        }

        console.log('-> No refund: Not paid or not pending booking');
        console.log(
            '  Payment Status Check:',
            booking.paymentStatus,
            '- In paid list?',
            isPaid,
        );
        console.log(
            '  Booking Status Check:',
            booking.status,
            '- Is refundable status?',
            isRefundableStatus,
        );
        return 0;
    };

    const refundAmount = calculateRefund();
    const refundPercentage =
        booking.totalAmount > 0
            ? (refundAmount / booking.totalAmount) * 100
            : 0;
    const cancelCheck = canCancelBooking();

    // Check if reputation will be affected
    const checkReputationPenalty = () => {
        const checkInDate = new Date(booking.checkInDate);
        const now = new Date();
        const daysUntilCheckin = Math.ceil(
            (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysUntilCheckin < 3;
    };

    const willLoseReputation = checkReputationPenalty();

    // Nếu không thể hủy, hiển thị thông báo
    if (!cancelCheck.canCancel) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 text-center">
                        <div className="mb-4">
                            <i className="fas fa-times-circle text-black text-5xl mb-3"></i>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Không thể hủy booking
                            </h2>
                            <p className="text-gray-600">
                                {cancelCheck.reason}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#b9ad96] text-white rounded-lg hover:bg-[#a89981] transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#b9ad96] to-[#a89981] text-white p-6 rounded-t-3xl">
                    <h2 className="text-2xl text-center font-bold text-white">
                        Cancel Booking
                    </h2>
                </div>

                <div className="p-6">
                    {/* Chính sách hoàn tiền */}
                    <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-[#b9ad96]/10 border-l-4 border-[#b9ad96] rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <i className="fas fa-info-circle text-[#b9ad96] text-lg"></i>
                            <h3 className="font-bold text-gray-800 text-lg">
                                Refund Policy
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white p-4 rounded-lg border border-[#b9ad96]/30 shadow-sm">
                                <div className="text-[#b9ad96] font-semibold mb-2">
                                    <i className="fas fa-calendar-check mr-2"></i>
                                    Cancel 7 days in advance
                                </div>
                                <div className="text-gray-800 font-bold text-xl">
                                    100%
                                </div>
                                <div className="text-gray-600 text-xs">
                                    Refund full amount
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                                <div className="text-gray-600 font-semibold mb-2">
                                    <i className="fas fa-calendar-alt mr-2"></i>
                                    Cancel 3-7 days in advance
                                </div>
                                <div className="text-gray-800 font-bold text-xl">
                                    50%
                                </div>
                                <div className="text-gray-600 text-xs">
                                    Refund half of the amount
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                                <div className="text-black font-semibold mb-2">
                                    <i className="fas fa-calendar-times mr-2"></i>
                                    Cancel less than 3 days in advance
                                </div>
                                <div className="text-gray-800 font-bold text-xl">
                                    0%
                                </div>
                                <div className="text-gray-600 text-xs mb-2">
                                    Refund not available
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-[#b9ad96]/10 rounded-lg border border-[#b9ad96]/20">
                            <p className="text-xs text-gray-700">
                                <i className="fas fa-clock mr-1 text-[#b9ad96]"></i>
                                <strong>Note:</strong> Refunds are only
                                available for bookings that have been PAID and
                                not CHECKED IN.
                            </p>
                        </div>
                    </div>

                    {/* Thông tin booking hiện tại */}
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-xl border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#b9ad96]/20 rounded-full">
                                    <i className="fas fa-receipt text-[#b9ad96]"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        Booking information
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Your booking details
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Reputation Warning */}
                            {willLoseReputation && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <i className="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
                                        <div>
                                            <h4 className="font-semibold text-red-700 mb-1">
                                                Reputation Warning
                                            </h4>
                                            <p className="text-red-600 text-sm mb-2">
                                                You are cancelling{' '}
                                                <strong>
                                                    {Math.ceil(
                                                        (new Date(
                                                            booking.checkInDate,
                                                        ).getTime() -
                                                            new Date().getTime()) /
                                                            (1000 *
                                                                60 *
                                                                60 *
                                                                24),
                                                    )}{' '}
                                                    day(s)
                                                </strong>{' '}
                                                before check-in. This will
                                                reduce your reputation by{' '}
                                                <strong>3 points</strong>.
                                            </p>
                                            <p className="text-red-600 text-xs">
                                                This may affect your future
                                                booking privileges and priority.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="text-gray-500 text-xs font-medium mb-1">
                                        BOOKING ID
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {booking.bookingID}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg">
                                    <div className="text-gray-500 text-xs font-medium mb-1">
                                        CHECK-IN
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        {new Date(
                                            booking.checkInDate,
                                        ).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        {new Date(
                                            booking.checkInDate,
                                        ).toLocaleTimeString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái và số tiền hoàn */}
                            <div className="bg-white p-4 rounded-lg border-l-4 border-[#b9ad96]">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <div className="text-gray-500 text-xs font-medium">
                                            PAYMENT STATUS
                                        </div>
                                        <div className="font-bold text-gray-800">
                                            {booking.paymentStatus ===
                                                'PENDING' && (
                                                <span className="text-gray-600">
                                                    <i className="fas fa-clock mr-1"></i>
                                                    PENDING
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'COMPLETED' && (
                                                <span className="text-[#b9ad96]">
                                                    <i className="fas fa-check-circle mr-1"></i>
                                                    COMPLETED
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'PERCENTAGE_30' && (
                                                <span className="text-[#b9ad96]">
                                                    Paid 30%
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'PERCENTAGE_50' && (
                                                <span className="text-[#b9ad96]">
                                                    Paid 50%
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'PAID' && (
                                                <span className="text-[#b9ad96]">
                                                    <i className="fas fa-check-circle mr-1"></i>
                                                    Paid in full
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'PARTIAL' && (
                                                <span className="text-[#b9ad96]">
                                                    <i className="fas fa-adjust mr-1"></i>
                                                    Partial payment
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'REFUNDED' && (
                                                <span className="text-[#b9ad96]">
                                                    Refunded
                                                </span>
                                            )}
                                            {booking.paymentStatus ===
                                                'CANCELLED' && (
                                                <span className="text-gray-600">
                                                    CANCELLED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-gray-500 text-xs font-medium">
                                            REFUND AMOUNT
                                        </div>
                                        <div className="font-bold text-2xl text-[#b9ad96]">
                                            {refundAmount.toLocaleString()} VNĐ
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            ({refundPercentage.toFixed(0)}%
                                            total amount)
                                        </div>
                                    </div>
                                </div>

                                {/* Thông báo áp dụng chính sách */}
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700">
                                        {booking.paymentStatus ===
                                            'PENDING' && (
                                            <span className="text-gray-600">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                Booking is not paid - No refund
                                            </span>
                                        )}
                                        {[
                                            'COMPLETED',
                                            'PERCENTAGE_30',
                                            'PERCENTAGE_50',
                                            'PAID',
                                            'PARTIAL',
                                        ].includes(booking.paymentStatus) && (
                                            <>
                                                {refundPercentage === 100 && (
                                                    <span className="text-[#b9ad96]">
                                                        <i className="fas fa-check-circle mr-1"></i>
                                                        Cancel 7 days before -
                                                        Apply 100% refund
                                                    </span>
                                                )}
                                                {refundPercentage === 50 && (
                                                    <span className="text-gray-600">
                                                        <i className="fas fa-exclamation-triangle mr-1"></i>
                                                        Cancel 3-7 days before -
                                                        Apply 50% refund
                                                    </span>
                                                )}
                                                {refundPercentage === 0 && (
                                                    <span className="text-black">
                                                        <i className="fas fa-times-circle mr-1"></i>
                                                        Cancel less than 3 days
                                                        - No refund
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Cancellation Reason */}
                        <div className="bg-gradient-to-br from-gray-50 to-[#b9ad96]/10 p-5 rounded-xl border-l-4 border-[#b9ad96] mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fas fa-edit text-[#b9ad96] text-lg"></i>
                                <h4 className="font-bold text-gray-800 text-lg">
                                    Cancellation Reason
                                </h4>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">
                                Please let us know the reason you want to cancel
                                your booking so we can improve our services.
                            </p>
                            <div>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="E.g: Change of travel plans, unexpected events, unable to arrange time..."
                                    rows={4}
                                    className="w-full p-4 border-2 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b9ad96] focus:border-[#b9ad96] resize-none transition-colors"
                                    required
                                />
                                {reason && (
                                    <div className="mt-2 p-2 bg-[#b9ad96]/10 rounded text-sm text-gray-700 border border-[#b9ad96]/20">
                                        <i className="fas fa-check mr-1 text-[#b9ad96]"></i>
                                        Thank you for sharing! ({reason.length}{' '}
                                        characters)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Information for Refund */}
                        {refundAmount > 0 && (
                            <div className="bg-gradient-to-br from-gray-50 to-[#b9ad96]/10 p-5 rounded-xl border-l-4 border-[#b9ad96] mb-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <i className="fas fa-money-bill-wave text-[#b9ad96] text-lg"></i>
                                    <h4 className="font-bold text-gray-800 text-lg">
                                        Payment Information for Refund
                                    </h4>
                                </div>
                                <p className="text-gray-700 text-sm mb-4">
                                    Please provide your account information so
                                    we can process your refund.
                                </p>

                                {/* Payment Method Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        <i className="fas fa-credit-card mr-2 text-[#b9ad96]"></i>
                                        Select Refund Method *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {[
                                            {
                                                value: 'BANK_TRANSFER',
                                                label: 'Ngân hàng',
                                                icon: 'fas fa-university',
                                            },
                                            {
                                                value: 'MOMO',
                                                label: 'MoMo',
                                                icon: 'fas fa-mobile-alt',
                                            },
                                            {
                                                value: 'ZALOPAY',
                                                label: 'ZaloPay',
                                                icon: 'fas fa-wallet',
                                            },
                                            {
                                                value: 'VNPAY',
                                                label: 'VNPay',
                                                icon: 'fas fa-credit-card',
                                            },
                                        ].map((method) => (
                                            <button
                                                key={method.value}
                                                type="button"
                                                onClick={() => {
                                                    setPaymentInfo({
                                                        method: method.value,
                                                        accountNumber: '',
                                                        accountName: '',
                                                        bankName: '',
                                                        mobileNumber: '',
                                                    });
                                                }}
                                                className={`p-3 rounded-lg border-2 transition-all ${
                                                    paymentInfo.method ===
                                                    method.value
                                                        ? 'border-[#b9ad96] bg-[#b9ad96]/10 text-[#b9ad96]'
                                                        : 'border-gray-200 bg-white hover:border-[#b9ad96]/50 hover:bg-[#b9ad96]/5'
                                                }`}
                                            >
                                                <i
                                                    className={`${method.icon} text-lg mb-1 block`}
                                                ></i>
                                                <div className="text-xs font-medium">
                                                    {method.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bank Transfer Fields */}
                                {paymentInfo.method === 'BANK_TRANSFER' && (
                                    <div className="bg-white p-4 rounded-lg border space-y-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i className="fas fa-university text-[#b9ad96]"></i>
                                            <h5 className="font-semibold text-gray-800">
                                                Bank Information
                                            </h5>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <i className="fas fa-building mr-2 text-[#b9ad96]"></i>
                                                Bank Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentInfo.bankName}
                                                onChange={(e) =>
                                                    setPaymentInfo({
                                                        ...paymentInfo,
                                                        bankName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="VD: Vietcombank, Techcombank, BIDV..."
                                                className="w-full text-sm p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b9ad96] focus:border-[#b9ad96] transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <i className="fas fa-credit-card mr-2 text-[#b9ad96]"></i>
                                                Account Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    paymentInfo.accountNumber
                                                }
                                                onChange={(e) =>
                                                    setPaymentInfo({
                                                        ...paymentInfo,
                                                        accountNumber:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Account number for refund"
                                                className="text-sm w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b9ad96] focus:border-[#b9ad96] transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <i className="fas fa-user mr-2 text-[#b9ad96]"></i>
                                                Account Holder Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentInfo.accountName}
                                                onChange={(e) =>
                                                    setPaymentInfo({
                                                        ...paymentInfo,
                                                        accountName:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Name as per bank records"
                                                className="text-sm w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b9ad96] focus:border-[#b9ad96] transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* E-wallet Fields */}
                                {(paymentInfo.method === 'MOMO' ||
                                    paymentInfo.method === 'ZALOPAY' ||
                                    paymentInfo.method === 'VNPAY') && (
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <i
                                                className={`fas ${
                                                    paymentInfo.method ===
                                                    'MOMO'
                                                        ? 'fa-mobile-alt'
                                                        : paymentInfo.method ===
                                                          'ZALOPAY'
                                                        ? 'fa-wallet'
                                                        : 'fa-credit-card'
                                                } text-[#b9ad96]`}
                                            ></i>
                                            <h5 className="font-semibold text-gray-800">
                                                {paymentInfo.method}
                                            </h5>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <i className="fas fa-phone mr-2 text-[#b9ad96]"></i>
                                                Registered Phone Number for{' '}
                                                {paymentInfo.method} *
                                            </label>
                                            <input
                                                type="tel"
                                                value={paymentInfo.mobileNumber}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        ); // Chỉ cho phép số
                                                    setPaymentInfo({
                                                        ...paymentInfo,
                                                        mobileNumber: value,
                                                    });
                                                }}
                                                placeholder={`Phone number for ${paymentInfo.method} (VD: 0987654321)`}
                                                className="text-sm w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b9ad96] focus:border-[#b9ad96] transition-colors"
                                                maxLength={11}
                                                pattern="[0-9]{10,11}"
                                                required
                                            />
                                            {paymentInfo.mobileNumber &&
                                            paymentInfo.mobileNumber.length >=
                                                10 ? (
                                                <div className="mt-2 p-3 bg-[#b9ad96]/10 rounded-lg border border-[#b9ad96]/30">
                                                    <div className="text-sm text-gray-700 flex items-center gap-2">
                                                        <i className="fas fa-check-circle text-[#b9ad96]"></i>
                                                        <span>
                                                            <strong>
                                                                Xác nhận:
                                                            </strong>{' '}
                                                            {paymentInfo.method}{' '}
                                                            -{' '}
                                                            {
                                                                paymentInfo.mobileNumber
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-[#b9ad96] mt-1">
                                                        ✓ Thông tin này sẽ được
                                                        gửi đến server để xử lý
                                                        hoàn tiền
                                                    </div>
                                                </div>
                                            ) : paymentInfo.mobileNumber
                                                  .length > 0 ? (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-sm text-gray-700 flex items-center gap-2">
                                                        <i className="fas fa-exclamation-triangle text-gray-600"></i>
                                                        <span>
                                                            Phone number is too
                                                            short (min 10
                                                            digits)
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Confirmation Checkbox */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border">
                            <div className="flex items-center gap-3 mb-3">
                                <i className="fas fa-shield-check text-[#b9ad96] text-lg"></i>
                                <h4 className="font-bold text-gray-800">
                                    Confirm Cancellation
                                </h4>
                            </div>

                            <div className="bg-white p-4 rounded-lg border-l-4 border-[#b9ad96] mb-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="confirmCancel"
                                        checked={confirmed}
                                        onChange={(e) =>
                                            setConfirmed(e.target.checked)
                                        }
                                        className="mt-1 h-5 w-5 text-[#b9ad96] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#b9ad96]"
                                    />
                                    <label
                                        htmlFor="confirmCancel"
                                        className="text-sm text-gray-700 cursor-pointer select-none"
                                    >
                                        <div className="font-semibold text-gray-800 mb-2">
                                            I confirm that I want to cancel this
                                            booking
                                        </div>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            <li>
                                                ✓ This booking cancellation is
                                                irreversible
                                            </li>
                                            <li>
                                                ✓ I will{' '}
                                                {refundAmount > 0 ? (
                                                    <span className="text-[#b9ad96] font-semibold">
                                                        receive a refund of{' '}
                                                        {refundAmount.toLocaleString()}{' '}
                                                        VNĐ (
                                                        {refundPercentage.toFixed(
                                                            0,
                                                        )}
                                                        %)
                                                    </span>
                                                ) : (
                                                    <span className="text-black font-semibold">
                                                        not receive any refund
                                                    </span>
                                                )}{' '}
                                                according to the policy.
                                            </li>
                                            <li>
                                                ✓ Processing time for refunds:
                                                2-3 hours (e-wallet) or 1-3 days
                                                (bank)
                                            </li>
                                        </ul>
                                    </label>
                                </div>
                            </div>

                            {!confirmed && (
                                <div className="p-3 bg-[#b9ad96]/10 border border-[#b9ad96]/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <i className="fas fa-hand-point-up text-[#b9ad96]"></i>
                                        <span className="text-sm font-medium">
                                            Please tick the confirmation box to
                                            continue
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-[#b9ad96] hover:text-[#b9ad96] transition-all duration-200 font-semibold shadow-sm"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !confirmed}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#b9ad96] to-[#a89981] text-white rounded-xl hover:from-[#a89981] hover:to-[#97876e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>Confirm</>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                <i className="fas fa-shield-alt mr-1 text-[#b9ad96]"></i>
                                Your information is secure and processed safely
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
