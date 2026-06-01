export type { Service } from "../types/Service";
import { api } from "./apiClient";

const ENDPOINT = "/api/services";

export const getAll = async () => {
  try {
    const response = await api.get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service by ID ${id}:`, error);
    throw error;
  }
};

// Lấy dịch vụ theo trạng thái khả dụng
export const getServicesByAvailability = async (
  availability: boolean
): Promise<Service[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/availability`, {
      params: { availability },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services by availability:", error);
    throw error;
  }
};

// Tìm kiếm dịch vụ theo tên
export const searchServicesByName = async (
  serviceName: string
): Promise<Service[]> => {
  return searchServices({ q: serviceName });
};

// Tìm kiếm dịch vụ theo nhiều điều kiện
export const searchServices = async (params: {
  q?: string;
  serviceCategory?: string;
  availability?: boolean;
}): Promise<Service[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/search`, { params });
    return response.data;
  } catch (error) {
    console.error("Error searching services:", error);
    throw error;
  }
};

// Lấy dịch vụ theo danh mục
export const getServicesByCategory = async (
  serviceCategory: string
): Promise<Service[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/category`, {
      params: { serviceCategory },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services by category:", error);
    throw error;
  }
};

// Thêm mới dịch vụ
export const createService = async (service: Partial<Service>): Promise<Service> => {
  try {
    const response = await api.post(ENDPOINT, service);
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

// Cập nhật dịch vụ
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  try {
    const response = await api.put(`${ENDPOINT}/${id}`, service);
    return response.data;
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
};

// Xóa dịch vụ
export const deleteService = async (serviceID: string): Promise<void> => {
  try {
    await api.delete(`${ENDPOINT}/${serviceID}`);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};
