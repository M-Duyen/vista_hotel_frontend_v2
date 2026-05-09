// User Types
export type UserType = "USER" | "CUSTOMER";

export type RoleCode =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE"
  | "STAFF"
  | "CUSTOMER";

export type PermissionCode =
  | "BOOKING_VIEW"
  | "BOOKING_CREATE"
  | "BOOKING_EDIT"
  | "BOOKING_DELETE"
  | "BOOKING_CANCEL"
  | "STAFF_VIEW"
  | "STAFF_CREATE"
  | "STAFF_EDIT"
  | "STAFF_DELETE"
  | "REPORT_VIEW"
  | "REPORT_CREATE"
  | "REPORT_DELETE"
  | "CUSTOMER_VIEW"
  | "CUSTOMER_EDIT"
  | "CUSTOMER_DELETE"
  | "ROOM_VIEW"
  | "ROOM_MANAGE";

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
