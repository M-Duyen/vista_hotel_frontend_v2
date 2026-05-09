import { api } from "./apiClient";
import type { UserProfile, ProfileUpdateRequest } from "../types/UserProfile";
import type { Customer } from "../types/Customer";
import type { Booking } from "../types/Booking";
import { uploadImageToCloudinary } from "./cloudinaryService";

const CUSTOMER_ENDPOINT = "/customers";
const EMPLOYEE_ENDPOINT = "/employees";
const ADMIN_ENDPOINT = "/admins";

/**
 * Lấy thông tin khách hàng theo ID
 */
export const getCustomerProfile = async (
  customerId: string
): Promise<Customer> => {
  try {
    const response = await api.get(`${CUSTOMER_ENDPOINT}/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin khách hàng
 */
export const updateCustomerProfile = async (
  customerId: string,
  data: ProfileUpdateRequest
): Promise<Customer> => {
  try {
    const response = await api.put(`${CUSTOMER_ENDPOINT}/${customerId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating customer profile:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin Employee
 */
export const updateEmployeeProfile = async (
  employeeId: string,
  data: ProfileUpdateRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    const response = await api.put(`${EMPLOYEE_ENDPOINT}/${employeeId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee profile:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin Admin
 */
export const updateAdminProfile = async (
  adminId: string,
  data: ProfileUpdateRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    const response = await api.put(`${ADMIN_ENDPOINT}/${adminId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating admin profile:", error);
    throw error;
  }
};

/**
 * Cập nhật avatar cho user (Customer, Employee, Admin)
 */
export const updateUserAvatar = async (
  userId: string,
  userRole: string,
  file: File
): Promise<string> => {
  try {
    // Upload ảnh lên Cloudinary
    const uploadResult = await uploadImageToCloudinary(file);
    const avatarUrl = uploadResult.secure_url;

    // Cập nhật avatarUrl vào database
    let endpoint = "";
    if (userRole === "CUSTOMER") {
      endpoint = `${CUSTOMER_ENDPOINT}/${userId}/avatar`;
    } else if (userRole === "EMPLOYEE") {
      endpoint = `${EMPLOYEE_ENDPOINT}/${userId}/avatar`;
    } else if (userRole === "ADMIN") {
      endpoint = `${ADMIN_ENDPOINT}/${userId}/avatar`;
    }

    await api.put(endpoint, { avatarUrl });
    return avatarUrl;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
};

/**
 * Cập nhật profile chung cho tất cả user role
 */
export const updateUserProfile = async (
  userId: string,
  userRole: string,
  data: ProfileUpdateRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    let response;
    if (userRole === "CUSTOMER") {
      response = await updateCustomerProfile(userId, data);
    } else if (userRole === "EMPLOYEE") {
      response = await updateEmployeeProfile(userId, data);
    } else if (userRole === "ADMIN") {
      response = await updateAdminProfile(userId, data);
    } else {
      throw new Error("Invalid user role");
    }
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Lấy danh sách đặt phòng của khách hàng
 */
export const getCustomerBookings = async (
  customerId: string
): Promise<Booking[]> => {
  try {
    const response = await api.get(`/bookings/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    throw error;
  }
};

/**
 * Lấy người dùng từ localStorage
 */
export const getCurrentUserFromStorage = (): UserProfile | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

/**
 * Cập nhật người dùng trong localStorage
 */
export const updateUserInStorage = (user: UserProfile): void => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
    
    // Dispatch custom event to notify other components about user data update
    window.dispatchEvent(new Event("userDataUpdated"));
  } catch (error) {
    console.error("Error updating user in localStorage:", error);
  }
};

const userProfileService = {
  getCustomerProfile,
  updateCustomerProfile,
  updateEmployeeProfile,
  updateAdminProfile,
  updateUserAvatar,
  updateUserProfile,
  getCustomerBookings,
  getCurrentUserFromStorage,
  updateUserInStorage,
};

export default userProfileService;
