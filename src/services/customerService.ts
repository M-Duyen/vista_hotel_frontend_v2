/* eslint-disable */
import { customerApi } from "./apiClient";
import type { Customer } from "../types/Customer";

export const getAll = async () => {
  try {
    const response = await customerApi.get("");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

export const getById = async (id: string | number) => {
  try {
    const response = await customerApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    throw error;
  }
};

export const saveCustomer = async (
  customer: Customer | Omit<Customer, "id">
) => {
  try {
    console.log("CustomerService - Sending customer data:", customer);
    console.log("CustomerService - Customer ID:", (customer as any).id);
    console.log("CustomerService - Customer Email:", customer.email);

    const response = await customerApi.post("/save", customer);

    console.log("CustomerService - Response status:", response.status);
    console.log("CustomerService - Response data:", response.data);

    if (response.data && Object.keys(response.data).length > 0) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("CustomerService - Error saving customer:", error);

    // có phản hồi từ server
    if (error && typeof error === "object" && "response" in error) {
      const err = error as any;
      console.error("CustomerService - Response status:", err.response?.status);
      console.error("CustomerService - Response data:", err.response?.data);
      console.error("CustomerService - Full response:", err.response);

      // Backend trả về string trực tiếp trong response.data
      const errorMessage =
        err.response?.data ||
        `Lỗi ${err.response?.status}: Không thể lưu khách hàng`;

      console.error("CustomerService - Throwing error:", errorMessage);
      throw new Error(errorMessage);
    }

    // không có phản hồi
    throw new Error("Không thể kết nối đến server");
  }
};

export const searchByName = async (name: string) => {
  try {
    const response = await customerApi.get("/search", {
      params: { name },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

export const findByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    const response = await customerApi.get(
      `/by-phone/${encodeURIComponent(phone)}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const findByEmail = async (email: string): Promise<Customer | null> => {
  try {
    const response = await customerApi.get(
      `/by-email/${encodeURIComponent(email)}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
