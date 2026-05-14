import { customerVoucherApi } from "./apiClient";
import type {
  CustomerVoucher,
  CustomerVoucherRequest,
} from "../types/CustomerVoucher";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCustomerVoucher = (data: any): CustomerVoucher => {
  const voucherId = data?.voucher?.voucherId ?? data?.voucher?.voucherID ?? "";
  const isActive =
    data?.voucher?.isActive !== undefined
      ? Boolean(data.voucher.isActive)
      : data?.voucher?.active !== undefined
        ? Boolean(data.voucher.active)
        : true;

  return {
    id: data?.id,
    customer: data?.customer,
    state: Boolean(data?.state),
    voucher: {
      voucherId,
      voucherName: data?.voucher?.voucherName ?? "",
      discountPercentage: Number(data?.voucher?.discountPercentage ?? 0),
      discountValue: Number(data?.voucher?.discountValue ?? 0),
      startDate: data?.voucher?.startDate,
      endDate: data?.voucher?.endDate,
      discountType: data?.voucher?.discountType ?? "PERCENT",
      isActive,
      active: isActive,
    },
  };
};

export const getAllVoucher = async (): Promise<CustomerVoucher[]> => {
  try {
    const response = await customerVoucherApi.get("");
    return response.data.map(mapCustomerVoucher);
  } catch (error) {
    console.error("Error fetching customer voucher:", error);
    throw error;
  }
};

export const getByCustomerId = async (
  id: string,
): Promise<CustomerVoucher[]> => {
  try {
    const response = await customerVoucherApi.get(`/customer/${id}`);
    return response.data.map(mapCustomerVoucher);
  } catch (error) {
    console.error(`Error fetching customer voucher ${id}:`, error);
    throw error;
  }
};

export const getByCustomerIdAndStateTrue = async (
  id: string,
): Promise<CustomerVoucher[]> => {
  try {
    const response = await customerVoucherApi.get(`/customer-available/${id}`);
    return response.data.map(mapCustomerVoucher);
  } catch (error) {
    console.error(`Error fetching customer voucher ${id}:`, error);
    throw error;
  }
};

export const saveCustomerVoucher = async (
  customerVoucher: CustomerVoucherRequest | CustomerVoucher,
): Promise<boolean> => {
  try {
    const request =
      "voucherId" in customerVoucher
        ? customerVoucher
        : {
            customerId:
              customerVoucher.id?.customerId ?? customerVoucher.customer?.id,
            voucherId:
              customerVoucher.id?.voucherId ??
              customerVoucher.voucher.voucherId,
            state: customerVoucher.state,
          };

    const response = await customerVoucherApi.post("/save", request);
    return response.data;
  } catch (error) {
    console.error("Error creating customer voucher:", error);
    throw error;
  }
};

