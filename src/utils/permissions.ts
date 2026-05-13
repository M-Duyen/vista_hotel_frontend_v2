import type {
  User,
  PermissionCode,
  RoleCode,
  EmployeeStatus,
} from "@/types/auth";

/**
 * Utility functions for checking permissions and roles
 */

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: PermissionCode | PermissionCode[],
): boolean => {
  if (!user) return false;

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => user.permissions?.includes(p));
};

/**
 * Check if user has ALL specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: PermissionCode[],
): boolean => {
  if (!user) return false;
  return permissions.every((p) => user.permissions?.includes(p));
};

/**
 * Check if user has ANY of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: PermissionCode[],
): boolean => {
  if (!user) return false;
  return permissions.some((p) => user.permissions?.includes(p));
};

/**
 * Check if user has a specific role
 */
export const hasRole = (
  user: User | null,
  role: RoleCode | RoleCode[],
): boolean => {
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => user.roles?.includes(r));
};

/**
 * Check if user has ALL specified roles
 */
export const hasAllRoles = (user: User | null, roles: RoleCode[]): boolean => {
  if (!user) return false;
  return roles.every((r) => user.roles?.includes(r));
};

/**
 * Check if user has ANY of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: RoleCode[]): boolean => {
  if (!user) return false;
  return roles.some((r) => user.roles?.includes(r));
};

/**
 * Check if user is admin or super admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasAnyRole(user, ["SUPER_ADMIN", "ADMIN"]);
};

/**
 * Check if user is employee
 */
export const isEmployee = (user: User | null): boolean => {
  return hasAnyRole(user, ["EMPLOYEE", "ADMIN", "SUPER_ADMIN"]);
};

/**
 * Check if user is customer
 */
export const isCustomer = (user: User | null): boolean => {
  return hasRole(user, "CUSTOMER");
};

/**
 * Check if user is active (enabled and if employee, status is ACTIVE)
 */
export const isUserActive = (user: User | null): boolean => {
  if (!user || !user.isEnabled) return false;

  // If employee-specific status is set, check it
  if (user.employeeStatus && user.employeeStatus !== "ACTIVE") {
    return false;
  }

  return true;
};

/**
 * Get user's primary role (highest priority)
 */
export const getPrimaryRole = (user: User | null): RoleCode | null => {
  if (!user || !user.roles || user.roles.length === 0) return null;

  const roleHierarchy: RoleCode[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "EMPLOYEE",
    "CUSTOMER",
    "GUEST",
  ];

  for (const role of roleHierarchy) {
    if (user.roles.includes(role)) {
      return role;
    }
  }

  return user.roles[0] as RoleCode;
};

/**
 * Check if user can access a resource based on permissions
 */
export const canAccess = (
  user: User | null,
  requiredPermissions?: PermissionCode[],
  requiredRoles?: RoleCode[],
  requireAll: boolean = false,
): boolean => {
  if (!user) return false;

  // If both permissions and roles are specified
  if (requiredPermissions && requiredRoles) {
    const hasPerms = requireAll
      ? hasAllPermissions(user, requiredPermissions)
      : hasAnyPermission(user, requiredPermissions);

    const hasRoles = requireAll
      ? hasAllRoles(user, requiredRoles)
      : hasAnyRole(user, requiredRoles);

    return hasPerms && hasRoles;
  }

  // If only permissions are specified
  if (requiredPermissions) {
    return requireAll
      ? hasAllPermissions(user, requiredPermissions)
      : hasAnyPermission(user, requiredPermissions);
  }

  // If only roles are specified
  if (requiredRoles) {
    return requireAll
      ? hasAllRoles(user, requiredRoles)
      : hasAnyRole(user, requiredRoles);
  }

  // If no restrictions, allow access
  return true;
};

/**
 * Get user's display name (last two parts of full name or username)
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "";

  if (user.fullName) {
    const parts = user.fullName.trim().split(" ");
    if (parts.length <= 2) return user.fullName;
    return parts.slice(-2).join(" ");
  }

  return user.username || user.userName || "User";
};

/**
 * Get user's role label
 */
export const getRoleLabel = (role: RoleCode | null): string => {
  const labels: Record<RoleCode, string> = {
    SUPER_ADMIN: "Siêu quản trị viên",
    ADMIN: "Quản trị viên",
    EMPLOYEE: "Nhân viên",
    CUSTOMER: "Khách hàng",
    GUEST: "Khách vãng lai",
  };

  return role ? labels[role] : "Unknown";
};

/**
 * Get employee status label
 */
export const getEmployeeStatusLabel = (
  status: EmployeeStatus | undefined,
): string => {
  const labels: Record<EmployeeStatus, string> = {
    ACTIVE: "Đang hoạt động",
    LEAVE: "Nghỉ phép",
    INACTIVE: "Không hoạt động",
    RETIRED: "Nghỉ hưu",
  };

  return status ? labels[status] || status : "Unknown";
};
