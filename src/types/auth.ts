// User Types
export type UserType = "USER" | "CUSTOMER";

export type RoleCode =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EMPLOYEE"
  | "CUSTOMER"
  | "GUEST";

export type PermissionCode =
  | "BOOKING_VIEW"
  | "booking_view"
  | "BOOKING_CREATE"
  | "booking_create"
  | "BOOKING_EDIT"
  | "booking_edit"
  | "BOOKING_DELETE"
  | "booking_delete"
  | "BOOKING_CANCEL"
  | "booking_cancel"
  | "EMPLOYEE_VIEW"
  | "employee_view"
  | "EMPLOYEE_CREATE"
  | "employee_create"
  | "EMPLOYEE_EDIT"
  | "employee_edit"
  | "EMPLOYEE_DELETE"
  | "employee_delete"
  | "REPORT_VIEW"
  | "report_view"
  | "REPORT_CREATE"
  | "report_create"
  | "REPORT_DELETE"
  | "report_delete"
  | "CUSTOMER_VIEW"
  | "customer_view"
  | "CUSTOMER_EDIT"
  | "customer_edit"
  | "CUSTOMER_DELETE"
  | "customer_delete"
  | "ROOM_VIEW"
  | "room_view"
  | "ROOM_MANAGE"
  | "room_manage";

export type EmployeeStatus = "ACTIVE" | "LEAVE" | "INACTIVE" | "RETIRED";

// User Data Structure
export interface User {
  id: string;
  email: string;
  username?: string;
  userName?: string; // Legacy compatibility
  phone?: string;
  fullName: string;
  address?: string;
  avatarUrl?: string | null;
  // Employee specific fields
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: string; // ISO date
  employeeStatus?: EmployeeStatus;
  adminLevel?: number;
  // Status
  isEnabled: boolean;
  // Relations
  roles: string[]; // Role codes (ADMIN, EMPLOYEE, etc.)
  permissions: string[]; // Permission codes
  // Metadata
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
  // Legacy fields
  userRole?: string;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Permission Check Utilities
export interface PermissionCheckOptions {
  requireAll?: boolean; // Check if user has ALL permissions
  requireAny?: boolean; // Check if user has ANY permission (default)
}

export interface RoleCheckOptions {
  requireAll?: boolean; // Check if user has ALL roles
  requireAny?: boolean; // Check if user has ANY role (default)
}

// Route Protection
export interface ProtectedRouteProps {
  requiredRoles?: RoleCode[];
  requiredPermissions?: PermissionCode[];
  fallback?: React.ReactNode;
}

// Dashboard Configuration
export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  requiredPermissions?: PermissionCode[];
  requiredRoles?: RoleCode[];
  children?: MenuItem[];
}

export interface DashboardConfig {
  role: RoleCode;
  menuItems: MenuItem[];
  defaultPath: string;
  widgets: string[]; // Widget types to display
}
