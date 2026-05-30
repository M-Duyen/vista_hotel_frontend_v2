import { api } from "./apiClient";

export interface RoomPriceCalculationRequest {
  roomTypeId: string;
  basePrice: number;
  bookingDate: string;
}

export interface RoomPriceCalculation {
  roomTypeId: string;
  basePrice: number;
  seasonalPriceId?: number | null;
  seasonalMultiplier?: number | null;
  seasonalPrice?: number | null;
  appliedPromotionIds?: string[];
  totalDiscountAmount?: number | null;
  finalPrice: number;
  breakdown?: string[];
}

export interface HourlyRateCalculationRequest {
  roomTypeId: string;
  basePrice: number;
  hours: number;
  checkInDateTime: string;
  policyId?: number;
}

export interface HourlyRateCalculationResponse {
  roomTypeId: string;
  basePrice: number;
  hours: number;
  basePercentage: number;
  weekend?: boolean;
  isWeekend?: boolean;
  weekendSurcharge: number;
  totalPercentage: number;
  totalAmount: number;
  breakdown?: string[];
}

export const calculateRoomPrice = async (
  request: RoomPriceCalculationRequest,
): Promise<RoomPriceCalculation> => {
  const response = await api.post(
    "/api/principle/pricing/calculate-room-price",
    request,
  );
  return response.data;
};

export const calculateHourlyRoomRate = async (
  request: HourlyRateCalculationRequest,
): Promise<HourlyRateCalculationResponse> => {
  const response = await api.post(
    "/api/principle/pricing/calculate-hourly-rate",
    request,
  );
  return response.data;
};
