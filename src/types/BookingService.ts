import type { Booking } from './Booking';
import type { Room } from './Room';
import type { Service } from './Service';

export type OrderStatus =
    | 'PLACE'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELLED';
export type PaymentMethod =
    | 'VNPAY_QR'
    | 'CREDIT_CARD'
    | 'BANK_TRANSFER'
    | 'CASH';

export interface BookingService {
    id?: number;
    service?: Service;
    booking?: Booking;
    room?: Room;
    servicePrice: number;
    quantity: number;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentMethod?: string;
}
