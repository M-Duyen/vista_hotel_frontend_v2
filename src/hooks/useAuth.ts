import { useAuthStore } from "@/stores/authStore";
import {
  hasPermission,
  hasRole,
  isAdmin,
  isEmployee,
  isCustomer,
  getUserDisplayName,
  getRoleLabel,
  getEmployeeStatusLabel,
  getPrimaryRole,
} from "@/utils/permissions";
import type { PermissionCode, RoleCode } from "@/types/auth";

/**
 * Custom hook for accessing authentication and authorization
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const error = useAuthStore((state) => state.error);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};

/**
 * Custom hook for permission checks
 */
export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const can = (permission: PermissionCode | PermissionCode[]) => {
    return hasPermission(user, permission);
  };

  const hasRole_ = (role: RoleCode | RoleCode[]) => {
    return hasRole(user, role);
  };

  const isAdminUser = () => isAdmin(user);
  const isEmployeeUser = () => isEmployee(user);
  const isCustomerUser = () => isCustomer(user);

  const getPrimaryRole_ = () => getPrimaryRole(user);

  return {
    can,
    hasRole: hasRole_,
    isAdmin: isAdminUser,
    isEmployee: isEmployeeUser,
    isCustomer: isCustomerUser,
    getPrimaryRole: getPrimaryRole_,
  };
};

/**
 * Custom hook for user display information
 */
export const useUserDisplay = () => {
  const user = useAuthStore((state) => state.user);

  const displayName = user ? getUserDisplayName(user) : "";
  const roleLabel = user ? getRoleLabel(getPrimaryRole(user)) : "";
  const statusLabel = user?.employeeStatus
    ? getEmployeeStatusLabel(user.employeeStatus)
    : "";

  const userInfo = {
    displayName,
    roleLabel,
    statusLabel,
    department: user?.department || "",
    position: user?.position || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
  };

  return userInfo;
};

/**
 * Example usage in components:
 *
 * // In a component
 * const { user, isAuthenticated } = useAuth();
 * const { can, hasRole, isAdmin } = usePermission();
 * const userInfo = useUserDisplay();
 *
 * // Check permission
 * if (can('BOOKING_CREATE')) {
 *   // Show create booking button
 * }
 *
 * // Check role
 * if (hasRole('ADMIN')) {
 *   // Show admin panel
 * }
 *
 * // Check multiple permissions (any)
 * if (can(['BOOKING_VIEW', 'BOOKING_CREATE'])) {
 *   // User has at least one of these permissions
 * }
 */
