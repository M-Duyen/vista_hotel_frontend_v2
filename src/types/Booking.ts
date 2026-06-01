export interface Booking {
    bookingID: string;
    checkInDate: string;
    checkOutDate: string;
    actualCheckInTime: string | null;
    actualCheckOUtTime: string | null;
    numberOfGuests: number;
    status:
        | 'PENDING'
        | 'WAITING'
        | 'CONFIRMED'
        | 'CHECKED_IN'
        | 'CHECKED_OUT'
        | 'CANCELLED';
    specialRequests?: string;
    bookingDate: string;
    cancellationDate?: string;
    hourlyRate?: number | null;
    duration: number;
    packageType: string;
    totalAmount: number;
    paymentStatus:
        | 'PENDING'
        | 'COMPLETED'
        | 'PERCENTAGE_30'
        | 'PERCENTAGE_50'
        | 'PAID'
        | 'REFUNDED'
        | 'CANCELLED'
        | 'PARTIAL'
        | 'FAILED';
    invoiceType?: string | null;
    totalCost: number;
    type: 'HOURLY' | 'DAILY';
    customer: Customer;
    employee?: Employee;
    bookingDetails: BookingDetail[];
    bookingServices?: BookingService[];
    earlyCheckin?: EarlyCheckin | null;
    lateCheckout?: LateCheckout | null;
    cancellation: BookingCancellation | null;
}

export interface BookingService {
    id?: string;
    serviceId?: string;
    servicePrice?: number;
    quantity?: number;
    totalAmount?: number;
    orderStatus?: string;
    paymentMethod?: string;
    roomNumber: string | string[];
}

export interface EarlyCheckin {
    id?: string;
    requestID?: string;
    requestTime: string;
    earlyCheckInTime?: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    additionalFee: number;
    notes?: string;
    requestDate?: string;
}

// ====================== ROOM BOOKING ======================
export interface RoomBooking {
    id: string;
    roomId: string;
    roomNumber: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    status: 'pending' | 'waiting' | 'checked-in' | 'checked-out' | 'cancelled';
    numberOfGuests: number;
    totalAmount: number;
    specialRequests?: string;
    paymentStatus?: string;
    customer?: unknown;
    bookingDetails?: unknown[];
    earlyCheckin?: EarlyCheckin | null;
}
export type RefundMethod =
    | 'BANK_TRANSFER'
    | 'MOMO'
    | 'ZALOPAL'
    | 'VNPAY'
    | string;

export interface BookingCancellation {
    id: string;
    booking: Booking;
    cancelReason: string;
    cancelledAt: string;
    refundAmount: number;
    refundMethod: RefundMethod;
    refundAccountInfo: string;
}

import type { Customer } from './Customer';
import type { Employee } from './Employee';
import type { BookingDetail } from './BookingDetail';
import type { LateCheckout } from './LateCheckout';
