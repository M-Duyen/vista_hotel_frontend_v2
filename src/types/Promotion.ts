import type { PromotionType } from "./PromotionType";
import type { RoomTypePromotion } from "./RoomTypePromotion";

export type DiscountType = "PERCENT" | "FIXED";

export interface Promotion {
  promotionID: string;
  promotionName: string;
  description: string;
  discountType: DiscountType;
  active: boolean;
  promotionType: PromotionType;
  admin?: {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    userRole: string;
    adminLevel: number;
    permissions: string[];
  };
  roomTypePromotion?: RoomTypePromotion[];
}
