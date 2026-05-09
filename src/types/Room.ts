export type RoomStatus = 'AVAILABLE' | 'BOOKED' | 'CLEANING' | 'MAINTENANCE';

import type { RoomType } from './RoomType';

export interface Room {
    roomNumber?: string;
    floor?: number | null;
    status: RoomStatus;
    lastCleaned?: string | null;
    notes?: string | null;
    roomType?: RoomType | null;
    images?: string[];
    [key: string]: unknown;
}
