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

    employee?: {
        id: string;
        fullName?: string;
    };
}
