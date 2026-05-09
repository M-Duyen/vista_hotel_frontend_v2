import type { Booking } from './Booking';

/** Request gửi để yêu cầu check-in sớm */
export interface EarlyCheckinRequest {
    bookingId: string;
    requestTime: string;
    roomPrice: number;
}

/** Model Early Check-in đúng với server trả về */
export interface EarlyCheckin {
    requestID: string;
    requestTime: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    additionalFee: number;
    requestDate: string;
    employee?: {
        id: string;
        fullName?: string;
    };
}

/** Response server trả về khi lấy danh sách yêu cầu */
export interface EarlyCheckinResponse extends EarlyCheckin {
    booking: Booking;
}
