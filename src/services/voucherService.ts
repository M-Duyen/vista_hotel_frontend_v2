import { voucherApi } from "./apiClient";
import type { Voucher } from "../types/Voucher";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendVoucher = (data: any): Voucher => {
  const voucherId = data?.voucherId ?? "";
  const isActive =
    data?.isActive !== undefined
      ? Boolean(data.isActive)
      : data?.active !== undefined
        ? Boolean(data.active)
        : true;

  return {
    voucherId,
    voucherName: data?.voucherName ?? "",
    discountPercentage: Number(data?.discountPercentage ?? 0),
    discountValue: Number(data?.discountValue ?? 0),
    startDate: data?.startDate,
    endDate: data?.endDate,
    discountType: data?.discountType ?? "PERCENT",
    isActive,
    active: isActive,
  };
};

const toDateOnly = (date?: Date | string): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return String(date).split("T")[0];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFrontendVoucher = (voucher: Partial<Voucher>): any => {
  const voucherId = voucher.voucherId;
  const isActive = voucher.isActive ?? voucher.active ?? true;

  return {
    voucherId,
    voucherName: voucher.voucherName,
    discountPercentage: voucher.discountPercentage ?? 0,
    discountValue: voucher.discountValue ?? 0,
    startDate: toDateOnly(voucher.startDate),
    endDate: toDateOnly(voucher.endDate),
    discountType: voucher.discountType,
    active: isActive,
  };
};

export const getAllVouchers = async (): Promise<Voucher[]> => {
  try {
    const response = await voucherApi.get("");
    return response.data.map(mapBackendVoucher);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    throw error;
  }
};

export const getVouchers = getAllVouchers;

export const getVoucherById = async (id: string): Promise<Voucher> => {
  try {
    const response = await voucherApi.get(`/${id}`);
    return mapBackendVoucher(response.data);
  } catch (error) {
    console.error("Error fetching voucher by ID:", error);
    throw error;
  }
};

export const saveVoucher = async (
  voucherData: Partial<Voucher>,
): Promise<Voucher> => {
  try {
    const backendData = mapFrontendVoucher(voucherData);
    const response = await voucherApi.post("/create", backendData);

    if (response.data && typeof response.data === "object") {
      return mapBackendVoucher(response.data);
    }

    return getVoucherById(backendData.voucherId);
  } catch (error) {
    console.error("Error saving voucher:", error);
    throw error;
  }
};

export const updateVoucher = async (
  id: string,
  voucherData: Partial<Voucher>,
): Promise<Voucher> => {
  try {
    const backendData = mapFrontendVoucher({
      ...voucherData,
      voucherId: id,
      isActive: voucherData.isActive ?? voucherData.active ?? true,
    });
    const response = await voucherApi.put(`/${id}`, backendData);

    if (response.data && typeof response.data === "object") {
      return mapBackendVoucher(response.data);
    }

    return getVoucherById(id);
  } catch (error) {
    console.error("Error updating voucher:", error);
    throw error;
  }
};

export const getVouchersByCustomerId = async (
  customerId: string,
): Promise<Voucher[]> => {
  try {
    const response = await voucherApi.get(`/customerID=${customerId}`);
    return response.data.map(mapBackendVoucher);
  } catch (error) {
    console.error("Error fetching vouchers by customer ID:", error);
    throw error;
  }
};

export const toggleVoucherStatus = async (
  id: string,
  isActive: boolean,
): Promise<void> => {
  try {
    await voucherApi.patch(`/${id}/status/${isActive}`);
  } catch (error) {
    console.error("Error toggling voucher status:", error);
    throw error;
  }
};

export const deleteVoucher = async (id: string): Promise<void> => {
  try {
    await voucherApi.delete(`/${id}`);
  } catch (error) {
    console.error("Error deleting voucher:", error);
    throw error;
  }
};

export const distributeVoucher = async (
  voucherId: string,
  criteria: object,
): Promise<{ count: number; message: string; success: boolean }> => {
  try {
    const response = await voucherApi.post(
      `/${voucherId}/distribute`,
      criteria,
      {
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error distributing voucher:", error);
    throw error;
  }
};

export const previewDistribution = async (
  criteria: object,
): Promise<{ count: number; message?: string; success?: boolean }> => {
  try {
    const response = await voucherApi.post("/preview-distribution", criteria);
    return response.data;
  } catch (error) {
    console.error("Error previewing distribution:", error);
    throw error;
  }
};

export const getDistributionHistory = async (): Promise<any[]> => {
  try {
    const response = await voucherApi.get("/distribution-history");
    return response.data;
  } catch (error) {
    console.error("Error fetching distribution history:", error);
    throw error;
  }
};

const voucherService = {
  getAllVouchers,
  getVouchers,
  getVoucherById,
  saveVoucher,
  updateVoucher,
  getVouchersByCustomerId,
  toggleVoucherStatus,
  deleteVoucher,
  distributeVoucher,
  previewDistribution,
  getDistributionHistory,
};

export default voucherService;
