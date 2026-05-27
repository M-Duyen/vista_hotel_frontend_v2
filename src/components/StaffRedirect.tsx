import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { getDefaultRouteForRoles } from "@/utils/authRedirect";

interface StaffRedirectProps {
  children: React.ReactNode;
}

const getRoles = (roles?: string[], userRole?: string): string[] => [
  ...(roles || []),
  ...(userRole ? [userRole] : []),
];

const hasStaffRole = (roles: string[]): boolean =>
  roles
    .map((role) => role.trim().toUpperCase().replace(/^ROLE_/, ""))
    .some((role) => role === "ADMIN" || role === "EMPLOYEE");

const StaffRedirect: React.FC<StaffRedirectProps> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return null;
  }

  const roles = getRoles(user?.roles, user?.userRole);

  if (isAuthenticated && user && hasStaffRole(roles)) {
    return (
      <Navigate
        to={getDefaultRouteForRoles(user.roles, user.userRole)}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default StaffRedirect;
