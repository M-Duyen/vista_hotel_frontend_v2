import type { Service } from "../types/Service";
import { serviceApi } from "./apiClient";

export const getAll = async () => {
  try {
    const response = await serviceApi.get("");
    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await serviceApi.get(`${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service by ID ${id}:`, error);
    throw error;
  }
};

// Lấy dịch vụ theo trạng thái khả dụng
export const getServicesByAvailability = async (
  availability: boolean,
): Promise<Service[]> => {
  try {
    const response = await serviceApi.get("/availability", {
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
  serviceName: string,
): Promise<Service[]> => {
  try {
    const response = await serviceApi.get("/name", {
      params: { serviceName },
    });
    return response.data;
  } catch (error) {
    console.error("Error searching services by name:", error);
    throw error;
  }
};

// Lấy dịch vụ theo danh mục
export const getServicesByCategory = async (
  serviceCategory: string,
): Promise<Service[]> => {
  try {
    const response = await serviceApi.get("/category", {
      params: { serviceCategory },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching services by category:", error);
    throw error;
  }
};

// Lưu (thêm mới hoặc cập nhật) dịch vụ
export const saveService = async (service: Service): Promise<Service> => {
  try {
    const response = await serviceApi.post("", service);
    return response.data;
  } catch (error) {
    console.error("Error saving service:", error);
    throw error;
  }
};

// Xóa dịch vụ
export const deleteService = async (serviceID: string): Promise<void> => {
  try {
    await serviceApi.delete(`${ENDPOINT}/${serviceID}`);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};
