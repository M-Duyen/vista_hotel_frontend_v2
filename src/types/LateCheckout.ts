import type { Booking } from './Booking';

export interface LateCheckout {
    requestID: string;
    requestTime: string;
    requestDate: string;
    additionalFee: number;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    bookingId: string;

    customerName: string;
    customerEmail: string;

    roomNumber: string;
    roomType: string;
    roomPrice: number;

    checkInDate: string;
    checkOutDate: string;

    employee?: string | {
        id: string;
        fullName?: string;
    };
}

export interface LateCheckoutResponse {
    requestID: string;
    requestTime: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    additionalFee: number;
    requestDate: string;
    booking: Booking | null;
    employee?: string;
}
