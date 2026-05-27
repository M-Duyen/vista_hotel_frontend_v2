// User Types
export type UserType = "USER" | "CUSTOMER";

export type RoleCode =
  | "ADMIN"
  | "EMPLOYEE"
  | "CUSTOMER"
  | "GUEST";

export type PermissionCode =
  | "booking_view"
  | "booking_create"
  | "booking_edit"
  | "booking_delete"
  | "booking_cancel"
  | "booking_checkin"
  | "booking_checkout"
  | "booking_manage"
  | "customer_view"
  | "customer_create"
  | "customer_edit"
  | "customer_delete"
  | "employee_view"
  | "employee_create"
  | "employee_edit"
  | "employee_delete"
  | "room_view"
  | "room_manage"
  | "room_type_manage"
  | "service_view"
  | "service_manage"
  | "news_view"
  | "news_manage"
  | "promotion_view"
  | "promotion_manage"
  | "promotion_type_manage"
  | "voucher_view"
  | "voucher_manage"
  | "review_manage"
  | "pricing_manage"
  | "report_view"
  | "report_create"
  | "report_delete"
  | "analytics_view"
  | "ai_chat";

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
