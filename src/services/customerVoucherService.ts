import { api } from "./apiClient";

const ENDPOINT = "/customer-vouchers";

export const getAllVoucher = async () => {
  try {
    const response = await api.get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer voucher:", error);
    throw error;
  }
};

export const getByCustomerId = async (id: string) => {
  try {
    const response = await api.get(`${ENDPOINT}/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer voucher ${id}:`, error);
    throw error;
  }
};

export const getByCustomerIdAndStateTrue = async (id: string) => {
  try {
    const response = await api.get(`${ENDPOINT}/customer-available/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer voucher ${id}:`, error);
    throw error;
  }
};

export const saveCustomerVoucher = async (customerVoucher: object) => {
  try {
    const response = await api.post(`${ENDPOINT}/save`, customerVoucher);
    return response.data;
  } catch (error) {
    console.error("Error creating customer voucher:", error);
    throw error;
  }
};
