import { api } from './apiClient';
import type { Voucher } from '../types/Voucher';

const ENDPOINT = '/vouchers';

/**
 * Ánh xạ phản hồi từ backend sang loại Voucher từ frontend
 * Backend có thể sử dụng 'active' thay vì 'isActive'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendVoucher = (data: any): Voucher => {
    return {
        ...data,
        // Handle both 'active' and 'isActive' from backend
        isActive:
            data.isActive !== undefined
                ? data.isActive
                : data.active !== undefined
                ? data.active
                : true,
    };
};

/**
 * Ánh xạ Voucher từ frontend sang định dạng backend
 * Backend có thể yêu cầu 'active' thay vì 'isActive'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFrontendVoucher = (voucher: Partial<Voucher>): any => {
    const { isActive, ...rest } = voucher;
    return {
        ...rest,
        active: isActive,
        isActive: isActive,
    };
};

/**
 * Lấy tất cả voucher
 */
export const getAllVouchers = async (): Promise<Voucher[]> => {
    try {
        const response = await api.get(ENDPOINT);
        const mappedData = response.data.map(mapBackendVoucher);
        return mappedData;
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        throw error;
    }
};

// Alias for consistency
export const getVouchers = getAllVouchers;

/**
 * Lấy voucher theo ID
 */
export const getVoucherById = async (id: string): Promise<Voucher> => {
    try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        const mappedData = mapBackendVoucher(response.data);
        return mappedData;
    } catch (error) {
        console.error('Error fetching voucher by ID:', error);
        throw error;
    }
};

/**
 * Tạo voucher
 */
export const saveVoucher = async (
    voucherData: Partial<Voucher>,
): Promise<Voucher> => {
    try {
        // Format dates to yyyy-MM-dd and map to backend format
        const backendData = mapFrontendVoucher({
            ...voucherData,
            startDate:
                voucherData.startDate instanceof Date
                    ? (voucherData.startDate
                          .toISOString()
                          .split('T')[0] as unknown as Date)
                    : voucherData.startDate,
            endDate:
                voucherData.endDate instanceof Date
                    ? (voucherData.endDate
                          .toISOString()
                          .split('T')[0] as unknown as Date)
                    : voucherData.endDate,
        });

        const response = await api.post(`${ENDPOINT}/create`, backendData);
        return mapBackendVoucher(response.data);
    } catch (error) {
        console.error('Error saving voucher:', error);
        throw error;
    }
};

/**
 * Cập nhật voucher
 */
export const updateVoucher = async (
    id: string,
    voucherData: Partial<Voucher>,
): Promise<Voucher> => {
    try {
        // Format dates to yyyy-MM-dd and map to backend format
        const backendData = mapFrontendVoucher({
            ...voucherData,
            startDate:
                voucherData.startDate instanceof Date
                    ? (voucherData.startDate
                          .toISOString()
                          .split('T')[0] as unknown as Date)
                    : voucherData.startDate,
            endDate:
                voucherData.endDate instanceof Date
                    ? (voucherData.endDate
                          .toISOString()
                          .split('T')[0] as unknown as Date)
                    : voucherData.endDate,
            isActive: voucherData.isActive ?? true, // Đảm bảo isActive luôn được gửi
        });

        const response = await api.put(`${ENDPOINT}/${id}`, backendData);
        return mapBackendVoucher(response.data);
    } catch (error) {
        console.error('Error updating voucher:', error);
        throw error;
    }
};

/**
 * Lấy vouchers theo customer ID
 */
export const getVouchersByCustomerId = async (
    customerId: string,
): Promise<Voucher[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/customerID=${customerId}`);
        return response.data.map(mapBackendVoucher);
    } catch (error) {
        console.error('Error fetching vouchers by customer ID:', error);
        throw error;
    }
};

/**
 * Chuyển đổi trạng thái hoạt động của phiếu giảm giá
 */
export const toggleVoucherStatus = async (
    id: string,
    isActive: boolean,
): Promise<void> => {
    try {
        await api.patch(`${ENDPOINT}/${id}/status/${isActive}`);
    } catch (error) {
        console.error('Error toggling voucher status:', error);
        throw error;
    }
};

/**
 * Delete voucher
 */
export const deleteVoucher = async (id: string): Promise<void> => {
    try {
        await api.delete(`${ENDPOINT}/delete/${id}`);
    } catch (error) {
        console.error('Error deleting voucher:', error);
        throw error;
    }
};

/**
 * Phân phối phiếu giảm giá cho khách hàng dựa trên tiêu chí
 */
export const distributeVoucher = async (
    voucherId: string,
    criteria: Record<string, unknown>,
): Promise<{ count: number; message: string; success: boolean }> => {
    try {
        const response = await api.post(
            `${ENDPOINT}/${voucherId}/distribute`,
            criteria,
        );
        return response.data;
    } catch (error) {
        console.error('Error distributing voucher:', error);
        throw error;
    }
};

/**
 * Xem trước những khách hàng sẽ nhận được phiếu giảm giá (mà không cần phân phối thực tế)
 */
export const previewDistribution = async (
    criteria: Record<string, unknown>,
): Promise<{ count: number; message?: string; success?: boolean }> => {
    try {
        const response = await api.post(
            `${ENDPOINT}/preview-distribution`,
            criteria,
        );
        return response.data;
    } catch (error) {
        console.error('Error previewing distribution:', error);
        throw error;
    }
};

/**
 * Lấy lịch sử phân phối voucher
 */
export const getDistributionHistory = async (): Promise<any[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/distribution-history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching distribution history:", error);
    throw error;
  }
};

const voucherService = {
  getAllVouchers,
  getVoucherById,
  saveVoucher,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
  distributeVoucher,
  previewDistribution,
  getDistributionHistory,
};

export default voucherService;
