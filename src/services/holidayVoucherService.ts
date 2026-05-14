import { holidayVoucherApi } from './apiClient';

export interface HolidayVoucherDTO {
  holidayId: string;
  holidayName: string;
  holidayDate: string; // ISO string format
  voucherId: string;
  isActive: boolean;
}

/**
 * Lưu cấu hình holiday vouchers
 */
export const saveHolidayVouchers = async (
  holidayVouchers: HolidayVoucherDTO[]
) => {
  try {
    const response = await holidayVoucherApi.post(
      "",
      holidayVouchers,
    );
    return response.data;
  } catch (error) {
    console.error("Error saving holiday vouchers:", error);
    throw error;
  }
};

/**
 * Lấy tất cả holiday vouchers đã cấu hình
 */
export const getAllHolidayVouchers = async () => {
  try {
    const response = await holidayVoucherApi.get("");
    return response.data;
  } catch (error) {
    console.error("Error fetching holiday vouchers:", error);
    throw error;
  }
};

/**
 * Lấy holiday vouchers của hôm nay
 */
export const getTodayHolidayVouchers = async () => {
  try {
    const response = await holidayVoucherApi.get("/today");
    return response.data;
  } catch (error) {
    console.error("Error fetching today holiday vouchers:", error);
    throw error;
  }
};

export const updateHolidayVoucherActive = async (active: boolean) => {
  try {
    const response = await holidayVoucherApi.patch(`/active/${active}`);
    return response.data;
  } catch (error) {
    console.error("Error updating holiday voucher active status:", error);
    throw error;
  }
};
