import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { canAccess } from "@/utils/permissions";
import type { PermissionCode, RoleCode } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleCode[];
  requiredPermissions?: PermissionCode[];
  requireAll?: boolean; // Require all permissions/roles (false = require any)
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Checks user authentication and authorization before rendering children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
  requireAll = false,
  fallback,
  redirectTo = "/auth/login",
}) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return fallback ? <>{fallback}</> : null;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check access
  const hasAccess = canAccess(
    user,
    requiredPermissions,
    requiredRoles,
    requireAll,
  );

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
