import type { Promotion } from './Promotion';
import type { RoomType } from './RoomType';

export interface RoomTypePromotion {
    roomType: RoomType;
    promotion: Promotion;
    discountValue: number;
    startDate: string;
    endDate: string;
}