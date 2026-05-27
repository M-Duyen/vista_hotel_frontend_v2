import { authApi, usersApi } from "./apiClient";
import type { RoleCode } from "../types/auth";

interface UsersResponse {
  total?: number;
  data?: unknown;
}

/**
 * Lấy danh sách tất cả User (nhân viên/admin) — không bao gồm Customer.
 * Backend UserService.getAllUsers() chỉ query bảng `users` (không phải `customers`).
 */
export const getAllUsers = async () => {
  const response = await usersApi.get<UsersResponse>("");
  const payload = response.data?.data ?? response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && Array.isArray((payload as UsersResponse).data)) {
    return (payload as UsersResponse).data as unknown[];
  }

  return [];
};

/**
 * Lấy permissions hiện tại của user (thông qua service-auth → service-user).
 * Trả về mảng permission code strings, vd: ["booking_view", "room_manage"]
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const response = await authApi.get(`/permissions/${userId}`);
  return response.data?.permissions ?? [];
};

/**
 * Lấy roles hiện tại của user (thông qua service-auth → service-user).
 * Trả về mảng role code strings, vd: ["ADMIN"], ["EMPLOYEE"]
 */
export const getUserRoles = async (userId: string): Promise<string[]> => {
  const response = await authApi.get(`/roles/${userId}`);
  return response.data?.roles ?? [];
};

/**
 * Thay thế role của user (xóa role cũ, gán role mới).
 * Dùng PUT /api/users/{userId}/replace-role — đảm bảo user luôn có đúng 1 role.
 */
export const replaceUserRole = async (userId: string, roleCode: RoleCode) => {
  const response = await usersApi.put(`/${userId}/replace-role`, null, {
    params: { roleCode },
  });
  return response.data;
};

/**
 * @deprecated Dùng replaceUserRole thay thế để đảm bảo user chỉ có 1 role.
 * Giữ lại để tương thích ngược nếu cần.
 */
export const assignRoleToUser = async (userId: string, roleCode: RoleCode) => {
  return replaceUserRole(userId, roleCode);
};
