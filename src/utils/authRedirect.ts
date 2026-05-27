const normalizeRole = (role?: string): string =>
  (role || "").trim().toUpperCase().replace(/^ROLE_/, "");

export const getDefaultRouteForRoles = (roles?: string[], userRole?: string): string => {
  const normalizedRoles = (roles || []).map(normalizeRole);
  const primaryRole = normalizeRole(userRole || normalizedRoles[0]);

  if (primaryRole === "ADMIN" || normalizedRoles.includes("ADMIN")) {
    return "/admin";
  }

  if (primaryRole === "EMPLOYEE" || normalizedRoles.includes("EMPLOYEE")) {
    return "/employee";
  }

  if (primaryRole === "CUSTOMER" || normalizedRoles.includes("CUSTOMER")) {
    return "/";
  }

  return "/";
};
