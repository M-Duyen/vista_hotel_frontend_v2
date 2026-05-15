export interface CheckInCheckOutPolicy {
    id?: number;
    standardCheckInTime: string; // "HH:mm"
    standardCheckOutTime: string; // "HH:mm"
    description?: string;
}
