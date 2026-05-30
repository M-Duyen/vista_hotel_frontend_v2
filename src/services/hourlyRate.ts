import type { HourlyRateCalculation } from "../types/HourlyRate";
import { api, roomTypesApi } from "./apiClient";
import { calculateHourlyRoomRate } from "./pricingService";

const ENDPOINT = "/api/principle/hourly-rate-policies";

export interface HourlyRateRequest {
  roomTypeId: string;
  hours: number;
  checkInDateTime: string; // ISO string
}

/**
 * Calculate hourly rate from backend
 */
export const calculateHourlyRate = async (
  request: HourlyRateRequest
): Promise<HourlyRateCalculation> => {
  try {
    const roomType = await roomTypesApi.get(`/${request.roomTypeId}`);
    const response = await calculateHourlyRoomRate({
      roomTypeId: request.roomTypeId,
      basePrice: Number(roomType.data?.basePrice || 0),
      hours: request.hours,
      checkInDateTime: request.checkInDateTime,
    });
    return {
      ...response,
      isWeekend: response.weekend ?? response.isWeekend ?? false,
    } as HourlyRateCalculation;
  } catch (error) {
    console.error("Error calculating hourly rate:", error);
    throw error;
  }
};

/**
 * Calculate hourly rate with custom base price
 */
export const calculateCustomHourlyRate = async (
  basePrice: number,
  hours: number,
  checkInDateTime: string
): Promise<HourlyRateCalculation> => {
  try {
    const response = await calculateHourlyRoomRate({
      roomTypeId: "CUSTOM",
      basePrice,
      hours,
      checkInDateTime,
    });
    return {
      ...response,
      isWeekend: response.weekend ?? response.isWeekend ?? false,
    } as HourlyRateCalculation;
  } catch (error) {
    console.error("Error calculating custom hourly rate:", error);
    throw error;
  }
};

/**
 * Get hourly rate table
 */
export const getHourlyRateTable = async (): Promise<{
  hourlyRateTable: Record<number, number>;
  weekendSurcharge: number;
}> => {
  try {
    const response = await api.get(`${ENDPOINT}/rate-table`);
    return response.data;
  } catch (error) {
    console.error("Error fetching hourly rate table:", error);
    throw error;
  }
};

/**
 * Check if date is weekend
 */
export const checkWeekend = async (dateTime: string): Promise<boolean> => {
  try {
    const response = await api.get(`${ENDPOINT}/check-weekend`, {
      params: { dateTime },
    });
    return response.data.isWeekend;
  } catch (error) {
    console.error("Error checking weekend:", error);
    throw error;
  }
};

export default {
  calculateHourlyRate,
  calculateCustomHourlyRate,
  getHourlyRateTable,
  checkWeekend,
};
